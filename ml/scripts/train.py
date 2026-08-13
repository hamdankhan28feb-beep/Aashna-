"""
Train the ASL CNN model with separate train, validation, and test sets.

Usage:
    python ml/scripts/train.py
"""
from pathlib import Path
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from sklearn.model_selection import train_test_split
import json

# ── Paths & Config ──────────────────────────────────────────────────────────
DATA_DIR   = Path(__file__).resolve().parents[1] / "data" / "processed"
MODEL_DIR  = Path(__file__).resolve().parents[1] / "models"
MODEL_PATH = MODEL_DIR / "asl_model.keras"
HIST_PATH  = MODEL_DIR / "training_history.json"

IMG_SIZE   = 64
BATCH_SIZE = 64
EPOCHS     = 60
VAL_SIZE   = 0.15  # 15% of train set for validation

# ── Read Class Count ─────────────────────────────────────────────────────────
with open(DATA_DIR / "label_mapping.json") as f:
    label_map   = json.load(f)
    NUM_CLASSES = len(label_map["label_to_class"])

print(f"[INFO] Auto-detected {NUM_CLASSES} classes from dataset")


# ── Deep CNN Model Architecture ─────────────────────────────────────────────
def build_model(num_classes: int, img_size: int) -> tf.keras.Model:
    model = models.Sequential([
        layers.Input(shape=(img_size, img_size, 3)),

        # Data Augmentation (active during training only)
        layers.RandomRotation(0.05),
        layers.RandomZoom(0.05),
        layers.RandomTranslation(0.05, 0.05),

        # Conv Block 1
        layers.Conv2D(32, 3, padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.Conv2D(32, 3, padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2),
        layers.Dropout(0.2),

        # Conv Block 2
        layers.Conv2D(64, 3, padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.Conv2D(64, 3, padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2),
        layers.Dropout(0.25),

        # Conv Block 3
        layers.Conv2D(128, 3, padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.Conv2D(128, 3, padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2),
        layers.Dropout(0.3),

        # Conv Block 4
        layers.Conv2D(256, 3, padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2),
        layers.Dropout(0.3),

        # Dense Classifier Head
        layers.Flatten(),
        layers.Dense(512, activation="relu"),
        layers.BatchNormalization(),
        layers.Dropout(0.4),
        layers.Dense(256, activation="relu"),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation="softmax"),
    ], name="ASL_DeepCNN")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


# ── Main Training Loop ───────────────────────────────────────────────────────
def main():
    tf.random.set_seed(42)
    np.random.seed(42)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Load preprocessed data
    print("[INFO] Loading preprocessed data...")
    X_train_full = np.load(DATA_DIR / "X_train.npy")
    y_train_full = np.load(DATA_DIR / "y_train.npy")
    X_test       = np.load(DATA_DIR / "X_test.npy")
    y_test       = np.load(DATA_DIR / "y_test.npy")

    # 2. Create separate Validation split from Train set
    print(f"[INFO] Creating validation split ({int(VAL_SIZE*100)}% of train set)...")
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_full, y_train_full,
        test_size=VAL_SIZE,
        random_state=42,
        stratify=y_train_full
    )

    print(f"[OK] Train set      : {X_train.shape} ({len(y_train)} samples)")
    print(f"[OK] Validation set : {X_val.shape} ({len(y_val)} samples)")
    print(f"[OK] Test set       : {X_test.shape} ({len(y_test)} samples)")

    # 3. Build model
    model = build_model(NUM_CLASSES, IMG_SIZE)
    model.summary()

    # 4. Setup Callbacks
    cbs = [
        callbacks.ModelCheckpoint(
            str(MODEL_PATH),
            save_best_only=True,
            monitor="val_accuracy",
            verbose=1
        ),
        callbacks.EarlyStopping(
            patience=10,
            restore_best_weights=True,
            monitor="val_accuracy",
            verbose=1
        ),
        callbacks.ReduceLROnPlateau(
            factor=0.5,
            patience=3,
            monitor="val_loss",
            min_lr=1e-6,
            verbose=1
        ),
    ]

    # 5. Fit Model with separate Validation Data
    print("\n[INFO] Starting training...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=cbs,
        verbose=1,
    )

    # 6. Save Training History
    hist_dict = {k: [float(val) for val in v] for k, v in history.history.items()}
    with open(HIST_PATH, "w") as f:
        json.dump(hist_dict, f, indent=2)
    print(f"[OK] Saved training history to: {HIST_PATH}")

    # 7. Final Evaluation on Held-Out Test Set
    print("\n[INFO] Evaluating best checkpoint on held-out test set...")
    best_model = tf.keras.models.load_model(str(MODEL_PATH))
    test_loss, test_acc = best_model.evaluate(X_test, y_test, verbose=0)
    print(f"\n[RESULT] Final Test Accuracy: {test_acc*100:.2f}% (Loss: {test_loss:.4f})")
    print(f"[RESULT] Model checkpoint saved to: {MODEL_PATH}")


if __name__ == "__main__":
    main()
