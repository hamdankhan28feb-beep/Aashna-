"""
Preprocess the Kaggle ASL Alphabet dataset:
  ml/data/raw/<LETTER>/*.jpg  ->  ml/data/processed/{X_train,X_test,y_train,y_test}.npy

Usage:
    python scripts/preprocess.py
"""
import os
import cv2
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from tqdm import tqdm

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
OUT_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"
IMG_SIZE = 64  # matches the CNN input in the Architecture doc
TEST_SPLIT = 0.2
SEED = 42

# A-Z only for the MVP (Phase 1). Extend this list later for numbers/phrases.
CLASSES = [chr(c) for c in range(ord("A"), ord("Z") + 1)]


def resolve_class_names(raw_dir: Path):
    available_dirs = [
        p.name for p in sorted(raw_dir.iterdir()) if p.is_dir() and p.name not in {".gitkeep"}
    ]
    normalized = [name.upper() for name in available_dirs if not name.isdigit()]

    class_names = []
    for candidate in normalized:
        if candidate in CLASSES:
            class_names.append(candidate)

    if not class_names:
        return CLASSES

    return sorted(set(class_names), key=lambda item: CLASSES.index(item))


def load_images():
    X, y = [], []
    missing = []
    class_names = resolve_class_names(RAW_DIR)

    for label_idx, letter in enumerate(CLASSES):
        class_dir = RAW_DIR / letter.lower()
        if not class_dir.exists():
            missing.append(letter)
            continue
        files = [f for f in class_dir.iterdir() if f.suffix.lower() in (".jpg", ".jpeg", ".png")]
        for f in tqdm(files, desc=f"Loading {letter}"):
            img = cv2.imread(str(f))
            if img is None:
                continue
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            X.append(img)
            y.append(label_idx)

    if missing:
        print(f"\n⚠️  No folder found for: {', '.join(missing)}")
        print(f"   Expected structure: ml/data/raw/<LETTER>/*.jpg  (see ml/README.md)\n")

    if not X:
        raise SystemExit(
            "No images loaded. Put the dataset into ml/data/raw/<LETTER>/*.jpg first — see ml/README.md"
        )

    return np.array(X, dtype=np.uint8), np.array(y, dtype=np.int64)


def main():
    print(f"Reading raw images from: {RAW_DIR}")
    X, y = load_images()
    print(f"Loaded {len(X)} images across {len(set(y.tolist()))} classes.")
    print(f"Using classes: {CLASSES}")

    X = X.astype("float32") / 255.0

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SPLIT, random_state=SEED, stratify=y
    )

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    np.save(OUT_DIR / "X_train.npy", X_train)
    np.save(OUT_DIR / "X_test.npy", X_test)
    np.save(OUT_DIR / "y_train.npy", y_train)
    np.save(OUT_DIR / "y_test.npy", y_test)

    with open(OUT_DIR / "classes.txt", "w") as f:
        f.write("\n".join(CLASSES))

    print(f"\nSaved processed arrays to {OUT_DIR}")
    print(f"  Train: {X_train.shape}   Test: {X_test.shape}")


if __name__ == "__main__":
    main()
