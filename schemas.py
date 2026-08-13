"""
schemas.py - Pydantic request/response models for the data endpoints.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------- Racks
class RackOut(BaseModel):
    id: int
    name: str


# ---------------------------------------------------------------- Bag / Detection
class BagCreate(BaseModel):
    """
    Saved right after a successful /predict.
    `rack_id` here is the human rack *label* typed on the Capture screen
    (e.g. "A03"); the backend resolves/creates the Rack row from it.
    `image` is the annotated_image value returned by /predict (path or filename).
    """
    rack_id: str = Field(..., description="Human rack label, e.g. 'A03'")
    bag_id: str
    prediction: str  # healthy | green_mold | black_mold
    confidence: float = 0.0
    notes: Optional[str] = None
    image: Optional[str] = None
    bbox: Optional[List[float]] = None
    image_width: int = 0
    image_height: int = 0
    inference_time_ms: Optional[float] = None
    captured_at: Optional[datetime] = None


class DetectionOut(BaseModel):
    id: int
    rack_id: int
    rack_name: str
    bag_id: str
    prediction: str
    disease_display: str
    scientific_name: Optional[str]
    confidence: float
    notes: Optional[str]
    image: Optional[str]
    image_url: Optional[str]
    bbox: Optional[List[float]]
    image_width: int
    image_height: int
    inference_time_ms: Optional[float]
    recommendation: str
    captured_at: datetime
    created_at: datetime


# ---------------------------------------------------------------- Rack detail (Tracking)
class BagStatus(BaseModel):
    bag_id: str
    status: str  # healthy | green_mold | black_mold
    detection_id: int
    confidence: float
    captured_at: datetime


class RackDetailOut(BaseModel):
    rack_id: int
    rack_name: str
    total_bags: int
    healthy: int
    green_mold: int
    black_mold: int
    infected: int
    last_updated: Optional[datetime]
    bags: List[BagStatus]


# ---------------------------------------------------------------- History (paginated)
class HistoryPage(BaseModel):
    items: List[DetectionOut]
    total: int
    page: int
    page_size: int
    has_more: bool


# ---------------------------------------------------------------- Reports
class ReportSummary(BaseModel):
    total: int
    healthy: int
    green_mold: int
    black_mold: int
    contaminated: int
    today: int
    week: int
    month: int
