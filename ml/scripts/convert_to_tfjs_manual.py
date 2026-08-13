"""
Convert asl_model.keras → TF.js LayersModel format without the tensorflowjs package.

Produces:
    frontend/public/models/asl_model/
        model.json          (topology + weightsManifest with full tensor metadata)
        group1-shard1of1.bin  (all weights concatenated as float32 little-endian)

Usage:
    python ml/scripts/convert_to_tfjs_manual.py
"""
from pathlib import Path
import json, struct
import numpy as np
import tensorflow as tf

MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "asl_model.keras"
OUT_DIR    = Path(__file__).resolve().parents[2] / "frontend" / "public" / "models" / "asl_model"
BIN_NAME   = "group1-shard1of1.bin"

def main():
    if not MODEL_PATH.exists():
        raise SystemExit(f"Model not found: {MODEL_PATH}. Run train.py first.")

    print(f"Loading {MODEL_PATH} ...")
    model = tf.keras.models.load_model(str(MODEL_PATH))
    print(f"  Input : {model.input_shape}")
    print(f"  Output: {model.output_shape}")
    print(f"  Params: {model.count_params():,}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # ── 1. Collect weights ──────────────────────────────────────────────────
    weight_entries = []   # metadata for weightsManifest
    raw_chunks     = []   # bytes to concatenate into .bin

    for var in model.weights:
        arr = var.numpy().astype(np.float32)          # TF.js always wants float32
        raw_chunks.append(arr.tobytes())

        weight_entries.append({
            "name"  : var.path,                       # e.g. "conv2d/kernel:0"
            "shape" : list(arr.shape),
            "dtype" : "float32",
        })

    bin_bytes = b"".join(raw_chunks)
    bin_path  = OUT_DIR / BIN_NAME
    bin_path.write_bytes(bin_bytes)
    print(f"  Wrote {len(bin_bytes)/1024:.1f} KB -> {bin_path.name}")

    # ── 2. Build model topology ─────────────────────────────────────────────
    # TF.js expects the raw Keras JSON config inside "modelTopology"
    topology = json.loads(model.to_json())

    # ── 3. Assemble model.json ──────────────────────────────────────────────
    model_json = {
        "format"      : "layers-model",
        "generatedBy" : f"keras {tf.keras.__version__}",
        "convertedBy" : "convert_to_tfjs_manual.py",
        "modelTopology": topology,
        "weightsManifest": [
            {
                "paths"  : [BIN_NAME],
                "weights": weight_entries,
            }
        ],
    }

    json_path = OUT_DIR / "model.json"
    json_path.write_text(json.dumps(model_json, indent=2))
    print(f"  Wrote model.json  ({json_path.stat().st_size/1024:.1f} KB)")
    print(f"  Weight tensors: {len(weight_entries)}")

    print(f"\nDone! TF.js model written to:\n  {OUT_DIR}")
    print(f"\nFrontend loads it with:")
    print(f'  tf.loadLayersModel("/models/asl_model/model.json")')

if __name__ == "__main__":
    main()
