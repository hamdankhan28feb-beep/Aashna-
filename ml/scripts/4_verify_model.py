import tensorflow as tf
import numpy as np
import json
import os

print("🔍 Verifying trained model...\n")

# Load model
model_path = 'ml/models/asl_model.keras'
if not os.path.exists(model_path):
    print(f"❌ Model not found at {model_path}")
    print(f"Looking for: {os.path.abspath(model_path)}")
    exit()

print("Loading model...")
model = tf.keras.models.load_model(model_path)
print("✅ Model loaded successfully!")

# Print model info
print(f"\nModel Architecture:")
print(f"  Input shape:  {model.input_shape}")
print(f"  Output shape: {model.output_shape}")
print(f"  Total parameters: {model.count_params():,}")

# Load test data
print(f"\nLoading test data...")
X_test = np.load('ml/data/processed/X_test.npy')
y_test = np.load('ml/data/processed/y_test.npy')
print(f"✅ Test data loaded: {X_test.shape}")

# Evaluate
print(f"\nEvaluating on test set...")
loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
print(f"✅ Test Loss: {loss:.4f}")
print(f"✅ Test Accuracy: {accuracy*100:.2f}%")

# Try to load class names
try:
    with open('ml/data/processed/classes.txt', 'r') as f:
        classes = [line.strip() for line in f.readlines()]
    print(f"\n📊 Classes recognized: {len(classes)}")
    print(f"   {classes}")
except:
    print("\n⚠️  classes.txt not found, creating it...")
    classes = [chr(65 + i) for i in range(26)]  # A-Z
    with open('ml/data/processed/classes.txt', 'w') as f:
        f.write('\n'.join(classes))
    print(f"   Created with {len(classes)} classes: {classes}")

# Save results
results = {
    'accuracy': float(accuracy),
    'loss': float(loss),
    'test_samples': int(len(X_test)),
    'input_shape': list(model.input_shape),
    'output_shape': list(model.output_shape),
    'parameters': int(model.count_params()),
    'classes': classes
}

os.makedirs('ml/models', exist_ok=True)
with open('ml/models/verification_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f"\n✨ Results saved to ml/models/verification_results.json")

if accuracy >= 0.95:
    print(f"\n🎉 EXCELLENT! Model is ready for deployment!")
elif accuracy >= 0.90:
    print(f"\n👍 GOOD! Model is usable.")
else:
    print(f"\n⚠️  WARNING: Accuracy < 90%, may need retraining")