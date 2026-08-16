import * as tf from "@tensorflow/tfjs";
import type { Prediction } from "../types";
import type { SignMode } from "../store/predictionSlice";

// The unified 36-class model outputs classes in this exact order: 0-9, then a-z
// This matches the label_mapping.json from the training pipeline.
// Class order matches label_mapping.json: indices 0-9 → digits, 10-35 → a-z lowercase
const ALL_36_CLASSES = [
  "0","1","2","3","4","5","6","7","8","9",
  "a","b","c","d","e","f","g","h","i","j",
  "k","l","m","n","o","p","q","r","s","t",
  "u","v","w","x","y","z"
];

// Allowed index range for each mode within the 36-class output.
// Argmax is restricted to this range so out-of-mode classes are never returned.
const MODE_RANGE: Record<string, { start: number; end: number }> = {
  letters: { start: 10, end: 35 }, // a-z
  numbers: { start: 0,  end: 9  }, // 0-9
};

// All modes use the single unified 36-class model
const MODEL_URL = "/models/asl_model/model.json";

let modelCache: tf.LayersModel | null = null;

// ── DIAGNOSTIC: throttle timestamp (remove after diagnosis) ──────────────────
let _lastDiagLog = 0;

export async function loadModel(_mode: SignMode): Promise<tf.LayersModel> {
  if (modelCache) return modelCache;

  console.log("[ModelService] Loading ASL model from:", MODEL_URL);
  try {
    const model = await tf.loadLayersModel(MODEL_URL);
    modelCache = model;
    console.log("[ModelService] Model loaded. Output shape:", model.outputShape);
    return model;
  } catch (error) {
    console.error("[ModelService] Failed to load model:", error);
    throw error;
  }
}

export async function predictFrame(pixels: tf.Tensor3D, mode: SignMode): Promise<Prediction> {
  try {
    const net = await loadModel(mode);

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

    // Restrict argmax to the indices allowed for the current mode.
    // Falls back to the full range [0-35] if mode has no entry (defensive).
    const { start, end } = MODE_RANGE[mode] ?? { start: 0, end: 35 };
    let bestIdx = start;
    for (let i = start + 1; i <= end; i++) {
      if (probs[i] > probs[bestIdx]) bestIdx = i;
    }

    const predicted = ALL_36_CLASSES[bestIdx] ?? "?";
    const confidence = probs[bestIdx] ?? 0;

    // ── DIAGNOSTIC LOGGING (throttled to every 500 ms) ───────────────────────
    // TODO: remove this block once diagnosis is complete.
    const now = Date.now();
    if (now - _lastDiagLog >= 500) {
      _lastDiagLog = now;
      if (mode === 'numbers') {
        // Show all 10 digit probabilities so we can see where mass is pooling
        const digitProbs = Array.from(probs)
          .slice(0, 10)
          .map((p, i) => `${i}=${(p * 100).toFixed(1)}%`);
        console.log(
          `[DIAG-numbers] winner=${ALL_36_CLASSES[bestIdx]}(idx${bestIdx}) ` +
          `rawConf=${(confidence * 100).toFixed(1)}% | ` +
          `digits: [${digitProbs.join("  ")}]`
        );
      } else {
        // Compact top-3 for non-Numbers modes
        const ranked = Array.from(probs)
          .map((p, i) => ({ cls: ALL_36_CLASSES[i] ?? i, p }))
          .sort((a, b) => b.p - a.p)
          .slice(0, 3);
        console.log(
          `[Prediction] Top-3: ${ranked.map(r => `${r.cls}=${(r.p * 100).toFixed(1)}%`).join(", ")}`
        );
      }
    }
    // ── END DIAGNOSTIC ────────────────────────────────────────────────────────

    return {
      letter: predicted,
      confidence,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error("[ModelService] Prediction error:", err);
    return {
      letter: "?",
      confidence: 0,
      timestamp: Date.now(),
    };
  }
}
