"""
mushroom_gate.py - Zero-shot "is this a mushroom bag?" pre-check using CLIP.

The YOLO model only knows disease classes, so a non-mushroom photo would be
reported as "healthy". This gate scores an image against mushroom-bag prompts vs
unrelated prompts and rejects clearly non-mushroom images before detection.

Fail-safe: if CLIP or its weights can't load, the gate is disabled and every
image is allowed through (logged once). Tunable via env vars:
  OYSTER_DISABLE_MUSHROOM_GATE=1   -> turn the gate off
  OYSTER_MUSHROOM_THRESHOLD=0.35   -> min mushroom probability to allow (0-1)
"""
import io
import os
import threading
from typing import Tuple

from PIL import Image

_MODEL = None
_PREPROCESS = None
_TEXT_FEATURES = None
_LABELS = None  # parallel list of bool: True = "is mushroom" prompt
_load_failed = False
_lock = threading.Lock()

_DISABLED = os.getenv("OYSTER_DISABLE_MUSHROOM_GATE", "").lower() in ("1", "true", "yes")
_THRESHOLD = float(os.getenv("OYSTER_MUSHROOM_THRESHOLD", "0.35"))

POSITIVE_PROMPTS = [
    "a photo of oyster mushrooms",
    "a close-up photo of a mushroom growing bag",
    "a mushroom cultivation substrate bag",
    "white oyster mushrooms growing on a bag",
]
NEGATIVE_PROMPTS = [
    "a photo of a person",
    "a photo of an animal",
    "a photo of a landscape or a building",
    "a photo of a vehicle or a random object",
    "a screenshot or a document",
    "a plate of food that is not mushrooms",
]


def _ensure_loaded() -> None:
    global _MODEL, _PREPROCESS, _TEXT_FEATURES, _LABELS, _load_failed
    if _MODEL is not None or _DISABLED or _load_failed:
        return
    with _lock:
        if _MODEL is not None or _load_failed:
            return
        try:
            import torch
            import open_clip

            model, _, preprocess = open_clip.create_model_and_transforms(
                "ViT-B-32", pretrained="openai"
            )
            model.eval()
            tokenizer = open_clip.get_tokenizer("ViT-B-32")

            prompts = POSITIVE_PROMPTS + NEGATIVE_PROMPTS
            labels = [True] * len(POSITIVE_PROMPTS) + [False] * len(NEGATIVE_PROMPTS)
            with torch.no_grad():
                text = tokenizer(prompts)
                tf = model.encode_text(text)
                tf = tf / tf.norm(dim=-1, keepdim=True)

            _MODEL = model
            _PREPROCESS = preprocess
            _TEXT_FEATURES = tf
            _LABELS = labels
            print("[OK] Mushroom gate (CLIP ViT-B-32) loaded.")
        except Exception as e:  # noqa: BLE001
            _load_failed = True
            print(f"[WARN] Mushroom gate unavailable, images won't be pre-filtered: {e}")


def load() -> None:
    """Preload the model at startup so the first request isn't slow."""
    if _DISABLED:
        print("[INIT] Mushroom gate disabled via env.")
        return
    _ensure_loaded()


def is_mushroom(image_bytes: bytes) -> Tuple[bool, float]:
    """
    Returns (allowed, mushroom_probability).
    `allowed` is True when the image looks like a mushroom bag, or when the gate
    is disabled/unavailable (fail-open).
    """
    if _DISABLED:
        return True, 1.0
    _ensure_loaded()
    if _MODEL is None:  # load failed
        return True, 1.0

    try:
        import torch

        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        x = _PREPROCESS(img).unsqueeze(0)
        with torch.no_grad():
            feat = _MODEL.encode_image(x)
            feat = feat / feat.norm(dim=-1, keepdim=True)
            probs = (100.0 * feat @ _TEXT_FEATURES.T).softmax(dim=-1)[0]
        mushroom_prob = float(
            sum(probs[i].item() for i, is_m in enumerate(_LABELS) if is_m)
        )
        return mushroom_prob >= _THRESHOLD, mushroom_prob
    except Exception as e:  # noqa: BLE001
        # Never block a prediction because the gate errored.
        print(f"[WARN] Mushroom gate check failed, allowing image: {e}")
        return True, 1.0
