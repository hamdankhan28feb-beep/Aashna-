"""
Augment digits 0-9 in ml/data/raw to ensure all digit classes also have >= 500 images.

Usage:
    python ml/scripts/augment_digits.py
"""
import os
import cv2
import numpy as np
from pathlib import Path
import random

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
TARGET_SAMPLES = 500
DIGIT_CLASSES = [str(i) for i in range(10)]

def augment_image(img):
    # Random rotation (-15 to 15 deg)
    angle = random.uniform(-15, 15)
    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
    img_aug = cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REPLICATE)

    # Random brightness/contrast
    alpha = random.uniform(0.8, 1.2) # Contrast
    beta = random.randint(-20, 20)   # Brightness
    img_aug = cv2.convertScaleAbs(img_aug, alpha=alpha, beta=beta)

    # Random zoom/crop (0.9 to 1.1)
    zoom = random.uniform(0.9, 1.1)
    if zoom != 1.0:
        new_h, new_w = int(h * zoom), int(w * zoom)
        resized = cv2.resize(img_aug, (new_w, new_h))
        if zoom > 1.0:
            # Crop center
            start_y = (new_h - h) // 2
            start_x = (new_w - w) // 2
            img_aug = resized[start_y:start_y+h, start_x:start_x+w]
        else:
            # Pad
            pad_y = (h - new_h) // 2
            pad_x = (w - new_w) // 2
            img_aug = cv2.copyMakeBorder(resized, pad_y, h - new_h - pad_y, pad_x, w - new_w - pad_x, cv2.BORDER_REPLICATE)
            img_aug = cv2.resize(img_aug, (w, h))

    return img_aug

def main():
    random.seed(42)
    np.random.seed(42)

    for digit in DIGIT_CLASSES:
        digit_dir = RAW_DIR / digit
        if not digit_dir.exists():
            continue

        existing_files = [f for f in os.listdir(digit_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        current_count = len(existing_files)
        
        if current_count >= TARGET_SAMPLES:
            print(f"Digit '{digit}' already has {current_count} samples. Skipping.")
            continue

        needed = TARGET_SAMPLES - current_count
        print(f"Digit '{digit}': currently {current_count} samples. Generating {needed} augmented images...")

        aug_created = 0
        while aug_created < needed:
            # Pick a random existing image
            src_name = random.choice(existing_files)
            src_path = digit_dir / src_name
            img = cv2.imread(str(src_path))
            if img is None:
                continue

            aug_img = augment_image(img)
            dest_name = f"aug_{aug_created+1}_{src_name}"
            dest_path = digit_dir / dest_name
            cv2.imwrite(str(dest_path), aug_img)
            aug_created += 1

        print(f"  -> Digit '{digit}' total samples now: {len(os.listdir(digit_dir))}")

    print("\n[OK] Digit augmentation complete!")

if __name__ == "__main__":
    main()
