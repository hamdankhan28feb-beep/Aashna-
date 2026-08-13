"""
Convert ASL_DeepCNN keras model to TF.js using tf_keras (Keras 2 legacy API).
tf_keras produces model.json in the format TF.js can load (Keras 2 format).
"""
import sys
import json
import struct
import numpy as np
from pathlib import Path

# Use tf_keras (Keras 2 compat) for serialization — avoids Keras 3 format issues
import tf_keras as keras
import tensorflow as tf

KERAS_PATH = Path("ml/models/asl_model.keras")
OUT_DIR    = Path("frontend/public/models/asl_model")
OUT_DIR.mkdir(parents=True, exist_ok=True)

print("[1/5] Loading model with tf_keras...")

# Load with standard tf.keras first to get weights
model_tf = tf.keras.models.load_model(str(KERAS_PATH))
print(f"      Name={model_tf.name}  input={model_tf.input_shape}  output={model_tf.output_shape}")

# Rebuild equivalent model in tf_keras (Keras 2) so .to_json() gives TF.js-compatible format
print("[2/5] Rebuilding model in tf_keras (Keras 2 format)...")
inputs = keras.Input(shape=(64, 64, 3), name="input_1")
x = inputs

# Conv Block 1
x = keras.layers.Conv2D(32, 3, padding="same", activation="relu", name="conv2d")(x)
x = keras.layers.BatchNormalization(name="batch_normalization")(x)
x = keras.layers.Conv2D(32, 3, padding="same", activation="relu", name="conv2d_1")(x)
x = keras.layers.BatchNormalization(name="batch_normalization_1")(x)
x = keras.layers.MaxPooling2D(2, name="max_pooling2d")(x)
x = keras.layers.Dropout(0.2, name="dropout")(x)

# Conv Block 2
x = keras.layers.Conv2D(64, 3, padding="same", activation="relu", name="conv2d_2")(x)
x = keras.layers.BatchNormalization(name="batch_normalization_2")(x)
x = keras.layers.Conv2D(64, 3, padding="same", activation="relu", name="conv2d_3")(x)
x = keras.layers.BatchNormalization(name="batch_normalization_3")(x)
x = keras.layers.MaxPooling2D(2, name="max_pooling2d_1")(x)
x = keras.layers.Dropout(0.25, name="dropout_1")(x)

# Conv Block 3
x = keras.layers.Conv2D(128, 3, padding="same", activation="relu", name="conv2d_4")(x)
x = keras.layers.BatchNormalization(name="batch_normalization_4")(x)
x = keras.layers.Conv2D(128, 3, padding="same", activation="relu", name="conv2d_5")(x)
x = keras.layers.BatchNormalization(name="batch_normalization_5")(x)
x = keras.layers.MaxPooling2D(2, name="max_pooling2d_2")(x)
x = keras.layers.Dropout(0.3, name="dropout_2")(x)

# Conv Block 4
x = keras.layers.Conv2D(256, 3, padding="same", activation="relu", name="conv2d_6")(x)
x = keras.layers.BatchNormalization(name="batch_normalization_6")(x)
x = keras.layers.MaxPooling2D(2, name="max_pooling2d_3")(x)
x = keras.layers.Dropout(0.3, name="dropout_3")(x)

# Dense Head
x = keras.layers.Flatten(name="flatten")(x)
x = keras.layers.Dense(512, activation="relu", name="dense")(x)
x = keras.layers.BatchNormalization(name="batch_normalization_7")(x)
x = keras.layers.Dropout(0.4, name="dropout_4")(x)
x = keras.layers.Dense(256, activation="relu", name="dense_1")(x)
x = keras.layers.BatchNormalization(name="batch_normalization_8")(x)
x = keras.layers.Dropout(0.3, name="dropout_5")(x)
outputs = keras.layers.Dense(36, activation="softmax", name="dense_2")(x)

model_k2 = keras.Model(inputs, outputs, name="ASL_DeepCNN")

print("[3/5] Copying weights from original model...")
# The original model has augmentation layers (RandomRotation, RandomZoom, RandomTranslation)
# before the conv layers — those have no weights. We copy only the conv/bn/dense weights.
# Map by layer name
orig_weight_dict = {layer.name: layer for layer in model_tf.layers if layer.weights}
k2_layers_with_weights = [l for l in model_k2.layers if l.weights]

transferred = 0
for k2_layer in k2_layers_with_weights:
    if k2_layer.name in orig_weight_dict:
        orig_layer = orig_weight_dict[k2_layer.name]
        k2_layer.set_weights(orig_layer.get_weights())
        transferred += 1
        print(f"      ✓ {k2_layer.name}")
    else:
        print(f"      ✗ NOT FOUND: {k2_layer.name}")

print(f"      Transferred {transferred} / {len(k2_layers_with_weights)} layers")

print("[4/5] Getting Keras 2 model.json config...")
model_json = json.loads(model_k2.to_json())

print("[5/5] Writing TF.js files...")
# Collect weights in order
weight_specs = []
weight_arrays = []
for layer in model_k2.layers:
    for w in layer.weights:
        arr = w.numpy().astype(np.float32)
        # TF.js requires names WITHOUT the ':0' suffix (e.g. 'conv2d/kernel' not 'conv2d/kernel:0')
        name = w.name.replace(":0", "")
        weight_specs.append({"name": name, "shape": list(arr.shape), "dtype": "float32"})
        weight_arrays.append(arr)

# Write binary weights
bin_path = OUT_DIR / "group1-shard1of1.bin"
with open(bin_path, "wb") as f:
    for arr in weight_arrays:
        f.write(arr.tobytes())

# Build TF.js JSON
tfjs_json = {
    "format": "layers-model",
    "generatedBy": "tf_keras 2.x compat",
    "convertedBy": "convert_to_tfjs_k2.py",
    "modelTopology": model_json,
    "weightsManifest": [
        {
            "paths": ["group1-shard1of1.bin"],
            "weights": [{"name": s["name"], "shape": s["shape"], "dtype": s["dtype"]}
                        for s in weight_specs]
        }
    ]
}

json_path = OUT_DIR / "model.json"
with open(json_path, "w") as f:
    json.dump(tfjs_json, f, separators=(",", ":"))

print(f"\n✅ Done!")
print(f"   model.json  : {json_path.stat().st_size/1e3:.1f} KB")
print(f"   weights.bin : {bin_path.stat().st_size/1e6:.1f} MB")
print(f"   Layers with weights transferred: {transferred}")
