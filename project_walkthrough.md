# Oyster Mushroom Disease Detection — Project Walkthrough

## Pipeline Status: COMPLETE

The end-to-end pipeline is fully operational. All components have been tested and verified.

---

## Project Structure

```
Oyster_Disease/
├── 01_inspect_datasets.py    # Dataset format inspection
├── 02_prepare_dataset.py     # Standardize & merge into YOLOv8 format
├── 03_train.py               # YOLOv8 training script
├── inference.py              # Inference module (CLI + importable)
├── app.py                    # FastAPI endpoint
├── best.pt                   # Trained model weights
├── requirements.txt          # Dependencies
├── datasets/
│   ├── trichoderma/          # Raw green mold images (291)
│   ├── black_mould/          # Raw black mold images (216)
│   ├── oyster_healthy/       # YOLOv8 healthy mushrooms (2234)
│   └── final/                # Merged & standardized dataset
│       ├── images/{train,val}/
│       ├── labels/{train,val}/
│       └── data.yaml
└── runs/detect/              # Training results & metrics
```

---

## Model Performance (YOLOv8n, 5 epochs, 320px)

| Class | Precision | Recall | mAP@50 | mAP@50-95 |
|-------|-----------|--------|--------|-----------|
| **All** | **0.942** | **0.954** | **0.980** | **0.869** |
| green_mold | 0.909 | 0.948 | 0.968 | 0.862 |
| black_mold | 0.976 | 0.960 | 0.992 | 0.876 |

---

## Dataset Composition

| Category | Images | Class ID | Label Strategy |
|----------|--------|----------|----------------|
| Healthy | 2,234 | — | No label file |
| Green Mold (Trichoderma) | 291 | 0 | Full-image bbox |
| Black Mold | 216 | 1 | Full-image bbox |
| **Total** | **2,741** | | 80/20 split |

---

## API Test Results

### Green Mold Detection
```json
{
  "status": "infected",
  "detections": [{"class": "green_mold", "confidence": 0.3921, "bbox": [0.0, 0.0, 1080.0, 1917.09]}],
  "inference_time_ms": 161.22,
  "filename": "green_mold.jpg"
}
```

### Black Mold Detection
```json
{
  "status": "infected",
  "detections": [{"class": "black_mold", "confidence": 0.6878, "bbox": [0.32, 0.0, 4099.33, 3096.0]}],
  "inference_time_ms": 173.34,
  "filename": "black_mold.jpg"
}
```

### Healthy Mushroom
```json
{
  "status": "healthy",
  "detections": [],
  "inference_time_ms": 66.97,
  "filename": "healthy.jpg"
}
```

---

## How to Run

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Inspect datasets
```bash
python 01_inspect_datasets.py
```

### 3. Prepare dataset
```bash
python 02_prepare_dataset.py
```

### 4. Train model
```bash
# Quick (nano, 5 epochs)
python 03_train.py --model n --epochs 5 --imgsz 320 --batch 8

# Production (small, 50 epochs — requires GPU)
python 03_train.py --model s --epochs 50 --imgsz 640
```

### 5. Run inference (CLI)
```bash
python inference.py path/to/image.jpg
```

### 6. Start API server
```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

### 7. Test API
```bash
# curl
curl -X POST http://localhost:8000/predict -F "file=@image.jpg"

# Python
import requests
r = requests.post("http://localhost:8000/predict",
                  files={"file": open("image.jpg", "rb")})
print(r.json())
```

### 8. Swagger docs
Open http://localhost:8000/docs in your browser.

---

## Improving Accuracy

To further improve the model:

1. **Better annotations**: Use [Roboflow](https://roboflow.com) to annotate bounding boxes on the disease images instead of full-image boxes. Place exports in `datasets/annotated_green_mold/` and `datasets/annotated_black_mold/`. The prepare script will auto-detect and use them.

2. **More epochs with GPU**: Train `yolov8s` for 50-100 epochs at 640px on a GPU.

3. **More data**: Add more disease images to improve generalization.


## Setup Python env
```bash
python -m venv .venv

# Activate environment
# Windows
.\.venv\Scripts\Activate

```

## Data Preparation
```bash
python 02_prepare_dataset.py
```

## Train Model
```bash
python 03_train.py --model n --epochs 5 --imgsz 320 --batch 8
```

## Run app.py
```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

## Test app.py
```bash
python -c "import requests, json; r = requests.post('http://localhost:8000/predict', files={'file': ('green_mold.jpg', open(r'.\datasets\trichoderma\IMG20230519140627_01.jpg', 'rb'), 'image/jpeg')}); print(json.dumps(r.json(), indent=2))"


#Ouput:-
{
  "status": "infected",
  "detections": [
    {
      "class": "green_mold",
      "confidence": 0.3921,
      "bbox": [
        0.0,
        0.0,
        1080.0,
        1917.09
      ]
    }
  ],
  "inference_time_ms": 161.22,
  "image_size": {
    "width": 1080,
    "height": 1920
  },
  "filename": "green_mold.jpg"
}

```