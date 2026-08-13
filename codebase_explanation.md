# Oyster Mushroom Disease Detection — Codebase Walkthrough

This project is an **end-to-end computer-vision pipeline** that detects two fungal diseases — **green mold (Trichoderma)** and **black mold** — in oyster mushroom images using **YOLOv8**. If neither disease is detected, the mushroom is reported as **healthy**.

The pipeline is split into **numbered stages** (01 → 03) that run sequentially, plus runtime modules (`inference.py`, `app.py`) that consume the trained model.

---

## High-level flow

```
Raw datasets ─▶ 01 inspect ─▶ 02 prepare ─▶ 03 train ─▶ best.pt
                                                          │
                                                          ▼
                                          inference.py  ◀──── used by ────▶  app.py (FastAPI)
```

---

## File-by-file breakdown

### 1. [01_inspect_datasets.py](01_inspect_datasets.py) — Dataset Inspection

**Purpose:** Audit raw data sources before doing anything else. It reports *what's in each dataset folder, what format it's in, how many images vs. labels exist, and which class IDs appear*.

**How it works:**
- `count_by_ext(d)` — walks a directory and counts files by extension to see how many images vs `.txt` label files exist.
- `has_yolo(d)` — checks for the canonical YOLO layout (`images/` + `labels/` subfolders) at either the top level or one level down.
- `inspect(name, d)` — combines the above; if the dataset is YOLO-formatted, it peeks inside up to 50 label files to collect class IDs and parses any `*.yaml` config to extract class names.
- `main()` — runs `inspect` against the three known source folders ([trichoderma](datasets/trichoderma/), [black_mould/Black Mould](datasets/black_mould/), [oyster_healthy/Oyster Mushroom.yolov8](datasets/oyster_healthy/)) and prints a decision summary explaining each dataset's role:
  - `trichoderma` → 292 raw images, **no bboxes** → flagged for full-image labeling.
  - `black_mould` → 216 raw images, **no bboxes** → same treatment.
  - `oyster_healthy` → 2,234 YOLO-labeled images (labels are about *harvest readiness*, not disease) → reuse images as **healthy** by stripping their labels.

It writes nothing — purely diagnostic.

---

### 2. [02_prepare_dataset.py](02_prepare_dataset.py) — Dataset Standardization & Merging

**Purpose:** Convert the three heterogeneous source folders into a **single unified YOLOv8 dataset** at [datasets/final/](datasets/final/) with `data.yaml`, an 80/20 train/val split, and consistent class IDs (`0=green_mold, 1=black_mold`).

**How it works (step by step):**

1. **`clean_final_dir()`** — wipes `datasets/final/` and recreates `images/{train,val}/` + `labels/{train,val}/`.
2. **`process_oyster_healthy()`** — pulls images from the healthy folder. Returns `(src_path, new_name, None)` tuples; `None` means *no label file* — and per YOLO convention that means the image contains no objects, i.e. healthy.
3. **`process_classification_disease()`** — for the trichoderma/black mould folders, which are *classification* datasets (the diseased tissue fills the whole frame), this generates a **full-image bounding box**: `class_id 0.5 0.5 1.0 1.0` (centered, full width/height in normalized coords). It also calls `is_valid_image()` to skip files <5 KB or that PIL can't open.
4. **`process_annotated_yolo()`** *(optional path)* — if you place properly annotated Roboflow exports at `datasets/annotated_green_mold/` or `datasets/annotated_black_mold/`, this function detects the layout (multiple variants supported), reads the existing label files, and **rewrites each row's class ID** to the unified `0` or `1`. This path *replaces* the full-image bbox shortcut.
5. **`split_and_copy()`** — `random.shuffle` (seeded with 42 for reproducibility) and slice 80/20 into train/val, copying images and writing label files. Healthy images get no `.txt` written.
6. **`create_data_yaml()`** — emits the YOLOv8 config with `nc: 2`, the class names, and absolute paths.
7. **`validate_dataset()`** — sanity checks: counts labeled vs. unlabeled images per split, flags orphan labels (label without image), and validates each label line (5 fields, valid class, coords in [0,1]).

This is the most substantive script — it's where the *full-image-bbox trick* lives, and it's also designed to be **re-runnable**: drop in real Roboflow annotations and rerun, no code changes needed.

---

### 3. [03_train.py](03_train.py) — YOLOv8 Training

**Purpose:** Wrapper around Ultralytics' `YOLO.train()` with sensible defaults for a small, imbalanced dataset.

**How it works:**
- Verifies `datasets/final/data.yaml` exists (i.e. step 02 has run).
- `train()` accepts `--model n|s` (nano vs small), `--epochs`, `--imgsz`, `--batch`, `--resume`. It loads `yolov8n.pt`/`yolov8s.pt` as a starting checkpoint (transfer learning) and trains.
- Augmentation knobs (`hsv_*`, `degrees`, `translate`, `scale`, `fliplr`, `flipud`, `mosaic`, `mixup`) are tuned for a small dataset to expand effective variety.
- `patience=20` enables early stopping.
- After training, the resulting `runs/detect/oyster_disease_<size>/weights/best.pt` is **copied to the project root as `best.pt`** so the inference module can find it without configuration.

---

### 4. [inference.py](inference.py) — Inference Module *(active version)*

**Purpose:** Reusable module that loads `best.pt` once and runs predictions. Used both as a CLI tool and imported by `app.py`.

**How it works:**
- Module-level globals `_model` and `_model_path` cache the loaded YOLO model so it isn't reloaded per request.
- `CLASS_NAMES = {0: "green_mold", 1: "black_mold"}` maps the integer class output back to readable strings.
- **Dataclasses:**
  - `Detection` — holds `class_name`, `confidence`, `bbox` (pixel coords `[x1,y1,x2,y2]`).
  - `PredictionResult` — wraps `status` (`"healthy"` / `"infected"`), the list of detections, image dimensions, and the path to an annotated PNG/JPG. `to_dict()` renders the API-friendly JSON.
- **`load_model(model_path=None)`** — searches a candidate list: `./best.pt`, then both training run output paths. Raises `FileNotFoundError` if none exist.
- **`save_annotated_image(result)`** — calls Ultralytics' `result.plot()` to render boxes onto the image, then writes it to [outputs/](outputs/) under a UUID filename via OpenCV. (This is why you see UUID-named JPGs in `outputs/` in the git status.)
- **`predict(image, conf, iou)`** — accepts `bytes`, a path string, a `Path`, a `PIL.Image`, or a `numpy.ndarray`; converts to a numpy array and feeds it to `_model.predict()`. Iterates `result.boxes`, filters anything below `conf=0.25`, and builds the `Detection` list. **Decision rule:** any surviving detection ⇒ `"infected"`, otherwise `"healthy"`.
- **CLI:** `python inference.py <image_path>` prints the JSON result.

---

### 5. [inferenceV1.py](inferenceV1.py) — Older inference variant *(legacy)*

**Purpose:** An earlier, simpler version of `inference.py`. Functionally near-identical but **does not save annotated images** — `PredictionResult` has no `annotated_image_path` field, and there's no `save_annotated_image()` helper or `cv2` dependency.

It still loads the model the same way, has the same `predict()` signature, and exposes the same CLI. It looks like a checkpoint kept around for reference; `app.py` imports the newer `inference` (no `V1`), so this file is not in the live request path. Safe to delete if you want to clean up — but verify no notebooks/scripts import it first.

---

### 6. [app.py](app.py) — FastAPI Service

**Purpose:** Wraps `inference.py` in an HTTP API.

**How it works:**
- **`lifespan` context manager** — on startup, calls `inference.load_model()` so the first `/predict` request is fast. If no model is found, it logs a warning and lets the server boot anyway (so `/health` still works).
- **CORS middleware** — `allow_origins=["*"]` for easy local testing (you'd tighten this in production).
- **Routes:**
  - `GET /` — service info and endpoint map.
  - `GET /health` — returns whether the model is loaded and which path it came from.
  - `POST /predict` — accepts a multipart `file` upload + optional `confidence` query param. Validates the MIME type (only common image formats), reads bytes, calls `inference.predict()`, and returns the `PredictionResult` as JSON augmented with `inference_time_ms`, `image_size`, and `filename`.
- **Errors:**
  - `503` if the model isn't loaded.
  - `400` for bad/empty/wrong-type uploads.
  - `500` for inference exceptions.
- Run directly with `python app.py` (uses `uvicorn.run` with `reload=True`) or `uvicorn app:app --host 0.0.0.0 --port 8000`.

---

## Other notable files

- **[best.pt](best.pt)** — the trained YOLOv8 weights produced by `03_train.py` (~6 MB).
- **[yolov8n.pt](yolov8n.pt)** — the pretrained nano starter checkpoint downloaded by Ultralytics.
- **[requirements.txt](requirements.txt)** — `ultralytics`, `fastapi`, `uvicorn`, `python-multipart`, `Pillow`, `pyyaml`, `numpy`, `opencv-python-headless`.
- **[outputs/](outputs/)** — annotated prediction images (UUID-named JPGs).
- **[runs/](runs/)** — Ultralytics' training artifacts (logs, plots, weights, metrics).
- **[datasets/](datasets/)** — raw and prepared datasets.
- **[project_walkthrough.md](project_walkthrough.md)** — README-style usage guide with example commands and recorded model metrics (mAP@50 ≈ 0.98 on the nano 5-epoch run).

---

## End-to-end run order

1. `python 01_inspect_datasets.py` — verify raw data.
2. `python 02_prepare_dataset.py` — produce `datasets/final/` and `data.yaml`.
3. `python 03_train.py --model n --epochs 5 --imgsz 320 --batch 8` (quick) or `--model s --epochs 50 --imgsz 640` (production) — produces `best.pt`.
4. `python inference.py some_image.jpg` — CLI smoke test.
5. `uvicorn app:app --host 0.0.0.0 --port 8000` — serve the API; POST images to `/predict`.

The "infected vs. healthy" decision is intentionally simple: **YOLO finds boxes ⇒ infected; no boxes ⇒ healthy.** All the labeling complexity (full-image bboxes, optional Roboflow override, healthy = no label) lives in `02_prepare_dataset.py`, which is the heart of the project.
