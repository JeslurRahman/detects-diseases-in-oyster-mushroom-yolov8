"""
inference.py - Oyster Mushroom Disease Detection Inference Module
================================================================
Loads trained YOLOv8 model and performs inference on images.
Returns detections with status (healthy/infected) + annotated image.
"""

import io
import uuid
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field

from PIL import Image
import numpy as np
import cv2

_model = None
_model_path = None

CLASS_NAMES = {
    0: "green_mold",
    1: "black_mold"
}

DEFAULT_CONF_THRESHOLD = 0.25
DEFAULT_IOU_THRESHOLD = 0.45


# -----------------------------
# DATA CLASSES
# -----------------------------
@dataclass
class Detection:
    class_name: str
    confidence: float
    bbox: list


@dataclass
class PredictionResult:
    status: str
    detections: list = field(default_factory=list)
    image_width: int = 0
    image_height: int = 0
    annotated_image_path: Optional[str] = None

    def to_dict(self):
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
            "annotated_image": self.annotated_image_path,
        }


# -----------------------------
# LOAD MODEL
# -----------------------------
def load_model(model_path=None):
    global _model, _model_path
    from ultralytics import YOLO

    if model_path is None:
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
            raise FileNotFoundError("No trained model found")

    _model = YOLO(model_path)
    _model_path = model_path
    print(f"Model loaded: {_model_path}")


# -----------------------------
# SAVE ANNOTATED IMAGE
# -----------------------------
def save_annotated_image(result):
    annotated = result.plot()

    output_dir = Path("outputs")
    output_dir.mkdir(exist_ok=True)

    filename = f"{uuid.uuid4().hex}.jpg"
    output_path = output_dir / filename

    cv2.imwrite(str(output_path), annotated)

    return str(output_path)


# -----------------------------
# PREDICTION FUNCTION
# -----------------------------
def predict(image, conf=DEFAULT_CONF_THRESHOLD, iou=DEFAULT_IOU_THRESHOLD):
    global _model

    if _model is None:
        load_model()

    # Convert input
    if isinstance(image, bytes):
        image = Image.open(io.BytesIO(image))
    elif isinstance(image, (str, Path)):
        image = Image.open(image)

    if isinstance(image, Image.Image):
        img_array = np.array(image)
        h, w = img_array.shape[:2]
    elif isinstance(image, np.ndarray):
        img_array = image
        h, w = image.shape[:2]
    else:
        raise ValueError(f"Unsupported image type: {type(image)}")

    # Run inference
    results = _model.predict(
        source=img_array,
        conf=conf,
        iou=iou,
        verbose=False
    )

    detections = []
    annotated_path = None

    if results and len(results) > 0:
        result = results[0]

        # Save image with bounding boxes
        annotated_path = save_annotated_image(result)

        if result.boxes is not None and len(result.boxes) > 0:
            for box in result.boxes:
                cls_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())

                if confidence < 0.25:
                    continue

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                class_name = CLASS_NAMES.get(cls_id, f"class_{cls_id}")

                detections.append(
                    Detection(
                        class_name=class_name,
                        confidence=confidence,
                        bbox=[x1, y1, x2, y2]
                    )
                )

    status = "infected" if detections else "healthy"

    return PredictionResult(
        status=status,
        detections=detections,
        image_width=w,
        image_height=h,
        annotated_image_path=annotated_path
    )


# -----------------------------
# CLI TEST
# -----------------------------
if __name__ == "__main__":
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python inference.py <image_path>")
        sys.exit(1)

    img_path = sys.argv[1]

    result = predict(img_path)
    print(json.dumps(result.to_dict(), indent=2))