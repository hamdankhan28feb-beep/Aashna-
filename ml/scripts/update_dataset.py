"""
Update ML raw dataset with downloaded Kaggle ASL Alphabet images.
Copies 500 images per letter class (a-z) into ml/data/raw/

Usage:
    python ml/scripts/update_dataset.py
"""
import os
import shutil
from pathlib import Path
import random

KAGGLE_CACHE = Path(os.path.expanduser('~/.cache/kagglehub/datasets/grassknoted/asl-alphabet'))
TARGET_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
SAMPLES_PER_CLASS = 500  # Expand to 500 images per letter class

def main():
    # Locate downloaded dataset
    if not KAGGLE_CACHE.exists():
        print(f"[FAIL] Kaggle cache directory not found at {KAGGLE_CACHE}")
        return

    # Find the asl_alphabet_train folder
    train_dir = None
    for root, dirs, files in os.walk(KAGGLE_CACHE):
        if "asl_alphabet_train" in dirs:
            candidate = Path(root) / "asl_alphabet_train"
            # check if it contains subfolders like A, B
            subdirs = os.listdir(candidate)
            if "A" in subdirs or "a" in subdirs:
                train_dir = candidate
                break
            # check subfolder
            for sub in subdirs:
                nested = candidate / sub
                if nested.is_dir() and "A" in os.listdir(nested):
                    train_dir = nested
                    break

    if not train_dir:
        # Fallback recursive search for folder named 'A'
        for root, dirs, files in os.walk(KAGGLE_CACHE):
            if "A" in dirs and "B" in dirs and "Z" in dirs:
                train_dir = Path(root)
                break

    if not train_dir:
        print(f"[FAIL] Could not find train directory inside {KAGGLE_CACHE}")
        return

    print(f"[DIR] Found Kaggle training dataset at: {train_dir}")

    random.seed(42)
    copied_total = 0

    # Process letters A-Z -> map to lower case a-z in target_dir
    for letter in [chr(c) for c in range(ord('A'), ord('Z') + 1)]:
        src_folder = train_dir / letter
        if not src_folder.exists():
            src_folder = train_dir / letter.lower()

        if not src_folder.exists():
            print(f"[WARN] Warning: Source folder for letter {letter} not found.")
            continue

        target_folder = TARGET_DIR / letter.lower()
        target_folder.mkdir(parents=True, exist_ok=True)

        images = [f for f in os.listdir(src_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        print(f"Processing letter '{letter.lower()}': found {len(images)} images in Kaggle dataset.")

        # Take up to SAMPLES_PER_CLASS
        selected_images = random.sample(images, min(SAMPLES_PER_CLASS, len(images)))

        # Copy to target folder with prefixed names to avoid collision
        copied_count = 0
        for img_name in selected_images:
            src_file = src_folder / img_name
            dest_file = target_folder / f"kaggle_{img_name}"
            if not dest_file.exists():
                shutil.copy2(src_file, dest_file)
                copied_count += 1
        
        copied_total += copied_count
        total_in_dest = len(os.listdir(target_folder))
        print(f"  -> Added {copied_count} images to {target_folder.name} (Total now: {total_in_dest})")

    print(f"\n[OK] Dataset expansion complete! Copied {copied_total} new images across letter classes.")

if __name__ == "__main__":
    main()
