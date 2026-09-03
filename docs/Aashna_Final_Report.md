# Aashna — Sign Language Bridge
## Technical Project Report

**Date:** August 28, 2026
**Project:** Aashna — Real-Time ASL Recognition Web Application
**Status:** Functional Prototype — Single Production Model, Active Gamification & Firebase Integration

---

## 1. Project Overview & Motivation

### Problem Statement

Approximately 70 million people worldwide use sign languages as their primary mode of communication. For deaf and hard-of-hearing individuals who communicate in American Sign Language (ASL), interactions with people who do not know ASL require an interpreter or are simply not possible. Interpreter services are expensive, not always available, and do not scale to informal, day-to-day interactions.

### What Aashna Does (Current Capability — Accurately Stated)

Aashna is a web application that uses the device camera to recognize static ASL hand signs for individual letters (A–Z) and digits (0–9) in real time, directly in the browser, without sending any video data to a server. When a sign is held steadily for one second with confidence above 70%, the corresponding character is appended to an on-screen text buffer. The user can then read back the accumulated text or trigger the browser's built-in Text-to-Speech (TTS) engine to speak it aloud.

The application also includes a full set of gamified learning tools: ASL flashcards, a Duolingo-style quiz mode, a spelling bee mode, a roleplay scenario view, an achievements/badges system (20 unique badges), and a Firebase-backed leaderboard.

**What the app does NOT currently do:** It does not recognize dynamic or motion-based signs (e.g., J and Z, which are traced in the air). It does not translate ASL into sentence-level English using grammatical ASL structure. Backend-side translation and server-side text-to-speech are not yet implemented.

---

## 2. System Architecture

### End-to-End Data Flow

```
Camera (640×480, up to 60 fps)
         │
         ▼
[Preprocessing Canvas] — adaptive gamma correction for low-light frames
         │
         ▼
[MediaPipe Hands] — landmark detection (21 3D keypoints per hand)
         │
         ▼
┌───────────────────────────────────────────────────────────┐
│  PRIMARY PATH: Landmark MLP (landmarkModelService.ts)    │
│                                                           │
│  [Normalize Landmarks]                                    │
│    • Translate so wrist (landmark 0) is origin            │
│    • Scale by distance to middle-finger MCP (landmark 9)  │
│    • Flatten to 63 floats (21 × 3 coords)                │
│         │                                                 │
│         ▼                                                 │
│  [MLP Model: /models/landmark_model/model.json]          │
│    • Input(63) → Dense(64,relu) → Dropout(0.2)           │
│    • → Dense(32,relu) → Dropout(0.1)                     │
│    • → Dense(36, softmax)                                │
│    • argmax restricted to mode range                      │
├───────────────────────────────────────────────────────────┤
│  FALLBACK PATH: CNN (modelService.ts) — available but   │
│  not actively used (useLandmarkModel hardcoded to true)  │
│                                                           │
│  [Square Crop + Pad from landmark bounding box]           │
│  [Hidden Canvas 64×64] → tf.browser.fromPixels()         │
│  [CNN Model: /models/asl_model/model.json]               │
└───────────────────────────────────────────────────────────┘
         │
         ▼
[Confidence & Stability Gate]
  • Confidence threshold: 0.70
  • Hold stability: same sign must be predicted continuously for 1,000 ms
  • On stable, confident detection: dispatch(appendLetter())
         │
         ▼
[Redux Store] — predictionSlice
  • current: { letter, confidence, timestamp }
  • text: accumulated string
         │
         ▼
[OutputPanel] — displays confidence bar + current letter + text buffer
[ControlsBar] — Space / Backspace / Speak (Web Speech API) / Clear
         │
         ▼
[Gamification Layer] — XP, levels, streaks, badges, Firestore-backed leaderboard
```

### Client-Side vs. Server-Side

| Component | Where it runs | Reason |
|---|---|---|
| Camera capture | Client (browser) | Privacy — video never leaves the device |
| MediaPipe Hands | Client (browser CDN) | Latency — network round-trip would break real-time UX |
| CNN inference (TF.js) | Client (browser WebGL) | Privacy + latency; no server cost per prediction (fallback path) |
| Landmark MLP inference (TF.js) | Client (browser) | Primary recognition engine — lightweight, fast |
| Text-to-Speech | Client (Web Speech API) | Free, no API key needed, sufficient for MVP |
| Progress, badges, leaderboard | Client + Firebase | Firestore-backed sync; working in production |
| AI Chat (Gemini) | Server (Node.js) → Google Gemini API | `/api/chat` is the only fully functional backend endpoint |

### Tech Stack

| Technology | Version | Justification |
|---|---|---|
| React 18 | ^18.3.1 | Component model fits the real-time UI update pattern (confidence bar, text buffer, gamification widgets) |
| TypeScript | ^5.5.4 | Type safety across model prediction pipeline reduces silent bugs |
| Vite | ^5.3.5 | Fast HMR during development; efficient bundling for static deployment |
| Tailwind CSS | ^3.4.19 | Utility-first; avoids CSS class naming overhead for a UI-heavy project |
| Redux Toolkit | ^2.2.7 | Shared state (sign mode, current prediction, accumulated text) needed across many components |
| TensorFlow.js | ^4.22.0 | In-browser ML inference with WebGL GPU acceleration; supports Keras model conversion |
| MediaPipe Hands | ^0.4.1 | State-of-the-art real-time hand landmark detection from Google; runs on-device |
| Node.js + Express | (backend) | Lightweight REST API skeleton for server-side features not yet fully implemented |
| Firebase (Auth + Firestore) | ^12.18.0 | **Active and working** — progress sync, badges, and leaderboard are live |

---

## 3. Machine Learning Pipeline

### Dataset

The production model was trained on a curated ASL hand-sign image dataset, prepared via `ml/scripts/preprocess.py`.

| Attribute | Value |
|---|---|
| Classes | 36 (digits 0–9, letters a–z) |
| Image format | JPEG/PNG, cropped and resized to 64×64 RGB |
| Preprocessing | BGR→RGB conversion, pixel normalization to [0, 1] |
| Train/test split | 80% train / 20% test, stratified random split |
| Split method | `sklearn.model_selection.train_test_split` with `random_state=42`, `stratify=y` |

> **Note:** A stratified random split is appropriate here because the dataset is composed of independent static photographs, not sequential video frames. This distinction mattered directly during development — see Section 6, Challenge 2.

### Preprocessing Steps

1. **Image loading:** OpenCV reads each image from per-class folders; folder names determine labels.
2. **Resizing:** Every image resized to 64×64 pixels using `cv2.resize`.
3. **Color space correction:** BGR (OpenCV default) converted to RGB to match TensorFlow's expected channel order.
4. **Normalization:** Pixel values divided by 255.0, yielding float32 values in [0, 1].
5. **Augmentation during training (in-model):** `RandomRotation(0.05)`, `RandomZoom(0.05)`, `RandomTranslation(0.05, 0.05)` Keras layers are included inside the model's Sequential graph. These are active only during training and are automatically skipped at Keras inference time.

### Preprocessing Mismatch Fixed: Training vs. Live Camera

A key engineering challenge encountered and resolved during development was a mismatch between training-time preprocessing and live-camera preprocessing. Training images were naturally square; the initial live inference pipeline passed the raw MediaPipe bounding box to `drawImage()` at 64×64 without enforcing a square crop.

**The bug:** ASL hand signs often occupy a non-square area of the camera frame (a raised hand is taller than it is wide). Downscaling a non-square crop to a 64×64 square tensor distorts hand geometry — the model was trained on correctly proportioned images but was seeing geometrically incorrect input at runtime, causing specific letters to be misrecognized live despite good test-set accuracy.

**The fix (now in production):** `CameraView.tsx` computes the larger of the bounding-box width/height, forms a square region of that size, applies 15% padding, then passes that square crop to `drawImage()` at 64×64. This preserves the hand's aspect ratio before downscaling, matching training-time geometry.

**Technical significance:** This is a practical demonstration of why an inference preprocessing pipeline must be exactly identical to the training preprocessing pipeline — Conv2D filters learn spatial relationships that distortion silently breaks.

### Model Architecture

**Model name:** `ASL_DeepCNN`
**Format:** Keras Sequential, converted to TensorFlow.js `LayersModel` format
**Input:** `(64, 64, 3)` — RGB image, float32, normalized [0, 1]
**Output:** `(36,)` — softmax probability vector over 36 classes

```
Layer                          Output Shape       Approx. Parameters
─────────────────────────────────────────────────────────────────────
Input                          (None, 64, 64,  3)             0
RandomRotation(0.05)           (None, 64, 64,  3)             0  ← training only
RandomZoom(0.05)               (None, 64, 64,  3)             0  ← training only
RandomTranslation(0.05, 0.05)  (None, 64, 64,  3)             0  ← training only
─── Conv Block 1 ──────────────────────────────────────────────────
Conv2D(32, 3×3, same, relu)    (None, 64, 64, 32)           896
BatchNormalization             (None, 64, 64, 32)           128
Conv2D(32, 3×3, same, relu)    (None, 64, 64, 32)         9,248
BatchNormalization             (None, 64, 64, 32)           128
MaxPooling2D(2)                (None, 32, 32, 32)             0
Dropout(0.20)                  (None, 32, 32, 32)             0
─── Conv Block 2 ──────────────────────────────────────────────────
Conv2D(64, 3×3, same, relu)    (None, 32, 32, 64)        18,496
BatchNormalization             (None, 32, 32, 64)           256
Conv2D(64, 3×3, same, relu)    (None, 32, 32, 64)        36,928
BatchNormalization             (None, 32, 32, 64)           256
MaxPooling2D(2)                (None, 16, 16, 64)             0
Dropout(0.25)                  (None, 16, 16, 64)             0
─── Conv Block 3 ──────────────────────────────────────────────────
Conv2D(128, 3×3, same, relu)   (None, 16, 16, 128)       73,856
BatchNormalization             (None, 16, 16, 128)          512
Conv2D(128, 3×3, same, relu)   (None, 16, 16, 128)      147,584
BatchNormalization             (None, 16, 16, 128)          512
MaxPooling2D(2)                (None,  8,  8, 128)            0
Dropout(0.30)                  (None,  8,  8, 128)            0
─── Conv Block 4 ──────────────────────────────────────────────────
Conv2D(256, 3×3, same, relu)   (None,  8,  8, 256)      295,168
BatchNormalization             (None,  8,  8, 256)         1,024
MaxPooling2D(2)                (None,  4,  4, 256)            0
Dropout(0.30)                  (None,  4,  4, 256)            0
─── Dense Classifier Head ─────────────────────────────────────────
Flatten                        (None, 4096)                   0
Dense(512, relu)               (None, 512)            2,097,664
BatchNormalization             (None, 512)                2,048
Dropout(0.40)                  (None, 512)                    0
Dense(256, relu)               (None, 256)              131,328
BatchNormalization             (None, 256)                1,024
Dropout(0.30)                  (None, 256)                    0
Dense(36, softmax)             (None, 36)                 9,252
─────────────────────────────────────────────────────────────────────
Total trainable parameters: ≈ 2,826,308
```

### Training Methodology

**Script:** `ml/scripts/train.py`

| Setting | Value |
|---|---|
| Optimizer | Adam, initial lr = 0.001 |
| Loss | sparse_categorical_crossentropy |
| Max epochs | 60 |
| Batch size | 64 |
| Validation split | 15% of training set (stratified) |
| `ModelCheckpoint` | Saves best `val_accuracy` checkpoint only |
| `EarlyStopping` | patience=10, `restore_best_weights=True`, monitors `val_accuracy` |
| `ReduceLROnPlateau` | factor=0.5, patience=3, min_lr=1e-6, monitors `val_loss` |

### Current Production Model Status

**Model file on disk:** `ml/models/asl_model.keras`
**TFJS files served to browser:** `frontend/public/models/asl_model/model.json` + weight shards
**Confirmed active in `modelService.ts`:**

```typescript
const MODEL_URL = "/models/asl_model/model.json";
```

**V2 model:** Removed from the project entirely. `ml/models/asl_model_v2.keras` and `frontend/public/models/asl_model_v2/` no longer exist in the repository. V1 remains the sole production model and has not been modified since its verified evaluation.

**Verified test accuracy (from `detailed_evaluation.py` on held-out test set):**

| Metric | Value |
|---|---|
| Overall Test Accuracy | **93.57%** |

> **Important:** The 93.57% figure is from evaluation on the held-out test set — data the model never saw during training. It is not the training or validation accuracy, and it reflects the model currently deployed in production (V1), unchanged.

### Known Model Limitations

The model recognizes **static** hand shapes only. Classes with inherent visual ambiguity in static images are harder:

- **J and Z** — dynamic signs defined by a motion trajectory. No static snapshot can encode the motion component; the model predicts whatever static shape is visible in the current frame.
- **M, N, S, T** — all involve fingers folded over a partially visible thumb. Small changes in hand angle cause significant overlap between these classes.
- **U vs. V** — both are two fingers extended; the only difference is whether the fingers are touching (U) or spread (V). Landmark-based hint logic (`landmarkHeuristics.ts`) explicitly addresses this pair.
- **Environmental variance:** Training data consists of studio-style photographs. Live testing across different users and normal (non-studio) backgrounds has surfaced real generalization gaps — see Section 6, Challenge 3, for a documented investigation of this specific issue. The adaptive gamma correction in `CameraView.tsx` is a heuristic partial mitigation for lighting only, not background or cross-user variation.

---

## 4. Frontend

### Component Structure

```
App.tsx
├── AuthView              — login gate
├── TabBar                — Live Practice, Flashcards, Duolingo Mode,
│                           Spelling Bee, Roleplay, Leaderboard, Badges
│
├── [Practice Tab]
│   ├── CameraView        — MediaPipe + Landmark MLP inference (primary) + CNN (fallback)
│   ├── ModeSwitcher      — Letters / Numbers / Phrases selector
│   ├── OutputPanel       — current letter, confidence bar, text buffer
│   └── ControlsBar       — Space, Backspace, Speak, Clear
│
├── FlashcardsView        — static ASL reference flashcards (A–Z, 0–9)
├── QuizView              — Duolingo-style guided recognition quiz
├── SpellingView          — spell-a-word game using live sign recognition
├── RoleplayView          — scenario-based roleplay UI (scaffold)
├── LeaderboardView       — Firebase-backed leaderboard (live)
└── AchievementsView      — badges UI (20 unique badges, tracked via local progress)
```

**State management:** Redux Toolkit, `predictionSlice` managing:
- `current: { letter, confidence, timestamp }` — latest model output
- `text: string` — accumulated character string
- `signMode: 'letters' | 'numbers' | 'phrases'` — active recognition mode
- `targetLetter: string | null` — quiz/spelling target
- `currentHint: string | null` — landmark-based posture feedback hint

### Real-Time Inference Pipeline Performance

The pipeline runs at the video frame rate (up to 60 fps requested). An `isProcessing` boolean guard prevents queuing multiple simultaneous inference calls — each frame is processed sequentially, discarding frames that arrive while a previous inference is still running. TF.js uses the WebGL backend, offloading matrix operations to the GPU.

Low-light adaptive correction runs before every MediaPipe call: average frame luminance is sampled (every 16th pixel for efficiency), and if below threshold, a precomputed gamma look-up table brightens the frame.

### Feature Status — Honest Per-Feature Assessment

| Feature | Status | Notes |
|---|---|---|
| Live camera capture | ✅ Working | 640×480, up to 60 fps |
| Hand detection (MediaPipe) | ✅ Working | 21 landmarks, 1 hand |
| Letters mode (A–Z) | ✅ Working | 93.57% on test set; J/Z limited by static-only model |
| Numbers mode (0–9) | ✅ Working | Same model, argmax restricted to indices 0–9 |
| Confidence display | ✅ Working | Real-time bar + percentage |
| Hold-for-1s stability logic | ✅ Working | Prevents spurious character appends |
| Text buffer accumulation | ✅ Working | Characters append on stable confident prediction |
| Space / Backspace / Clear | ✅ Working | Manual text editing controls |
| Text-to-Speech (Speak button) | ✅ Working | `window.speechSynthesis` — browser native, no backend needed |
| Adaptive low-light correction | ✅ Working | Gamma LUT applied per frame |
| Landmark-based hand hints | ✅ Working | `landmarkHeuristics.ts` — textual posture guidance per target letter |
| ASL Flashcards tab | ✅ Working | Static reference cards, no inference |
| Duolingo Quiz mode | ✅ Working | Live inference; XP, levels, streaks, SRS |
| Spelling Bee mode | ✅ Working | Live inference; target-word recognition |
| Roleplay mode | ⚠️ UI scaffold | View renders but no scenario logic implemented |
| **Phrases mode (ModeSwitcher)** | ⚠️ Mislabeled | UI button exists and inference runs, but there is **no dedicated phrase/word-level model**. Functionally identical to Letters mode. |
| Badges / Achievements | ✅ Working | 20 unique badges, tracked via local progress; recently overhauled |
| Leaderboard | ✅ Working | Firebase Firestore-backed; reads top-ranked users live |
| User authentication | ⚠️ Partial | Login gate present; full production-grade session/identity verification not yet independently confirmed end-to-end |
| Translation (multilingual) | ❌ Not implemented | Backend route returns placeholder text unchanged |
| Backend TTS | ❌ Not implemented | Backend endpoint explicitly returns HTTP 501 |
| AI Chat (Gemini) | ✅ Working | `chatService.ts` → `/api/chat` → Gemini API; conversation-aware with system prompt |
| Spell Assist autocomplete | ✅ Working | Trie-based offline word autocomplete via `spellAssistService.ts` |
| Numbers Game mode | ✅ Working | Digit recognition challenge with scoring |
| Onboarding Tour | ✅ Working | react-joyride guided tour on first authenticated visit |

---

## 5. Backend & Data Persistence

### What Exists

A Node.js + Express server (`backend/src/server.js`) with middleware (CORS, JSON body parsing, rate limiting, error handling) and route groups:

| Route | Auth | Current Status |
|---|---|---|
| `GET /health` | No | ✅ Returns `{ status: "ok" }` |
| `POST /api/chat` | No | ✅ **Fully functional** — Gemini AI chat via `geminiService.js` |
| `POST /api/translate` | No | ❌ Validates input, then echoes the text unchanged |
| `POST /api/speak` | No | ❌ Returns HTTP 501 — cloud TTS not wired |
| `POST /api/conversations` | JWT | ❌ Returns HTTP 501 — Firestore save not wired |
| `GET /api/conversations` | JWT | ❌ Returns HTTP 501 — Firestore retrieval not wired |
| `GET /api/signs` | No | ✅ Returns an in-memory A–Z list |

### Firebase — Client-Side (Working)

Firebase Auth and Firestore are integrated and functioning on the client side:
- User progress (XP, levels, streaks, badge state) syncs with Firestore
- The leaderboard reads and displays the top-ranked users live from Firestore
- This is distinct from the backend Express server's JWT-based auth scheme, which remains a separate, not-yet-integrated system for future backend-side conversation persistence

### What is NOT Connected

- Most backend Express API endpoints are not functional (see table above). The only exception is `/api/chat`, which is fully integrated via the Gemini API and called by the frontend's `chatService.ts`.
- The frontend's working features (inference, TTS, progress, leaderboard) run entirely client-side or through Firebase directly, without depending on the backend.
- The backend's own JWT-based authentication (for the `/api/conversations` routes) is separate from the frontend's Firebase Auth flow and has not been integrated with it.

> **Note:** The backend server must be started separately from the frontend dev server. The frontend functions correctly without the backend running for all features except AI chat (`/api/chat`).

---

## 6. Engineering Challenges & Debugging Process

### Challenge 1: Training-vs-Inference Preprocessing Mismatch (Aspect Ratio Bug)

**Symptom:** Certain letters that should be visually distinct were being misclassified in live testing despite reasonable test-set accuracy numbers.

**Root Cause:** The initial `CameraView.tsx` passed the raw MediaPipe bounding-box region to `drawImage()` at 64×64 without enforcing a square crop. A hand raised vertically produces a bounding box taller than it is wide; squashing this into a 64×64 square compresses one axis relative to the other, distorting hand geometry compared to the square training images.

**Resolution:** The crop logic now computes `squareSide = max(bboxWidth, bboxHeight)`, applies 15% padding, then clamps to image boundaries — `drawImage()` always receives a square source region, preserving aspect ratio and matching training-time geometry.

**Technical significance:** This is a practical demonstration of why an inference preprocessing pipeline must be exactly identical to the training preprocessing pipeline — Conv2D filters learn spatial relationships that distortion silently breaks.

---

### Challenge 2: Experimental Model Iteration (V2) — Evaluated and Removed

During development, a second model iteration (V2) was built with the goal of improving accuracy on visually similar classes (M/N/S/T, and digit confusions) using a larger, differently sourced dataset with class weighting. Three distinct problems were identified and diagnosed during this process:

**2a. Data Leakage from Sequential Video Frames**
The V2 dataset was assembled from sequential video frame captures. A naïve random train/test split placed near-identical consecutive frames into both partitions, inflating test accuracy to misleadingly high values (initially measured near 99.9%). This was caught before the model was trusted, and a temporal block split (first 80% of frames per class → train, last 20% → test) was implemented to produce an honest evaluation. This leakage issue does not affect the V1 model, which is trained on independent static photographs, not video sequences.

**2b. Keras Augmentation Layers Incompatible with TensorFlow.js WebGL Backend**
`RandomRotation`, `RandomZoom`, and `RandomTranslation` layers were included inside the V2 Keras Sequential model graph. In standard Keras, these layers are automatically skipped at inference time. This behavior does not transfer to TensorFlow.js: when exported and loaded in-browser, the WebGL backend attempted to execute these layers on every forward pass, threw an exception, and the error handler silently returned `{ confidence: 0 }` — appearing to the user as total recognition failure, even though the model file loaded without error. **Lesson:** Keras model behavior is not guaranteed to transfer identically to TF.js; any layer type used in a model intended for browser deployment must be verified against TF.js's supported operations.

**2c. Incomplete Training Runs Due to Hardware Constraints**
CPU-only training on Windows (TensorFlow ≥ 2.11 does not support native NVIDIA GPU use on Windows) meant each epoch took several minutes, and multiple training runs were interrupted before convergence.

**Outcome:** After correcting the evaluation methodology and identifying the TF.js compatibility issue, V2 did not demonstrably outperform V1 on the classes it was designed to improve. **V2 has since been fully removed from the project** — the model file, converted TensorFlow.js artifacts, and all related references have been deleted. V1 (93.57% test accuracy, unmodified) is the sole production model. This is a valid engineering outcome: a documented, honestly-evaluated experiment that did not improve on the baseline, retired in favor of the proven model rather than deployed on the strength of an unverified number.

---

### Challenge 3: Cross-User and Background Generalization Gap (Under Investigation)

**Symptom:** The model performs reliably when tested against a black or plain background, but accuracy degrades noticeably against normal, cluttered real-world backgrounds — and performance is inconsistent across different users' hands, even though MediaPipe hand-landmark tracking itself remains accurate in all cases (dots track correctly regardless of background or user).

**Diagnosis:** Since landmark detection is unaffected, the issue is isolated to the classification step, not hand detection. This points to a domain generalization gap: the training data's visual characteristics (background, lighting, likely a narrow range of hand appearances) do not fully represent real-world deployment conditions, and the CNN partly relies on incidental pixel-level cues beyond hand geometry.

**Proposed mitigation paths (not yet implemented):**
- **Background masking:** Use existing MediaPipe landmarks to compute a convex hull around the hand and mask pixels outside it to black before classification, artificially recreating the plain-background condition under which the model performs best.
- **Landmark-based classification (larger architectural change):** Replace pixel-based CNN classification with a small classifier operating on normalized MediaPipe landmark coordinates (translated to a wrist-relative origin, scaled by hand size) instead of raw image pixels. This would remove background, lighting, and skin-tone variation from the input entirely, rather than asking the model to learn invariance to them. This is considered the more robust long-term solution and is documented as a roadmap item (Section 8).

This challenge is included here as an actively-diagnosed, real limitation — not yet resolved — because it demonstrates real investigative engineering process consistent with how other issues in this project were approached.

---

### Challenge 4: TensorFlow.js Package Import Incompatibilities

The `tensorflowjs` Python package (used to convert `.keras` files to browser-ready `model.json` + weight shards) has transitive optional dependencies (`tensorflow_decision_forests`, `tensorflow_hub`, `jax`) not installed in a standard TensorFlow environment, causing the entire module to fail to import.

**Resolution:** The optional imports were wrapped in `try/except` blocks, and the internal `save_keras_model` function was called directly from Python rather than via the CLI, bypassing the broken import chain.

---

## 7. Feature List

### Recognition Features

| Feature | Status |
|---|---|
| ASL letters A–Z (static signs) | ✅ Working |
| ASL digits 0–9 (static signs) | ✅ Working |
| J and Z (motion-based signs) | ⚠️ Partially — model predicts the static frame; may output a visually similar letter |
| Phrases / word-level recognition | ❌ Not implemented — no phrase model exists |
| Dynamic gesture recognition | ❌ Not implemented — requires temporal sequence modeling |

### Feedback & Accessibility Features

| Feature | Status |
|---|---|
| Real-time confidence score display | ✅ Working |
| Hold-for-1-second stability gate | ✅ Working |
| Text-to-Speech (browser native) | ✅ Working |
| Adaptive low-light gamma correction | ✅ Working |
| Landmark-based posture hints (A–Z) | ✅ Working |
| Text buffer with Space/Backspace/Clear | ✅ Working |

### Learning & Gamification Tools

| Feature | Status |
|---|---|
| ASL Flashcards (A–Z, 0–9) | ✅ Working |
| Quiz (Duolingo-style, live inference) | ✅ Working |
| Spelling Bee (live inference) | ✅ Working |
| Badges / Achievements (20 unique badges) | ✅ Working — recently overhauled |
| Leaderboard (Firestore-backed, live) | ✅ Working |
| Roleplay scenarios | ⚠️ UI scaffold — no scenario logic |

### Language & Persistence Features

| Feature | Status |
|---|---|
| User progress sync (Firebase) | ✅ Working |
| Translation (ASL text → other languages) | ❌ Backend route is a placeholder |
| High-quality TTS (server-side) | ❌ Backend returns HTTP 501 |
| Backend conversation persistence | ❌ Routes exist; not connected |

---

## 8. Current Limitations & Future Work

### Current Limitations (Accurately Stated)

1. **Static signs only.** J and Z are motion signs — without temporal sequence modeling (LSTM over a frame window, or optical flow), they cannot be reliably recognized. The current single-frame CNN architecture cannot encode motion by design.
2. **36-class closed set.** Only the 26 ASL letters and 10 digits are recognized. Common ASL vocabulary items, compound signs, and facial grammar are outside scope.
3. **Cross-user and background generalization gap (actively diagnosed).** Accuracy is strong against plain/black backgrounds but degrades against cluttered real-world backgrounds and across different users' hands, despite hand detection remaining accurate. See Section 6, Challenge 3.
4. **No backend service integration.** Translation, server-side TTS, and backend conversation persistence remain unconnected placeholders. (Client-side Firebase progress/leaderboard sync is a separate system and is working.)
5. **"Phrases" mode is mislabeled.** The Phrases button runs the same letter-level model as Letters mode; it does not perform phrase or word recognition.

### Realistic Roadmap

- **Background masking or landmark-based classification** to close the generalization gap identified in Challenge 3 — landmark-based classification is the more architecturally robust path, since it removes background/lighting/skin-tone variation from the model's input entirely rather than requiring the model to learn invariance to it.
- **Dynamic gesture recognition for J and Z:** capture a temporal window of frames, extract per-frame landmark sequences, and train a recurrent model (LSTM/Transformer) on motion trajectories.
- **Backend integration:** wire the Express API to real services — Google Cloud Translation, server-side TTS, and backend conversation persistence.
- **Word-level model:** a genuine phrase/sentence recognition system, to make "Phrases" mode functional as labeled.
- **Model optimization:** TF.js quantization to reduce model size and improve inference speed on lower-powered devices.

---

## 9. Benefits & Real-World Impact

Based on the application's **actual, current capabilities only:**

### Who it helps today

- **Communication aid:** A hearing person interacting with a deaf individual can use Aashna as a basic fingerspelling interpreter — the hearing person watches the screen while the deaf person signs, the app accumulates letters into readable text, and that text can be spoken aloud. This covers names, specific terms, and short fingerspelled words.
- **ASL learners:** Flashcards, Quiz, Spelling Bee, and the badge/leaderboard gamification layer give learners a low-cost, always-available, motivating self-assessment tool that does not require a human instructor present for each practice repetition.

### What it does not yet do

- It cannot serve as a full real-time interpreter for ASL conversation — ASL uses grammatical structure, motion signs, spatial grammar, and facial expressions, none of which the current system models.
- It does not scale to other sign languages.
- Recognized accuracy across different users and real-world environments has known, documented limitations (Section 6, Challenge 3) not yet resolved.

### Honest Summary

Aashna is a functioning proof-of-concept demonstrating that browser-based, real-time, on-device static ASL sign recognition — combined with a genuinely engaging gamified learning experience — is achievable without heavy server infrastructure. At 93.57% test accuracy over 36 classes, a complete letter-level inference pipeline, and a working Firebase-backed gamification system, it is a credible academic prototype. It is not a production-ready accessibility tool — that would require dynamic gesture support, resolution of the cross-user/background generalization gap, full backend integration, and formal evaluation across diverse user populations.

---

*Report consolidated from three prior technical reports and verified project updates as of August 28, 2026. Model accuracy (93.57%) confirmed unchanged and current by direct verification. V2 model confirmed fully removed from the repository. Firebase integration (progress sync, badges, leaderboard) confirmed working in production.*
