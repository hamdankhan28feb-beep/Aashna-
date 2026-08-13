import tensorflow as tf
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
from pathlib import Path
import json

print("📊 Detailed Model Evaluation\n")

# Load model
model = tf.keras.models.load_model("ml/models/asl_model.keras")
print("✅ Model loaded\n")

# Load data
X_test = np.load("ml/data/processed/X_test.npy")
y_test = np.load("ml/data/processed/y_test.npy")

# Load class names
with open("ml/data/processed/label_mapping.json") as f:
    label_map = json.load(f)
    label_to_class = label_map["label_to_class"]
    classes = [label_to_class[str(i)] for i in range(len(label_to_class))]

print(f"📊 Test set: {X_test.shape}")
print(f"📊 Classes: {classes}\n")

# Make predictions
predictions = model.predict(X_test, verbose=0)
y_pred = np.argmax(predictions, axis=1)

# Get accuracy
accuracy = np.mean(y_pred == y_test)
print(f"🎯 Overall Accuracy: {accuracy*100:.2f}%\n")

# Per-class accuracy
print("📈 Accuracy per class:")
print("-" * 40)
for i in range(len(classes)):
    mask = y_test == i
    if mask.sum() > 0:
        class_accuracy = (y_pred[mask] == i).mean()
        count = mask.sum()
        print(f"{classes[i]:3} ({i:2}): {class_accuracy*100:6.2f}% ({count:3} samples)")

# Confusion matrix
print("\n🔍 Confusion Matrix (top predictions):")
print("-" * 40)
cm = confusion_matrix(y_test, y_pred)

# Show which classes are confused most
print("\n⚠️  Most confused classes (pairs):")
for i in range(min(5, len(classes))):
    for j in range(i+1, len(classes)):
        confusion_ij = cm[i][j] + cm[j][i]
        if confusion_ij > 0:
            print(f"  {classes[i]} <-> {classes[j]}: {confusion_ij} confusions")

# Classification report
print("\n📋 Detailed Classification Report:")
print("-" * 60)
report = classification_report(y_test, y_pred, target_names=classes, digits=3)
print(report)

