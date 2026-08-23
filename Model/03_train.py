"""
03_train.py - YOLOv8 Training Script
=====================================
Trains YOLOv8 model for oyster mushroom disease detection.
  - First run: yolov8n.pt (nano, quick validation)
  - Final run: yolov8s.pt (small, production)
"""
import argparse
import sys
from pathlib import Path
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent
DATA_YAML = BASE_DIR / "datasets" / "final" / "data.yaml"
RUNS_DIR = BASE_DIR / "runs"


def train(model_size: str = "n", epochs: int = 50, imgsz: int = 640,
          batch: int = -1, resume: bool = False):
    """
    Train YOLOv8 model.
    
    Args:
        model_size: 'n' for nano, 's' for small
        epochs: Number of training epochs
        imgsz: Image size
        batch: Batch size (-1 for auto)
        resume: Resume from last checkpoint
    """
    if not DATA_YAML.exists():
        print(f"❌ data.yaml not found at {DATA_YAML}")
        print("   Run 02_prepare_dataset.py first!")
        sys.exit(1)

    model_name = f"yolov8{model_size}.pt"
    project_name = RUNS_DIR / "detect"
    run_name = f"oyster_disease_{model_size}"

    print("=" * 60)
    print(f"🚀 TRAINING YOLOv8{model_size.upper()}")
    print("=" * 60)
    print(f"  Model:    {model_name}")
    print(f"  Data:     {DATA_YAML}")
    print(f"  Epochs:   {epochs}")
    print(f"  ImgSize:  {imgsz}")
    print(f"  Batch:    {'auto' if batch == -1 else batch}")
    print(f"  Project:  {project_name}")
    print(f"  Run Name: {run_name}")
    print("=" * 60)

    # Load model
    model = YOLO(model_name)

    # Train
    results = model.train(
        data=str(DATA_YAML),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        project=str(project_name),
        name=run_name,
        exist_ok=True,
        patience=20,
        save=True,
        save_period=10,
        verbose=True,
        # Augmentation settings for small datasets
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=10.0,
        translate=0.1,
        scale=0.5,
        fliplr=0.5,
        flipud=0.2,
        mosaic=1.0,
        mixup=0.1,
    )

    # Report best model location
    best_model = project_name / run_name / "weights" / "best.pt"
    print("\n" + "=" * 60)
    print("✅ TRAINING COMPLETE")
    print("=" * 60)
    print(f"  Best model: {best_model}")
    print(f"  Results:    {project_name / run_name}")

    # Copy best model to project root for easy access
    import shutil
    dst = BASE_DIR / "best.pt"
    if best_model.exists():
        shutil.copy2(best_model, dst)
        print(f"  Copied to:  {dst}")

    return best_model


def main():
    parser = argparse.ArgumentParser(description="Train YOLOv8 for Oyster Disease Detection")
    parser.add_argument("--model", choices=["n", "s"], default="n",
                        help="Model size: n=nano, s=small (default: n)")
    parser.add_argument("--epochs", type=int, default=50,
                        help="Number of epochs (default: 50)")
    parser.add_argument("--imgsz", type=int, default=640,
                        help="Image size (default: 640)")
    parser.add_argument("--batch", type=int, default=-1,
                        help="Batch size, -1 for auto (default: -1)")
    parser.add_argument("--resume", action="store_true",
                        help="Resume from last checkpoint")
    args = parser.parse_args()

    train(
        model_size=args.model,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        resume=args.resume,
    )


if __name__ == "__main__":
    main()
