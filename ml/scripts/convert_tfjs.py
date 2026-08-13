import os
import json
import numpy as np
import tensorflow as tf
from pathlib import Path

print("🔄 Converting to TensorFlow.js format...\n")

# Load model
model = tf.keras.models.load_model('ml/models/asl_model.keras')
print("✅ Model loaded")

# Create output directory
output_dir = Path('frontend/public/models/asl_model_web')
output_dir.mkdir(parents=True, exist_ok=True)

# Convert to JSON format that TensorFlow.js understands
model_json = {
    "class_name": "Sequential",
    "config": {
        "name": "asl_model",
        "layers": []
    },
    "keras_version": "3.0.0"
}

# Get model weights
weights_data = []
for i, w in enumerate(model.weights):
    weights_data.append(w.numpy().tobytes())

# Save model.json
model_config = model.to_json()
with open(output_dir / 'model.json', 'w') as f:
    f.write(model_config)

print("✅ model.json created")

# Save weights as binary
weights_bytes = b''.join(weights_data)
with open(output_dir / 'weights.bin', 'wb') as f:
    f.write(weights_bytes)

print("✅ weights.bin created")

# Create metadata
metadata = {
    "format": "layers-model",
    "generatedBy": "tfjs-converter",
    "convertedBy": "asl-bridge",
    "modelTopology": json.loads(model_config),
    "weightsManifest": [
        {
            "name": "weights",
            "paths": ["weights.bin"]
        }
    ]
}

with open(output_dir / 'model.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("✅ model.json updated with metadata")

print(f"\n✨ Conversion complete!")
print(f"📁 Output: {output_dir}")
print(f"📋 Files:")
for file in output_dir.iterdir():
    if file.is_file():
        size = file.stat().st_size / 1024
        print(f"   - {file.name} ({size:.1f} KB)")

