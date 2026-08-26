import * as tf from '@tensorflow/tfjs';

// YOLOv8 TFJS models are loaded as GraphModels, not LayersModels!
let yoloCache: tf.GraphModel | null = null;
const YOLO_MODEL_URL = '/models/yolo_hand/model.json';

export async function loadYoloModel(): Promise<tf.GraphModel> {
  if (yoloCache) return yoloCache;
  console.log("[YOLO] Loading model from:", YOLO_MODEL_URL);
  try {
    const model = await tf.loadGraphModel(YOLO_MODEL_URL);
    yoloCache = model;
    console.log("[YOLO] Model loaded.");
    return model;
  } catch (error) {
    console.error("[YOLO] Failed to load model:", error);
    throw error;
  }
}

export interface BoundingBox {
  x: number; // Top-left X (pixel)
  y: number; // Top-left Y (pixel)
  w: number; // Width (pixel)
  h: number; // Height (pixel)
  confidence: number;
}

export async function detectHand(videoElement: HTMLVideoElement | HTMLCanvasElement): Promise<BoundingBox | null> {
  const model = await loadYoloModel();
  
  // YOLOv8 expects 640x640 images, normalized 0-1
  const tensor = tf.tidy(() => {
    return tf.browser.fromPixels(videoElement)
      .resizeBilinear([640, 640])
      .expandDims(0)
      .toFloat()
      .div(255.0);
  });

  const predictions = await model.executeAsync(tensor) as tf.Tensor;
  
  // YOLOv8 output shape is [1, 5, 8400] for a 1-class model (x,y,w,h,conf)
  // Or [1, 8400, 5] depending on the export format. 
  // Let's assume standard ultralytics tfjs export: [1, 5, 8400]
  const data = await predictions.data();
  predictions.dispose();
  tensor.dispose();

  const numAnchors = 8400; // standard for 640x640
  const numChannels = data.length / numAnchors; // Usually 5 (x, y, w, h, class_0_conf)

  let bestConf = 0;
  let bestIdx = -1;

  // Find the anchor with the highest confidence for class 0 (person)
  // If shape is [1, 84, 8400], memory layout is:
  // 8400 x's, 8400 y's, 8400 w's, 8400 h's, then 8400 confs for class 0, etc.
  if (numChannels === 84 || numChannels === 5) {
      const confOffset = 4 * numAnchors; // Class 0 confidence starts here
      for (let i = 0; i < numAnchors; i++) {
        const conf = data[confOffset + i];
        if (conf > bestConf) {
          bestConf = conf;
          bestIdx = i;
        }
      }

      if (bestConf > 0.4 && bestIdx !== -1) { // lowered threshold slightly to ensure detection
        // YOLO outputs center_x, center_y, width, height (normalized to 640x640)
        const cx = data[bestIdx];
        const cy = data[numAnchors + bestIdx];
        const w = data[2 * numAnchors + bestIdx];
        const h = data[3 * numAnchors + bestIdx];

        // Convert to percentage of frame (0 to 1)
        return {
          x: (cx - w / 2) / 640,
          y: (cy - h / 2) / 640,
          w: w / 640,
          h: h / 640,
          confidence: bestConf
        };
      }
  }

  return null;
}
