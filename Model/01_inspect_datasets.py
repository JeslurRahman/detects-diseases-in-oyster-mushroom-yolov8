"""
01_inspect_datasets.py - Dataset Inspection Script
"""
import os, sys, io
from pathlib import Path
from collections import Counter

# Fix Windows encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_DIR = Path(__file__).resolve().parent
DATASETS_DIR = BASE_DIR / "datasets"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}

def count_by_ext(d):
    c = Counter()
    for f in d.rglob("*"):
        if f.is_file(): c[f.suffix.lower()] += 1
    return c

def has_yolo(d):
    if (d/"images").is_dir() and (d/"labels").is_dir(): return True
    for s in d.iterdir():
        if s.is_dir() and (s/"images").is_dir() and (s/"labels").is_dir(): return True
    return False

def inspect(name, d):
    r = {"name": name, "path": str(d), "format": "unknown", "imgs": 0, "labels": 0, "class_ids": set(), "notes": []}
    if not d.exists():
        r["notes"].append("NOT FOUND"); return r
    ec = count_by_ext(d)
    r["imgs"] = sum(ec.get(e,0) for e in IMAGE_EXTS)
    r["labels"] = ec.get(".txt",0)
    if has_yolo(d):
        r["format"] = "YOLO"
        for lf in list(d.rglob("labels/*.txt"))[:50]:
            with open(lf) as f:
                for line in f:
                    p = line.strip().split()
                    if p:
                        try: r["class_ids"].add(int(p[0]))
                        except: pass
        yamls = list(d.rglob("*.yaml"))
        if yamls:
            import yaml
            with open(yamls[0]) as f: cfg = yaml.safe_load(f)
            r["notes"].append(f"Classes: {cfg.get('names',[])} nc={cfg.get('nc',0)}")
    else:
        imgs_direct = sum(1 for f in d.iterdir() if f.is_file() and f.suffix.lower() in IMAGE_EXTS)
        r["format"] = "IMAGES_ONLY" if imgs_direct > 0 else "UNKNOWN"
    return r

def main():
    print("=" * 60)
    print(" OYSTER MUSHROOM DISEASE DATASET INSPECTION")
    print("=" * 60)
    datasets = {
        "trichoderma": DATASETS_DIR/"trichoderma",
        "black_mould": DATASETS_DIR/"black_mould"/"Black Mould",
        "oyster_healthy": DATASETS_DIR/"oyster_healthy"/"Oyster Mushroom.yolov8",
    }
    for name, path in datasets.items():
        r = inspect(name, path)
        icon = "[YOLO]" if r["format"]=="YOLO" else "[IMG]"
        print(f"\n{icon} {r['name']}")
        print(f"  Path: {r['path']}")
        print(f"  Format: {r['format']} | Images: {r['imgs']} | Labels: {r['labels']}")
        if r["class_ids"]: print(f"  Class IDs: {sorted(r['class_ids'])}")
        for n in r["notes"]: print(f"  {n}")

    print("\n" + "=" * 60)
    print(" DECISIONS")
    print("=" * 60)
    print("""
  trichoderma     -> IMAGES ONLY (292 imgs, no bbox) -> FLAG for Roboflow annotation
  black_mould     -> IMAGES ONLY (216 imgs, no bbox) -> FLAG for Roboflow annotation  
  oyster_healthy  -> YOLO FORMAT (2234 imgs)
                     Classes: harvest readiness (NOT disease)
                     -> USE as HEALTHY images (strip harvest labels)
    """)

if __name__ == "__main__":
    main()
