import tensorflow as tf
import numpy as np
import cv2
from pathlib import Path
import json
import os

print("🧪 Testing Model with Available Images\n")

# Load model
model = tf.keras.models.load_model("ml/models/asl_model.keras")
print("✅ Model loaded\n")

# Load class mapping
with open("ml/data/processed/label_mapping.json") as f:
    label_map = json.load(f)
    label_to_class = label_map["label_to_class"]
    classes = [label_to_class[str(i)] for i in range(len(label_to_class))]

# Find classes with images
raw_dir = Path("ml/data/raw")
print("🔍 Checking available classes:\n")

valid_classes = []
for class_name in classes:
    class_path = raw_dir / class_name
    if class_path.exists():
        images = list(class_path.glob("*.jpg")) + list(class_path.glob("*.png"))
        count = len(images)
        if count > 0:
            valid_classes.append((class_name, class_path, count))
            status = "✅" if count > 10 else "⚠️"
            print(f"{status} Class '{class_name}': {count} images")
    else:
        print(f"❌ Class '{class_name}': NOT FOUND")

if not valid_classes:
    print("❌ No classes with images found!")
    exit()

print(f"\n📊 Total valid classes: {len(valid_classes)}\n")

# Test 5 random classes
import random
test_classes = random.sample(valid_classes, min(5, len(valid_classes)))

print("=" * 60)
print("🧪 TESTING 5 RANDOM CLASSES")
print("=" * 60 + "\n")

correct_predictions = 0
total_predictions = 0

for true_class, class_path, _ in test_classes:
    # Get random image
    images = list(class_path.glob("*.jpg")) + list(class_path.glob("*.png"))
    image_path = random.choice(images)
    
    # Load and preprocess
    img = cv2.imread(str(image_path))
    if img is None:
        continue
    
    img = cv2.resize(img, (64, 64))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_normalized = img / 255.0
    
    # Make prediction
    prediction = model.predict(np.array([img_normalized]), verbose=0)[0]
    predicted_idx = np.argmax(prediction)
    predicted_class = classes[predicted_idx]
    confidence = prediction[predicted_idx]
    
    is_correct = predicted_class == true_class
    if is_correct:
        correct_predictions += 1
    total_predictions += 1
    
    # Show result
    status = "✅" if is_correct else "❌"
    print(f"{status} Test {total_predictions}:")
    print(f"   Image: {image_path.name}")
    print(f"   True: {true_class:3} | Predicted: {predicted_class:3} | Confidence: {confidence*100:.2f}%")
    
    # Show top 3 predictions
    top_3_idx = np.argsort(prediction)[-3:][::-1]
    print(f"   Top 3: ", end="")
    for idx in top_3_idx:
        print(f"{classes[idx]}({prediction[idx]*100:.1f}%) ", end="")
    print("\n")

# Summary
print("=" * 60)
print("📊 SUMMARY")
print("=" * 60)
print(f"Correct predictions: {correct_predictions}/{total_predictions}")
print(f"Accuracy on sample: {correct_predictions/total_predictions*100:.1f}%")

