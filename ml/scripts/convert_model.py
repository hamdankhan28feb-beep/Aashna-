import tensorflow as tf
from pathlib import Path

print("🔄 Converting model...\n")
model = tf.keras.models.load_model('ml/models/asl_model.keras')
print("✅ Model loaded")

output_dir = Path('frontend/public/models/asl_model_web')
output_dir.mkdir(parents=True, exist_ok=True)

tf.keras.saving.save_model(
    model,
    str(output_dir),
    save_format='tf',
    include_optimizer=False
)

print("✅ Conversion successful!")
