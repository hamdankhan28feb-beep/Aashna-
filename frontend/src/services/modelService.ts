import * as tf from "@tensorflow/tfjs";
import type { Prediction } from "../types";

const CLASSES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MODEL_URL = "/models/asl_model/model.json";

let model: tf.LayersModel | null = null;

export async function loadModel(): Promise<tf.LayersModel> {
  if (model) return model;
  model = await tf.loadLayersModel(MODEL_URL);
  return model;
}

/**
 * Run inference on a 64x64 RGB frame (e.g. cropped hand region from the
 * webcam via MediaPipe). Returns the highest-confidence letter prediction.
 */
export async function predictFrame(pixels: tf.Tensor3D): Promise<Prediction> {
  const net = await loadModel();

  const input = tf.tidy(() =>
    pixels
      .resizeBilinear([64, 64])
      .toFloat()
      .div(255.0)
      .expandDims(0)
  );

  const output = net.predict(input) as tf.Tensor;
  const probs = await output.data();
  input.dispose();
  output.dispose();

  let bestIdx = 0;
  for (let i = 1; i < probs.length; i++) {
    if (probs[i] > probs[bestIdx]) bestIdx = i;
  }

  return {
    letter: CLASSES[bestIdx],
    confidence: probs[bestIdx],
    timestamp: Date.now(),
  };
}
