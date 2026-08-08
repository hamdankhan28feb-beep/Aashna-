"""
Train the ASL A-Z CNN (architecture per docs/Architecture.md section 6.1).

Usage:
    python scripts/train.py
"""
from pathlib import Path
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
import json

DATA_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"
MODEL_DIR = Path(__file__).resolve().parents[1] / "models"
IMG_SIZE = 64

# Read NUM_CLASSES from label mapping
with open(DATA_DIR / "label_mapping.json") as f:
    label_map = json.load(f)
    NUM_CLASSES = len(label_map["label_to_class"])  # Auto-detect from data

EPOCHS = 30
BATCH_SIZE = 64

print(f"🔍 Auto-detected {NUM_CLASSES} classes from dataset")

def build_model():
    model = models.Sequential([
        layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3)),

        layers.Conv2D(32, 3, padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2),

        layers.Conv2D(64, 3, padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2),

        layers.Conv2D(128, 3, padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2),

        layers.Flatten(),
        layers.Dense(256, activation="relu"),
        layers.Dropout(0.5),
        layers.Dense(128, activation="relu"),
        layers.Dropout(0.5),
        layers.Dense(NUM_CLASSES, activation="softmax"),
    ])
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def main():
    X_train = np.load(DATA_DIR / "X_train.npy")
    y_train = np.load(DATA_DIR / "y_train.npy")
    X_test = np.load(DATA_DIR / "X_test.npy")
    y_test = np.load(DATA_DIR / "y_test.npy")

    print(f"Train: {X_train.shape}  Test: {X_test.shape}")

    model = build_model()
    model.summary()

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    checkpoint_path = MODEL_DIR / "asl_model.keras"

    cbs = [
        callbacks.ModelCheckpoint(str(checkpoint_path), save_best_only=True, monitor="val_accuracy"),
        callbacks.EarlyStopping(patience=5, restore_best_weights=True, monitor="val_accuracy"),
        callbacks.ReduceLROnPlateau(factor=0.5, patience=3, monitor="val_loss"),
    ]

    model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=cbs,
    )

    test_loss, test_acc = model.evaluate(X_test, y_test)
    print(f"\nFinal test accuracy: {test_acc:.4f} (target from PRD: >= 0.95)")
    print(f"Model saved to: {checkpoint_path}")


if __name__ == "__main__":
    main()
