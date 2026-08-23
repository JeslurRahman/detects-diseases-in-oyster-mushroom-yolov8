"""
inference.py - Oyster Mushroom Disease Detection Inference Module
================================================================
Loads trained YOLOv8 model and performs inference on images.
Returns detections with status (healthy/infected).

Rules:
  - No detections → status = "healthy"
  - Any detection → status = "infected"
"""
import io
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field
from PIL import Image
import numpy as np

# Lazy load to avoid import errors when ultralytics not installed yet
_model = None
_model_path = None

CLASS_NAMES = {0: "green_mold", 1: "black_mold"}
DEFAULT_CONF_THRESHOLD = 0.25
DEFAULT_IOU_THRESHOLD = 0.45


@dataclass
class Detection:
    class_name: str
    confidence: float
    bbox: list  # [x1, y1, x2, y2] in pixels


@dataclass
class PredictionResult:
    status: str  # "healthy" or "infected"
    detections: list = field(default_factory=list)
    image_width: int = 0
    image_height: int = 0

    def to_dict(self) -> dict:
        return {
            "status": self.status,
            "detections": [
                {
                    "class": d.class_name,
                    "confidence": round(d.confidence, 4),
                    "bbox": [round(v, 2) for v in d.bbox],
                }
                for d in self.detections
            ],
        }


def load_model(model_path: Optional[str] = None) -> None:
    """Load YOLOv8 model from path."""
    global _model, _model_path
    from ultralytics import YOLO

    if model_path is None:
        # Default: look for best.pt in project root
        base = Path(__file__).resolve().parent
        candidates = [
            base / "best.pt",
            base / "runs" / "detect" / "oyster_disease_s" / "weights" / "best.pt",
            base / "runs" / "detect" / "oyster_disease_n" / "weights" / "best.pt",
        ]
        for c in candidates:
            if c.exists():
                model_path = str(c)
                break
        if model_path is None:
            raise FileNotFoundError(
                "No trained model found. Train a model first with 03_train.py"
            )

    _model = YOLO(model_path)
    _model_path = model_path
    print(f"✅ Model loaded: {model_path}")


def predict(
    image,
    conf: float = DEFAULT_CONF_THRESHOLD,
    iou: float = DEFAULT_IOU_THRESHOLD,
) -> PredictionResult:
    """
    Run inference on an image.

    Args:
        image: PIL.Image, numpy array, file path, or bytes
        conf: Confidence threshold
        iou: IoU threshold for NMS

    Returns:
        PredictionResult with status and detections
    """
    global _model
    if _model is None:
        load_model()

    # Handle different input types
    if isinstance(image, bytes):
        image = Image.open(io.BytesIO(image))
    elif isinstance(image, str) or isinstance(image, Path):
        image = Image.open(image)
    
    if isinstance(image, Image.Image):
        img_array = np.array(image)
        h, w = img_array.shape[:2]
    elif isinstance(image, np.ndarray):
        h, w = image.shape[:2]
        img_array = image
    else:
        raise ValueError(f"Unsupported image type: {type(image)}")

    # Run inference
    results = _model.predict(
        source=img_array,
        conf=conf,
        iou=iou,
        verbose=False,
    )

    detections = []
    if results and len(results) > 0:
        result = results[0]
        if result.boxes is not None and len(result.boxes) > 0:
            for box in result.boxes:
                cls_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                class_name = CLASS_NAMES.get(cls_id, f"class_{cls_id}")
                detections.append(Detection(
                    class_name=class_name,
                    confidence=confidence,
                    bbox=[x1, y1, x2, y2],
                ))

    status = "infected" if detections else "healthy"
    return PredictionResult(
        status=status,
        detections=detections,
        image_width=w,
        image_height=h,
    )


# ── CLI usage ──
if __name__ == "__main__":
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python inference.py <image_path> [model_path]")
        sys.exit(1)

    img_path = sys.argv[1]
    mdl_path = sys.argv[2] if len(sys.argv) > 2 else None

    if mdl_path:
        load_model(mdl_path)

    result = predict(img_path)
    print(json.dumps(result.to_dict(), indent=2))
