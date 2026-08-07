import * as tf from "@tensorflow/tfjs";
import type { Prediction } from "../types";
import type { SignMode } from "../store/predictionSlice";

const CLASSES_MAP = {
  letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  numbers: "0123456789".split(""),
  phrases: ["Hello", "Thank You", "Yes", "No", "Please"]
};

const MODEL_URLS = {
  letters: "/models/asl_model/model.json",
  numbers: "/models/asl_numbers_model/model.json",
  phrases: "/models/asl_phrases_model/model.json"
};

const modelsCache: Record<string, tf.LayersModel | null> = {
  letters: null,
  numbers: null,
  phrases: null,
};

export async function loadModel(mode: SignMode): Promise<tf.LayersModel> {
  if (modelsCache[mode]) return modelsCache[mode]!;
  
  try {
    const model = await tf.loadLayersModel(MODEL_URLS[mode]);
    modelsCache[mode] = model;
    return model;
  } catch (error) {
    console.error(`Failed to load model for ${mode}. Using placeholder.`, error);
    throw error;
  }
}

export async function predictFrame(pixels: tf.Tensor3D, mode: SignMode): Promise<Prediction> {
  try {
    const net = await loadModel(mode);
    const classes = CLASSES_MAP[mode];

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
      letter: classes[bestIdx] || "?",
      confidence: probs[bestIdx] || 0,
      timestamp: Date.now(),
    };
  } catch (err) {
    // Return a dummy prediction if model is not found so UI doesn't crash completely
    return {
      letter: "?",
      confidence: 0,
      timestamp: Date.now(),
    };
  }
}
