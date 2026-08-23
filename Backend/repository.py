"""
repository.py - Data-access helpers shared by the API routes and reports.
Keeps SQL/aggregation logic out of app.py.
"""
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional, Tuple

from sqlmodel import Session, select, func

import domain
from models import Detection, Rack
from schemas import (
    BagStatus,
    DetectionOut,
    RackDetailOut,
    ReportSummary,
)

OUTPUTS_DIR = Path(__file__).resolve().parent / "outputs"


# ------------------------------------------------------------------ helpers
def normalize_image(image: Optional[str]) -> Optional[str]:
    """Reduce a /predict image value (path or filename) to a bare basename."""
    if not image:
        return None
    return Path(image).name


def image_url(filename: Optional[str]) -> Optional[str]:
    return f"/outputs/{filename}" if filename else None


def get_or_create_rack(session: Session, label: str) -> Rack:
    label = label.strip()
    rack = session.exec(select(Rack).where(Rack.name == label)).first()
    if rack is None:
        rack = Rack(name=label)
        session.add(rack)
        session.commit()
        session.refresh(rack)
    return rack


def to_detection_out(det: Detection, rack_name: str) -> DetectionOut:
    return DetectionOut(
        id=det.id,
        rack_id=det.rack_id,
        rack_name=rack_name,
        bag_id=det.bag_id,
        prediction=det.prediction,
        disease_display=domain.DISPLAY_NAME.get(det.prediction, det.prediction),
        scientific_name=domain.SCIENTIFIC_NAME.get(det.prediction),
        confidence=round(det.confidence, 4),
        notes=det.notes,
        image=det.image,
        image_url=image_url(det.image),
        bbox=det.bbox,
        image_width=det.image_width,
        image_height=det.image_height,
        inference_time_ms=det.inference_time_ms,
        recommendation=domain.recommendation_for(det.prediction),
        captured_at=det.captured_at,
        created_at=det.created_at,
    )


def _rack_name_map(session: Session) -> dict:
    return {r.id: r.name for r in session.exec(select(Rack)).all()}


# ------------------------------------------------------------------ rack detail
def rack_detail(session: Session, rack_id: int) -> Optional[RackDetailOut]:
    rack = session.get(Rack, rack_id)
    if rack is None:
        return None

    rows = session.exec(
        select(Detection)
        .where(Detection.rack_id == rack_id)
        .order_by(Detection.captured_at.desc())
    ).all()

    # latest detection wins per bag
    latest: dict = {}
    for det in rows:
        if det.bag_id not in latest:
            latest[det.bag_id] = det

    bags: List[BagStatus] = []
    counts = {domain.HEALTHY: 0, domain.GREEN_MOLD: 0, domain.BLACK_MOLD: 0}
    last_updated: Optional[datetime] = None
    for bag_id, det in latest.items():
        counts[det.prediction] = counts.get(det.prediction, 0) + 1
        bags.append(
            BagStatus(
                bag_id=bag_id,
                status=det.prediction,
                detection_id=det.id,
                confidence=round(det.confidence, 4),
                captured_at=det.captured_at,
            )
        )
        if last_updated is None or det.captured_at > last_updated:
            last_updated = det.captured_at

    bags.sort(key=lambda b: b.bag_id)
    infected = counts[domain.GREEN_MOLD] + counts[domain.BLACK_MOLD]
    return RackDetailOut(
        rack_id=rack.id,
        rack_name=rack.name,
        total_bags=len(latest),
        healthy=counts[domain.HEALTHY],
        green_mold=counts[domain.GREEN_MOLD],
        black_mold=counts[domain.BLACK_MOLD],
        infected=infected,
        last_updated=last_updated,
        bags=bags,
    )


# ------------------------------------------------------------------ history
def _history_query(
    q: Optional[str],
    disease: Optional[str],
    rack_id: Optional[int],
    date_from: Optional[datetime],
    date_to: Optional[datetime],
):
    stmt = select(Detection, Rack).join(Rack, Detection.rack_id == Rack.id)
    if disease and disease in domain.DISEASE_CLASSES:
        stmt = stmt.where(Detection.prediction == disease)
    if rack_id is not None:
        stmt = stmt.where(Detection.rack_id == rack_id)
    if date_from is not None:
        stmt = stmt.where(Detection.captured_at >= date_from)
    if date_to is not None:
        stmt = stmt.where(Detection.captured_at <= date_to)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where((Rack.name.ilike(like)) | (Detection.bag_id.ilike(like)))
    return stmt


def history_page(
    session: Session,
    page: int = 1,
    page_size: int = 20,
    q: Optional[str] = None,
    disease: Optional[str] = None,
    rack_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
) -> Tuple[List[DetectionOut], int]:
    page = max(1, page)
    page_size = max(1, min(page_size, 100))

    base = _history_query(q, disease, rack_id, date_from, date_to)
    total = len(session.exec(base).all())

    rows = session.exec(
        base.order_by(Detection.captured_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    items = [to_detection_out(det, rack.name) for det, rack in rows]
    return items, total


# ------------------------------------------------------------------ summary
def report_summary(session: Session) -> ReportSummary:
    def count_where(*conds) -> int:
        stmt = select(func.count()).select_from(Detection)
        for c in conds:
            stmt = stmt.where(c)
        return session.exec(stmt).one()

    now = datetime.now(timezone.utc)
    start_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_week = start_today - timedelta(days=start_today.weekday())
    start_month = start_today.replace(day=1)

    total = count_where()
    healthy = count_where(Detection.prediction == domain.HEALTHY)
    green = count_where(Detection.prediction == domain.GREEN_MOLD)
    black = count_where(Detection.prediction == domain.BLACK_MOLD)
    return ReportSummary(
        total=total,
        healthy=healthy,
        green_mold=green,
        black_mold=black,
        contaminated=green + black,
        today=count_where(Detection.captured_at >= start_today),
        week=count_where(Detection.captured_at >= start_week),
        month=count_where(Detection.captured_at >= start_month),
    )
