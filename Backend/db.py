"""
db.py - Database engine & session management (SQLite via SQLModel)
==================================================================
Holds the SQLite engine, table creation, and a FastAPI session dependency.
The DB file lives next to this module as `oyster.db`.
"""
from pathlib import Path
from typing import Iterator

from sqlmodel import SQLModel, Session, create_engine

DB_PATH = Path(__file__).resolve().parent / "oyster.db"

# check_same_thread=False so the connection can be shared across FastAPI's threads.
engine = create_engine(
    f"sqlite:///{DB_PATH}",
    echo=False,
    connect_args={"check_same_thread": False},
)


def init_db() -> None:
    """Create all tables. Importing models registers them on SQLModel.metadata."""
    import models  # noqa: F401  (side-effect: registers Rack/Detection tables)

    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    """FastAPI dependency yielding a DB session."""
    with Session(engine) as session:
        yield session
