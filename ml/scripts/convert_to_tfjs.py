"""
Convert the trained Keras model to TensorFlow.js format and drop it directly
into frontend/public/models/asl_model/ so the frontend can load it as-is.

Usage:
    python scripts/convert_to_tfjs.py
"""
from pathlib import Path
import tensorflowjs as tfjs
import tensorflow as tf

MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "asl_model.keras"
OUT_DIR = Path(__file__).resolve().parents[2] / "frontend" / "public" / "models" / "asl_model"


def main():
    if not MODEL_PATH.exists():
        raise SystemExit(f"No trained model found at {MODEL_PATH}. Run scripts/train.py first.")

    print(f"Loading {MODEL_PATH}")
    model = tf.keras.models.load_model(MODEL_PATH)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    tfjs.converters.save_keras_model(model, str(OUT_DIR))

    print(f"\nTF.js model written to: {OUT_DIR}")
    print("Frontend can load it with: tf.loadLayersModel('/models/asl_model/model.json')")


if __name__ == "__main__":
    main()
