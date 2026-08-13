"""
models.py - SQLModel tables
===========================
Two tables:
- Rack       : a physical rack, identified by a human label (e.g. "A01").
- Detection  : one prediction event. Powers History, Tracking and Reports.
               A bag's *current* status is its latest Detection by captured_at.
"""
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Rack(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)  # human label, e.g. "A01"
    created_at: datetime = Field(default_factory=utcnow)


class Detection(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    rack_id: int = Field(foreign_key="rack.id", index=True)
    bag_id: str = Field(index=True)  # human label, e.g. "B15"
    prediction: str = Field(index=True)  # "healthy" | "green_mold" | "black_mold"
    confidence: float = 0.0
    notes: Optional[str] = None
    image: Optional[str] = None  # basename stored under outputs/
    bbox: Optional[List[float]] = Field(default=None, sa_column=Column(JSON))
    image_width: int = 0
    image_height: int = 0
    inference_time_ms: Optional[float] = None
    captured_at: datetime = Field(default_factory=utcnow, index=True)
    created_at: datetime = Field(default_factory=utcnow)
