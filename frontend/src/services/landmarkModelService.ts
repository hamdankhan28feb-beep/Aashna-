import * as tf from "@tensorflow/tfjs";
import type { Prediction } from "../types";
import type { SignMode } from "../store/predictionSlice";
import type { NormalizedLandmarkList } from "@mediapipe/hands";

// ─── Class mapping (must match extract_landmarks.py's sorted order) ──────────
// extract_landmarks.py sorts folders case-insensitively → '0'..'9', 'a'..'z'
// That produces the same ordering as modelService.ts ALL_36_CLASSES.
const ALL_36_CLASSES = [
  "0","1","2","3","4","5","6","7","8","9",
  "a","b","c","d","e","f","g","h","i","j",
  "k","l","m","n","o","p","q","r","s","t",
  "u","v","w","x","y","z",
];

const MODE_RANGE: Record<string, { start: number; end: number }> = {
  letters: { start: 10, end: 35 }, // a-z
  numbers: { start: 0,  end: 9  }, // 0-9
};

const LANDMARK_MODEL_URL = "/models/landmark_model/model.json";

// Cached model reference (set once on first successful load, never re-loaded).
let landmarkModelCache: tf.LayersModel | null = null;
// If the load failed once, store the error so subsequent prediction calls
// fail fast (throw immediately) rather than retrying the network request
// every frame, which would spam console errors and stall the camera loop.
let landmarkModelLoadError: unknown = null;

export async function loadLandmarkModel(): Promise<tf.LayersModel> {
  if (landmarkModelCache) return landmarkModelCache;
  if (landmarkModelLoadError) throw landmarkModelLoadError;

  console.log("[LandmarkModelService] Loading landmark model from:", LANDMARK_MODEL_URL);
  try {
    const model = await tf.loadLayersModel(LANDMARK_MODEL_URL);
    landmarkModelCache = model;
    console.log("[LandmarkModelService] Model loaded. Output shape:", model.outputShape);
    return model;
  } catch (error) {
    landmarkModelLoadError = error;   // remember it — don't retry
    console.error("[LandmarkModelService] Failed to load model:", error);
    throw error;
  }
}

/** Call this when the user explicitly re-toggles the landmark model on,
 *  to allow a fresh load attempt after a prior failure. */
export function resetLandmarkModelCache(): void {
  landmarkModelCache = null;
  landmarkModelLoadError = null;
}

// ─── Normalisation ────────────────────────────────────────────────────────────
// ⚠ MUST be numerically identical to the Python function in extract_landmarks.py
//
// Python (extract_landmarks.py):
//   pts = np.array([[lm.x, lm.y, lm.z] for lm in landmarks])  # (21,3)
//   pts -= pts[0]                  # step 1: origin at wrist (index 0)
//   scale = ||pts[9]||             # step 2: distance to middle-finger MCP (index 9)
//   pts /= scale
//   return pts.flatten()           # (63,)
//
// TypeScript (this function):
//   pts[i] = { x: lm.x - wrist.x, y: lm.y - wrist.y, z: lm.z - wrist.z }
//   scale  = sqrt(pts[9].x² + pts[9].y² + pts[9].z²)   (identical operation)
//   each coord /= scale
//   flatten to Float32Array of length 63
//
// The two implementations are numerically identical for finite IEEE-754 floats.
const WRIST_IDX = 0;
const SCALE_IDX = 9; // middle-finger MCP

export function normaliseLandmarks(
  landmarks: NormalizedLandmarkList
): Float32Array | null {
  if (!landmarks || landmarks.length < 21) {
    console.warn("[LandmarkModelService] Normalization skipped - landmark count < 21:", landmarks?.length);
    return null;
  }

  const wrist = landmarks[WRIST_IDX];

  // Step 1 — translate so wrist is origin (0, 0, 0)
  const pts = landmarks.map((lm) => ({
    x: lm.x - wrist.x,
    y: lm.y - wrist.y,
    z: lm.z - wrist.z,
  }));

  // Step 2 — scale by distance from (translated) wrist to (translated) SCALE_IDX
  const p9 = pts[SCALE_IDX];
  const scale = Math.sqrt(p9.x * p9.x + p9.y * p9.y + p9.z * p9.z);

  if (scale < 1e-6) {
    console.warn("[LandmarkModelService] Normalization skipped - scale too small:", scale);
    return null;
  }

  // Flatten to Float32Array of shape (63,) — [x0,y0,z0, x1,y1,z1, ..., x20,y20,z20]
  const out = new Float32Array(21 * 3);
  for (let i = 0; i < 21; i++) {
    out[i * 3 + 0] = pts[i].x / scale;
    out[i * 3 + 1] = pts[i].y / scale;
    out[i * 3 + 2] = pts[i].z / scale;
  }
  return out;
}

// ─── Prediction ───────────────────────────────────────────────────────────────
export async function predictLandmarks(
  landmarks: NormalizedLandmarkList,
  mode: SignMode
): Promise<Prediction> {
  try {
    const vec = normaliseLandmarks(landmarks);
    if (!vec) {
      console.warn("[LandmarkModelService] predictLandmarks: Normalized vector is null");
      return { letter: "?", confidence: 0, timestamp: Date.now() };
    }

    console.log("[LandmarkModelService] Normalized vector (63 floats):", Array.from(vec.slice(0, 9)), "... (first 9 of 63)");

    const net = await loadLandmarkModel();

    const input = tf.tidy(() =>
      tf.tensor(vec, [1, 63], "float32")
    );

    const output  = net.predict(input) as tf.Tensor;
    const probs   = await output.data();
    input.dispose();
    output.dispose();

    console.log("[LandmarkModelService] Raw output probabilities (36 classes):", Array.from(probs));

    const { start, end } = MODE_RANGE[mode] ?? { start: 0, end: 35 };
    let bestIdx = start;
    for (let i = start + 1; i <= end; i++) {
      if (probs[i] > probs[bestIdx]) bestIdx = i;
    }

    const predicted  = ALL_36_CLASSES[bestIdx] ?? "?";
    const confidence = probs[bestIdx] ?? 0;

    console.log(`[LandmarkModelService] Prediction result: '${predicted}' (idx: ${bestIdx}) with confidence: ${(confidence * 100).toFixed(2)}% in mode: '${mode}'`);

    return {
      letter:     mode === "letters" || mode === "phrases"
                    ? predicted.toUpperCase()
                    : predicted,
      confidence,
      timestamp: Date.now(),
    };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? { message: err.message, stack: err.stack } : err;
    console.error("[LandmarkModelService] Prediction exception caught:", errorObj);
    return { letter: "?", confidence: 0, timestamp: Date.now() };
  }
}
