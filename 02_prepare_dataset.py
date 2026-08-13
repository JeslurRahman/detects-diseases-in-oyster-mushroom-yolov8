"""
02_prepare_dataset.py - Dataset Standardization & Merging
=========================================================
Converts all datasets into unified YOLOv8 format.

Class mapping: 0=green_mold, 1=black_mold
Healthy images: included with NO label files (no detection = healthy)

Strategy for disease datasets (trichoderma, black_mould):
  These are classification-style images where the disease fills the frame.
  We apply full-image bounding boxes (0.5 0.5 1.0 1.0) — a standard
  technique when the subject occupies most of the image.

  If annotated Roboflow exports exist (datasets/annotated_green_mold,
  datasets/annotated_black_mold), those are used INSTEAD of full-image boxes.
"""
import os
import sys
import io
import shutil
import random
import yaml
from pathlib import Path
from PIL import Image

# Fix Windows encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

random.seed(42)

BASE_DIR = Path(__file__).resolve().parent
DATASETS_DIR = BASE_DIR / "datasets"
FINAL_DIR = DATASETS_DIR / "final"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}

# Source datasets
TRICHODERMA_DIR = DATASETS_DIR / "trichoderma"
BLACK_MOULD_DIR = DATASETS_DIR / "black_mould" / "Black Mould"
OYSTER_HEALTHY_DIR = DATASETS_DIR / "oyster_healthy" / "Oyster Mushroom.yolov8"

# Optional: Roboflow-annotated exports (used if they exist)
ANNOTATED_GREEN_MOLD_DIR = DATASETS_DIR / "annotated_green_mold"
ANNOTATED_BLACK_MOLD_DIR = DATASETS_DIR / "annotated_black_mold"

# Class mapping
CLASS_MAP = {0: "green_mold", 1: "black_mold"}
TRAIN_RATIO = 0.8
MIN_IMAGE_SIZE_BYTES = 5120  # Skip images < 5KB (likely corrupt)


def clean_final_dir():
    """Remove and recreate final dataset directory."""
    if FINAL_DIR.exists():
        shutil.rmtree(FINAL_DIR)
    for split in ["train", "val"]:
        (FINAL_DIR / "images" / split).mkdir(parents=True, exist_ok=True)
        (FINAL_DIR / "labels" / split).mkdir(parents=True, exist_ok=True)
    print(f"[OK] Created final dataset structure at {FINAL_DIR}")


def get_image_files(directory: Path, recursive: bool = False) -> list:
    """Get all image files from a directory."""
    if not directory.exists():
        return []
    if recursive:
        return [f for f in directory.rglob("*")
                if f.is_file() and f.suffix.lower() in IMAGE_EXTS]
    return [f for f in directory.iterdir()
            if f.is_file() and f.suffix.lower() in IMAGE_EXTS]


def is_valid_image(img_path: Path) -> bool:
    """Check if image file is valid and not corrupt."""
    if img_path.stat().st_size < MIN_IMAGE_SIZE_BYTES:
        return False
    try:
        with Image.open(img_path) as img:
            img.verify()
        return True
    except Exception:
        return False


def process_classification_disease(img_dir: Path, class_id: int, prefix: str) -> list:
    """
    Process classification-style disease images.
    Creates full-image bounding boxes since disease fills the frame.
    YOLO format: class_id 0.5 0.5 1.0 1.0
    """
    pairs = []
    images = get_image_files(img_dir)

    # Filter valid images
    valid = []
    skipped = 0
    for img in images:
        if is_valid_image(img):
            valid.append(img)
        else:
            skipped += 1

    if skipped > 0:
        print(f"    Skipped {skipped} invalid/corrupt images")

    # Full-image bounding box label
    label_line = f"{class_id} 0.5 0.5 1.0 1.0"

    for i, img_path in enumerate(valid):
        new_name = f"{prefix}_{i:04d}{img_path.suffix.lower()}"
        pairs.append((img_path, new_name, [label_line]))

    return pairs


def process_annotated_yolo(ann_dir: Path, target_class_id: int, prefix: str) -> list:
    """Process an annotated YOLO dataset (from Roboflow) and remap class IDs."""
    pairs = []
    img_dirs = []
    lbl_dirs = []

    # Detect YOLO directory structure variants
    if (ann_dir / "images").is_dir():
        img_dirs.append(ann_dir / "images")
        lbl_dirs.append(ann_dir / "labels")
    for split in ["train", "val", "test"]:
        if (ann_dir / split / "images").is_dir():
            img_dirs.append(ann_dir / split / "images")
            lbl_dirs.append(ann_dir / split / "labels")
        if (ann_dir / "images" / split).is_dir():
            img_dirs.append(ann_dir / "images" / split)
            lbl_dirs.append(ann_dir / "labels" / split)

    if not img_dirs:
        img_dirs = [ann_dir]
        lbl_dirs = [ann_dir]

    idx = 0
    for img_dir, lbl_dir in zip(img_dirs, lbl_dirs):
        if not img_dir.exists():
            continue
        for img_file in img_dir.iterdir():
            if not img_file.is_file() or img_file.suffix.lower() not in IMAGE_EXTS:
                continue
            label_file = lbl_dir / (img_file.stem + ".txt")
            if not label_file.exists():
                continue

            new_lines = []
            with open(label_file, "r") as f:
                for line in f:
                    parts = line.strip().split()
                    if len(parts) >= 5:
                        parts[0] = str(target_class_id)
                        new_lines.append(" ".join(parts))

            if new_lines:
                new_name = f"{prefix}_{idx:04d}{img_file.suffix.lower()}"
                pairs.append((img_file, new_name, new_lines))
                idx += 1

    return pairs


def process_oyster_healthy() -> list:
    """Extract healthy images from oyster_healthy YOLO dataset (strip harvest labels)."""
    pairs = []
    img_dir = OYSTER_HEALTHY_DIR / "train" / "images"

    if not img_dir.exists():
        print("  [WARN] oyster_healthy train/images not found")
        return pairs

    images = get_image_files(img_dir)
    images = [img for img in images if img.stat().st_size > MIN_IMAGE_SIZE_BYTES]

    for i, img_path in enumerate(images):
        new_name = f"healthy_{i:04d}{img_path.suffix.lower()}"
        pairs.append((img_path, new_name, None))  # None = no label = healthy

    return pairs


def split_and_copy(pairs: list):
    """Split pairs into train/val and copy files."""
    random.shuffle(pairs)
    split_idx = int(len(pairs) * TRAIN_RATIO)
    train_pairs = pairs[:split_idx]
    val_pairs = pairs[split_idx:]

    stats = {"train_imgs": 0, "train_labels": 0, "val_imgs": 0, "val_labels": 0}

    for split_name, split_pairs in [("train", train_pairs), ("val", val_pairs)]:
        for src_img, new_name, label_lines in split_pairs:
            dst_img = FINAL_DIR / "images" / split_name / new_name
            shutil.copy2(src_img, dst_img)
            stats[f"{split_name}_imgs"] += 1

            if label_lines is not None:
                label_name = Path(new_name).stem + ".txt"
                dst_lbl = FINAL_DIR / "labels" / split_name / label_name
                with open(dst_lbl, "w") as f:
                    f.write("\n".join(label_lines) + "\n")
                stats[f"{split_name}_labels"] += 1

    return stats


def create_data_yaml():
    """Create data.yaml for YOLOv8 training."""
    data = {
        "path": str(FINAL_DIR.resolve()),
        "train": "images/train",
        "val": "images/val",
        "nc": 2,
        "names": {0: "green_mold", 1: "black_mold"},
    }
    yaml_path = FINAL_DIR / "data.yaml"
    with open(yaml_path, "w") as f:
        yaml.dump(data, f, default_flow_style=False, sort_keys=False)
    print(f"[OK] Created {yaml_path}")
    return yaml_path


def validate_dataset():
    """Validate the final dataset for consistency."""
    print("\n" + "=" * 60 + "\n DATASET VALIDATION\n" + "=" * 60)
    issues = []

    for split in ["train", "val"]:
        img_dir = FINAL_DIR / "images" / split
        lbl_dir = FINAL_DIR / "labels" / split

        images = set(f.stem for f in img_dir.iterdir() if f.suffix.lower() in IMAGE_EXTS)
        labels = set(f.stem for f in lbl_dir.iterdir() if f.suffix == ".txt")

        orphan_labels = labels - images
        if orphan_labels:
            issues.append(f"  [ERR] {split}: {len(orphan_labels)} label files without images")

        labeled = images & labels
        unlabeled = images - labels

        print(f"  {split}:")
        print(f"    Total images:    {len(images)}")
        print(f"    With labels:     {len(labeled)} (disease)")
        print(f"    Without labels:  {len(unlabeled)} (healthy)")

        if orphan_labels:
            print(f"    [ERR] Orphan labels: {len(orphan_labels)}")

        # Validate label format
        bad_labels = 0
        class_counts = {0: 0, 1: 0}
        for lf in lbl_dir.iterdir():
            if lf.suffix != ".txt":
                continue
            with open(lf) as f:
                for line in f:
                    parts = line.strip().split()
                    if len(parts) < 5:
                        bad_labels += 1
                        continue
                    try:
                        cid = int(parts[0])
                        vals = [float(p) for p in parts[1:5]]
                        if cid in class_counts:
                            class_counts[cid] += 1
                        else:
                            bad_labels += 1
                        if any(v < 0 or v > 1 for v in vals):
                            bad_labels += 1
                    except Exception:
                        bad_labels += 1

        if bad_labels:
            issues.append(f"  [WARN] {split}: {bad_labels} malformed label lines")
        print(f"    Class 0 (green_mold) boxes: {class_counts[0]}")
        print(f"    Class 1 (black_mold) boxes: {class_counts[1]}")

    if issues:
        print("\n  [WARN] ISSUES FOUND:")
        for i in issues:
            print(f"    {i}")
    else:
        print("\n  [OK] All validations passed!")

    return len(issues) == 0


def main():
    print("=" * 60 + "\n OYSTER MUSHROOM DATASET PREPARATION\n" + "=" * 60)

    # Step 1: Clean and create directory structure
    print("\n[Step 1] Creating final dataset structure...")
    clean_final_dir()

    all_pairs = []

    # Step 2: Process healthy images from oyster_healthy
    print("\n[Step 2] Processing HEALTHY images (oyster_healthy)...")
    healthy_pairs = process_oyster_healthy()
    print(f"  Found {len(healthy_pairs)} healthy images (no labels)")
    all_pairs.extend(healthy_pairs)

    # Step 3: Process GREEN MOLD (Trichoderma) images
    print("\n[Step 3] Processing GREEN MOLD (trichoderma)...")
    if ANNOTATED_GREEN_MOLD_DIR.exists():
        print("  [OK] Found Roboflow-annotated green_mold dataset")
        gm_pairs = process_annotated_yolo(ANNOTATED_GREEN_MOLD_DIR, 0, "green_mold")
        print(f"  Loaded {len(gm_pairs)} annotated green_mold samples")
    else:
        print("  No Roboflow annotations found. Using full-image bbox approach.")
        gm_pairs = process_classification_disease(TRICHODERMA_DIR, 0, "green_mold")
        print(f"  Created {len(gm_pairs)} green_mold samples (full-image bbox)")
    all_pairs.extend(gm_pairs)

    # Step 4: Process BLACK MOLD images
    print("\n[Step 4] Processing BLACK MOLD (black_mould)...")
    if ANNOTATED_BLACK_MOLD_DIR.exists():
        print("  [OK] Found Roboflow-annotated black_mold dataset")
        bm_pairs = process_annotated_yolo(ANNOTATED_BLACK_MOLD_DIR, 1, "black_mold")
        print(f"  Loaded {len(bm_pairs)} annotated black_mold samples")
    else:
        print("  No Roboflow annotations found. Using full-image bbox approach.")
        bm_pairs = process_classification_disease(BLACK_MOULD_DIR, 1, "black_mold")
        print(f"  Created {len(bm_pairs)} black_mold samples (full-image bbox)")
    all_pairs.extend(bm_pairs)

    # Step 5: Split and copy
    print(f"\n[Step 5] Splitting {len(all_pairs)} total images (80/20)...")
    stats = split_and_copy(all_pairs)
    print(f"  Train: {stats['train_imgs']} images, {stats['train_labels']} labels")
    print(f"  Val:   {stats['val_imgs']} images, {stats['val_labels']} labels")

    # Step 6: Create data.yaml
    print("\n[Step 6] Creating data.yaml...")
    create_data_yaml()

    # Step 7: Validate
    validate_dataset()

    print("\n" + "=" * 60)
    print("[OK] DATASET PREPARATION COMPLETE")
    print("=" * 60)
    print(f"  Final dataset: {FINAL_DIR}")
    print(f"  data.yaml:     {FINAL_DIR / 'data.yaml'}")
    print(f"\n  Dataset composition:")
    print(f"    Healthy images:    {len(healthy_pairs)} (no label files)")
    print(f"    Green mold images: {len(gm_pairs)} (class 0)")
    print(f"    Black mold images: {len(bm_pairs)} (class 1)")
    print(f"    TOTAL:             {len(all_pairs)}")


if __name__ == "__main__":
    main()
