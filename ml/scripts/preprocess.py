import os
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
from pathlib import Path
import json

print("[INFO] Starting Data Preprocessing...")

# Path to dataset
dataset_path = Path('ml/data/raw')
output_path = Path('ml/data/processed')

# Parameters
IMG_SIZE = 64
TEST_SIZE = 0.2

# Create output folder
output_path.mkdir(exist_ok=True)

# Load all images and labels
images = []
labels = []
label_to_class = {}
class_to_label = {}

print("\n[INFO] Loading images...")

# Get all folders (both numbers and letters)
class_folders = sorted([f for f in os.listdir(dataset_path) if os.path.isdir(dataset_path / f)])
print(f"Found classes: {class_folders}")

for idx, class_name in enumerate(class_folders):
    class_path = dataset_path / class_name
    
    label_to_class[idx] = class_name
    class_to_label[class_name] = idx
    
    # Get all images in this class folder
    image_files = [f for f in os.listdir(class_path) if f.lower().endswith(('.jpg', '.png', '.jpeg'))]
    
    print(f"Loading class {class_name}: {len(image_files)} images")
    
    for img_file in image_files:
        try:
            image_path = class_path / img_file
            
            # Read image
            img = cv2.imread(str(image_path))
            if img is None:
                continue
            
            # Resize to 64x64
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            
            # Convert BGR to RGB
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            images.append(img)
            labels.append(idx)
        except Exception as e:
            print(f"  Error loading {img_file}: {e}")
            continue

# Convert to numpy arrays
X = np.array(images, dtype=np.float32)
y = np.array(labels, dtype=np.int32)

print(f"\n[OK] Loaded {len(X)} images")
print(f"   Shape: {X.shape}")

# Normalize pixel values (0-255 -> 0-1)
X = X / 255.0

print(f"\n[INFO] Splitting data: 80% train, 20% test...")

# Split into train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=TEST_SIZE, random_state=42, stratify=y
)

print(f"[OK] Train set: {X_train.shape}")
print(f"[OK] Test set: {X_test.shape}")

# Save as numpy files
print(f"\n[INFO] Saving preprocessed data...")

np.save(output_path / 'X_train.npy', X_train)
np.save(output_path / 'y_train.npy', y_train)
np.save(output_path / 'X_test.npy', X_test)
np.save(output_path / 'y_test.npy', y_test)

# Save label mapping
with open(output_path / 'label_mapping.json', 'w') as f:
    json.dump({
        'label_to_class': {str(k): v for k, v in label_to_class.items()},
        'class_to_label': class_to_label
    }, f, indent=2)

# Save class names
with open(output_path / 'classes.txt', 'w') as f:
    f.write('\n'.join([label_to_class[i] for i in range(len(label_to_class))]))

print(f"[OK] Saved to ml/data/processed/")

# Verify
print(f"\n[INFO] Files created:")
for file in os.listdir(output_path):
    if file.endswith('.npy'):
        size = os.path.getsize(output_path / file) / (1024*1024)
        print(f"   - {file} ({size:.1f} MB)")
    else:
        print(f"   - {file}")

print(f"\n[OK] Preprocessing complete!")
print(f"   Classes: {list(label_to_class.values())}")
print(f"   Total images: {len(X)}")
print(f"   Train samples: {len(X_train)}")
print(f"   Test samples: {len(X_test)}")
