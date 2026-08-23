"""
app.py - FastAPI service for Oyster Mushroom Disease Detection
=============================================================
Inference:
  GET  /                 service info
  GET  /health           health check
  POST /predict          upload image -> detection result

Data / persistence (SQLite):
  GET    /racks              list racks
  GET    /rack/{rack_id}     rack detail + per-bag status (Tracking)
  POST   /bag                save a prediction (History/Tracking source of truth)
  GET    /history            paginated + filtered detections
  GET    /history/{id}       single detection (Detail)
  DELETE /history/{id}       delete a detection
  GET    /reports/summary    aggregate counts
  GET    /reports/pdf        PDF (?id= single, else aggregate over filters)
  GET    /reports/excel      CSV export (XLSX deferred)

Static:
  GET  /outputs/<file>   annotated prediction images
"""
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response, StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

import inference
import reports
import repository
from db import get_session, init_db
from domain import DISEASE_CLASSES
from models import Detection, Rack
from repository import OUTPUTS_DIR
from schemas import (
    BagCreate,
    DetectionOut,
    HistoryPage,
    RackDetailOut,
    RackOut,
    ReportSummary,
)

DEFAULT_RACKS = ["A01", "A02", "A03"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    OUTPUTS_DIR.mkdir(exist_ok=True)
    init_db()
    _seed_racks()
    print("[INIT] Loading model...")
    try:
        inference.load_model()
        print("[OK] Model loaded and ready!")
    except FileNotFoundError as e:
        print(f"[WARN] {e}")
        print("   The API will start but /predict will fail until a model is available.")
    yield
    print("[SHUTDOWN] Shutting down...")


def _seed_racks():
    from db import engine

    with Session(engine) as session:
        existing = {r.name for r in session.exec(select(Rack)).all()}
        for name in DEFAULT_RACKS:
            if name not in existing:
                session.add(Rack(name=name))
        session.commit()


app = FastAPI(
    title="Oyster Mushroom Disease Detection API",
    description=(
        "Detects green_mold (Trichoderma) and black_mold in oyster mushroom images, "
        "and persists detections for tracking, history and reporting."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve annotated prediction images.
OUTPUTS_DIR.mkdir(exist_ok=True)
app.mount("/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")


# =====================================================================
# Inference
# =====================================================================
@app.get("/")
async def root():
    return {
        "service": "Oyster Mushroom Disease Detection",
        "status": "running",
        "model_loaded": inference._model is not None,
        "version": "2.0.0",
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": inference._model is not None,
        "model_path": inference._model_path,
    }


def _derive_prediction(result_dict: dict) -> str:
    """Map the raw inference output to a single app-level class label."""
    if result_dict["status"] == "healthy" or not result_dict["detections"]:
        return "healthy"
    top = max(result_dict["detections"], key=lambda d: d["confidence"])
    return top["class"]


@app.post("/predict")
async def predict(
    file: UploadFile = File(..., description="Image file (JPG, PNG, etc.)"),
    confidence: float = 0.25,
):
    if inference._model is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    allowed_types = {"image/jpeg", "image/png", "image/bmp", "image/webp", "image/tiff"}
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}")

    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {e}")

    try:
        start = time.time()
        result = inference.predict(contents, conf=confidence)
        elapsed = time.time() - start
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")

    response = result.to_dict()
    filename = repository.normalize_image(response.get("annotated_image"))
    response["annotated_image"] = filename
    response["image_url"] = repository.image_url(filename)
    response["prediction"] = _derive_prediction(response)
    response["confidence"] = (
        round(max((d["confidence"] for d in response["detections"]), default=0.0), 4)
    )
    response["inference_time_ms"] = round(elapsed * 1000, 2)
    response["image_size"] = {"width": result.image_width, "height": result.image_height}
    response["filename"] = file.filename
    return JSONResponse(content=response)


# =====================================================================
# Racks
# =====================================================================
@app.get("/racks", response_model=list[RackOut])
def list_racks(session: Session = Depends(get_session)):
    return session.exec(select(Rack).order_by(Rack.name)).all()


@app.get("/rack/{rack_id}", response_model=RackDetailOut)
def get_rack(rack_id: int, session: Session = Depends(get_session)):
    detail = repository.rack_detail(session, rack_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Rack not found")
    return detail


# =====================================================================
# Bags / detections
# =====================================================================
@app.post("/bag", response_model=DetectionOut, status_code=201)
def create_bag(payload: BagCreate, session: Session = Depends(get_session)):
    if payload.prediction not in DISEASE_CLASSES:
        raise HTTPException(status_code=400, detail=f"Invalid prediction: {payload.prediction}")

    rack = repository.get_or_create_rack(session, payload.rack_id)
    filename = repository.normalize_image(payload.image)
    if filename and not (OUTPUTS_DIR / filename).exists():
        # tolerate a missing file (don't hard-fail the save) but drop the ref
        filename = None

    det = Detection(
        rack_id=rack.id,
        bag_id=payload.bag_id.strip(),
        prediction=payload.prediction,
        confidence=payload.confidence,
        notes=payload.notes,
        image=filename,
        bbox=payload.bbox,
        image_width=payload.image_width,
        image_height=payload.image_height,
        inference_time_ms=payload.inference_time_ms,
        captured_at=payload.captured_at or datetime.now(timezone.utc),
    )
    session.add(det)
    session.commit()
    session.refresh(det)
    return repository.to_detection_out(det, rack.name)


# =====================================================================
# History
# =====================================================================
@app.get("/history", response_model=HistoryPage)
def get_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: Optional[str] = None,
    disease: Optional[str] = None,
    rack_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    session: Session = Depends(get_session),
):
    items, total = repository.history_page(
        session, page, page_size, q, disease, rack_id, date_from, date_to
    )
    return HistoryPage(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        has_more=page * page_size < total,
    )


@app.get("/history/{det_id}", response_model=DetectionOut)
def get_history_item(det_id: int, session: Session = Depends(get_session)):
    det = session.get(Detection, det_id)
    if det is None:
        raise HTTPException(status_code=404, detail="Record not found")
    rack = session.get(Rack, det.rack_id)
    return repository.to_detection_out(det, rack.name if rack else "")


@app.delete("/history/{det_id}", status_code=204)
def delete_history_item(det_id: int, session: Session = Depends(get_session)):
    det = session.get(Detection, det_id)
    if det is None:
        raise HTTPException(status_code=404, detail="Record not found")
    session.delete(det)
    session.commit()
    return Response(status_code=204)


# =====================================================================
# Reports
# =====================================================================
@app.get("/reports/summary", response_model=ReportSummary)
def reports_summary(session: Session = Depends(get_session)):
    return repository.report_summary(session)


@app.get("/reports/pdf")
def reports_pdf(
    id: Optional[int] = None,
    q: Optional[str] = None,
    disease: Optional[str] = None,
    rack_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    session: Session = Depends(get_session),
):
    if id is not None:
        det = session.get(Detection, id)
        if det is None:
            raise HTTPException(status_code=404, detail="Record not found")
        rack = session.get(Rack, det.rack_id)
        out = repository.to_detection_out(det, rack.name if rack else "")
        pdf_bytes = reports.build_single_pdf(out)
        fname = f"report_{id:05d}.pdf"
    else:
        summary = repository.report_summary(session)
        items, _ = repository.history_page(
            session, 1, 100, q, disease, rack_id, date_from, date_to
        )
        pdf_bytes = reports.build_summary_pdf(summary, items)
        fname = "oyster_summary_report.pdf"

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )


@app.get("/reports/excel")
def reports_excel(
    q: Optional[str] = None,
    disease: Optional[str] = None,
    rack_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    session: Session = Depends(get_session),
):
    items, _ = repository.history_page(session, 1, 100, q, disease, rack_id, date_from, date_to)
    csv_bytes = reports.build_csv(items)
    return StreamingResponse(
        iter([csv_bytes]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="oyster_report.csv"'},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
