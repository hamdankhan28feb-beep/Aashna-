# Aashna Current Project Report

**Project:** Aashna (Sign Language Bridge)  
**Report date:** August 27, 2026  
**Repository status:** MVP under active development  

## 1. Executive Summary

Aashna is a browser-based sign-language learning and communication application. Its main implemented path captures webcam video, detects a hand with MediaPipe Hands, crops the detected hand, and classifies the resulting 64 x 64 RGB image with a TensorFlow.js model running in the browser.

The current model is a single 36-class static-sign classifier: digits `0-9` and letters `a-z`. The frontend supports practice, flashcards, quiz, spelling, roleplay, achievements, authentication UI, and leaderboard UI. Local progress works without a backend, while Firebase-backed progress and leaderboard behavior depends on valid Firebase configuration and security rules.

The project should currently be described as a functional MVP shell with a working end-to-end static-sign recognition path, not as a production-ready translator. The checked-in model verification result is **57.46% test accuracy**, below the product target of 95%, and several backend services are still placeholders.

## 2. Product Purpose and Scope

### Mission

Help deaf, hard-of-hearing, and sign-language-learning users practice static ASL signs and communicate recognized text to hearing users.

### Intended users

- Deaf and hard-of-hearing people
- Hearing people learning ASL
- Teachers and organizations supporting sign-language education

### Current scope

- Static ASL-style letters and digits from webcam input
- Browser-side inference for privacy and low latency
- Guided practice and learning modes
- English text output
- Optional browser text-to-speech where supported
- Local learning progress with optional Firebase synchronization

### Not yet delivered as production functionality

- Reliable 95%+ recognition accuracy
- Dynamic signs such as `J` and `Z`
- Continuous word or sentence recognition
- Real English-to-Urdu translation through the backend
- Backend Google Cloud text-to-speech
- Backend conversation persistence
- A complete production authentication integration between frontend and backend

## 3. Technology Stack

### Frontend

- React `18.3.1`
- TypeScript `5.5.4`
- Vite `5.3.5`
- Tailwind CSS `3.4.19`
- Redux Toolkit `2.2.7` and React Redux `9.1.2`
- TensorFlow.js `4.22.0`
- MediaPipe Hands `0.4.1675469240`
- Firebase Web SDK `12.18.0`

### Backend

- Node.js with Express `4.19.2`
- ECMAScript modules
- CORS
- `express-rate-limit`
- `dotenv`
- `jsonwebtoken`
- `firebase-admin` dependency present, but backend Firestore operations are not implemented yet

### Machine learning

- Python pipeline using TensorFlow/Keras, OpenCV, NumPy, and scikit-learn
- Keras checkpoint: `ml/models/asl_model.keras`
- TensorFlow.js model served from `frontend/public/models/asl_model/`
- Processed data stored as NumPy arrays under `ml/data/processed/`

## 4. Repository Structure

```text
Aashna/
├── backend/                  # Express API
├── docs/                     # requirements and project reports
├── frontend/                 # React/Vite application and browser model
└── ml/                       # dataset, training, conversion, evaluation
```

Important frontend directories are `src/components`, `src/services`, `src/store`, `src/types`, and `src/utils`. Important backend directories are `src/routes`, `src/controllers`, and `src/middleware`.

## 5. Machine-Learning Model

### 5.1 Model contract

The frontend loads `/models/asl_model/model.json`. The model expects `(batch, 64, 64, 3)` RGB input and returns a 36-value softmax vector. Indices `0-9` map to digits `0-9`; indices `10-35` map to lowercase letters `a-z`. The label order is defined by `ml/data/processed/label_mapping.json` and duplicated in the frontend model service. Letter predictions are converted to uppercase for the UI.

### 5.2 Architecture and measured results

The `ASL_DeepCNN` model uses training-only rotation, zoom, and translation augmentation; four convolutional blocks with 32, 64, 128, and 256 filters; batch normalization; pooling; dropout; dense layers of 512 and 256 units; and a final `Dense(36, activation="softmax")` layer. It uses Adam at `0.001` and sparse categorical cross-entropy.

| Metric | Recorded value |
|---|---:|
| Input shape | `(null, 64, 64, 3)` |
| Output shape | `(null, 36)` |
| Parameters | `2,229,092` |
| Held-out test samples | `503` |
| Test loss | `1.7740` |
| Test accuracy | **57.46%** |

The PRD's 95% accuracy figure is a target, not the current measured result. The model must be retrained and re-evaluated before claiming that target is met.

### 5.3 ML pipeline

```text
Raw class folders -> OpenCV load -> resize to 64 x 64 -> BGR to RGB
-> normalize 0-255 to 0-1 -> stratified 80/20 train/test split
-> 15% validation split -> Keras training -> .keras checkpoint
-> TensorFlow.js conversion -> model.json and weight shards in frontend/public/models/asl_model/
```

Training allows up to 60 epochs with batch size 64, best-validation-accuracy checkpointing, early stopping after 10 stagnant epochs, and learning-rate reduction on validation loss.

## 6. End-to-End Recognition Flow

```text
User authenticates -> selects a learning mode -> grants webcam permission
-> browser captures a 640 x 480 user-facing stream
-> MediaPipe Hands detects up to one hand
-> landmarks are drawn on the mirrored preview
-> bounds are padded by 15% and made square
-> crop is rendered to a hidden 64 x 64 canvas
-> TensorFlow.js converts pixels to float and divides by 255
-> model produces 36 probabilities
-> frontend filters argmax to the selected letter/digit range
-> confidence >= 0.70 creates a candidate
-> candidate stable for 1,000 ms is appended once
-> Redux updates prediction, text, and challenge state
```

The camera loop uses `requestAnimationFrame` and prevents overlapping MediaPipe requests. Low-light frames receive gamma correction. When no hand is detected, candidate and deduplication state reset. A held sign is not repeatedly appended; the user must change or lift the sign before entering it again.

## 7. Frontend Features

`App.tsx` mounts the Redux provider and main layout. After the authentication gate, the tab bar exposes:

- **Practice:** camera, mode switcher, output panel, and controls
- **Flashcards:** sign-learning cards using bundled assets
- **Quiz:** target letters, confidence checks, hints, XP, levels, streaks, SRS, and Boss Fight
- **Spelling:** word targets assembled from recognized letters
- **Roleplay:** scripted word-by-word interaction with XP rewards
- **Leaderboard:** Firebase-backed ranking UI
- **Achievements:** badges and progress display

Challenge modes use uppercase targets. Mode changes and new challenges clear candidate and text state so stale letters are not evaluated against new targets.

## 8. Progress, Authentication, and Storage

Progress is stored in browser local storage under `aashna_progress`. It includes XP, level, daily streak, last active date, and per-letter attempts, successes, and SRS weight. Levels increase every 100 XP. Letters taking over three seconds receive higher practice weight; faster successes lower the weight to a minimum of 0.1.

The frontend initializes Firebase Auth and Firestore. If a Firebase user exists, progress is downloaded from Firestore and local saves are synchronized in the background. Leaderboard behavior requires network access, a signed-in user, and appropriate Firestore rules. The current UI gate uses a local `isAuthenticated` flag, so complete Firebase sign-in integration still needs to be verified.

The backend separately expects JWT authentication for conversation routes through `Authorization: Bearer <token>` and `JWT_SECRET`. This is not yet demonstrated as integrated with the frontend Firebase identity flow.

## 9. Backend API

The Express server defaults to port `3000`, permits `http://localhost:5173` unless `FRONTEND_ORIGIN` is set, parses JSON, applies rate limiting, and exposes `/health`.

| Method | Endpoint | Auth | Current behavior |
|---|---|---|---|
| GET | `/health` | No | Returns `{ "status": "ok" }` |
| POST | `/api/translate` | No | Validates input, then currently echoes the text |
| POST | `/api/speak` | No | Returns HTTP 501; cloud TTS is not wired |
| POST | `/api/conversations` | JWT | Returns HTTP 501; Firestore save is not wired |
| GET | `/api/conversations` | JWT | Returns HTTP 501; Firestore retrieval is not wired |
| GET | `/api/signs` | No | Returns an in-memory A-Z list |

The backend is routing and middleware scaffolding plus a health endpoint; translation, cloud speech, and conversation storage are incomplete.

## 10. Setup and Run Instructions

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Build and preview with `npm run build` and `npm run preview`.

### Backend

```powershell
cd backend
npm install
npm run dev
```

Set `PORT`, `FRONTEND_ORIGIN`, and `JWT_SECRET` through the backend environment when needed.

### ML environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r ml/requirements.txt
python ml/scripts/preprocess.py
python ml/scripts/train.py
python ml/scripts/convert_to_tfjs.py
```

The raw dataset must be arranged as class folders under `ml/data/raw/` and preserve the `0-9` and `a-z` labels expected by the current model contract.

## 11. Validation and Quality Status

The frontend production build has been verified with `cd frontend; npm run build`. This runs TypeScript compilation and Vite bundling. Vite reports a non-blocking large JavaScript chunk warning caused mainly by TensorFlow.js.

The backend has an `npm test` script using Node's test runner, but broader endpoint and integration coverage is still needed. Browser tests are needed for camera permissions, MediaPipe results, preprocessing, confidence filtering, challenge transitions, and mobile behavior.

## 12. Known Issues and Risks

1. Current recorded model accuracy is 57.46%, below the 95% target.
2. Current code uses a 36-class contract; older planning documents describe a 26-letter model and older filenames.
3. Dynamic signs and temporal sequences are outside the single-frame classifier.
4. MediaPipe assets load from jsDelivr, requiring network access unless self-hosted.
5. Translation currently echoes input.
6. Backend speech synthesis and conversation persistence return not-implemented responses.
7. Firebase Auth and Firestore require real project configuration and published rules.
8. Frontend Firebase authentication and backend JWT authentication are separate and not yet integrated.
9. Temporary throttled diagnostic logging remains in the model service.
10. Privacy, accessibility, browser compatibility, and performance targets require dedicated validation.

## 13. Recommended Next Steps

1. Investigate the 57.46% result with per-class accuracy, a confusion matrix, browser samples, and leakage checks.
2. Retrain and convert the best checkpoint, then rerun verification before updating accuracy claims.
3. Add focused browser tests for the camera pipeline and learning modes.
4. Complete Firebase Auth state handling and choose Firebase ID tokens or a separate JWT issuer for API requests.
5. Implement and test Google Translate, Google Cloud TTS, and Firestore handlers with environment-based secrets.
6. Replace polling-style progress refresh with a reactive shared progress store where practical.
7. Add temporal modeling for dynamic signs and sequence-to-text recognition.
8. Document deployment, Firebase rules, data provenance/licensing, privacy behavior, and accessibility acceptance criteria.

## 14. Source Files for Verification

- Frontend composition: `frontend/src/App.tsx`
- Camera and preprocessing: `frontend/src/components/Camera/CameraView.tsx`
- Model loading and prediction: `frontend/src/services/modelService.ts`
- Progress persistence: `frontend/src/services/progressService.ts`
- Firebase client: `frontend/src/lib/firebase.ts`
- Backend server: `backend/src/server.js`
- API routes/controllers: `backend/src/routes/` and `backend/src/controllers/`
- Preprocessing: `ml/scripts/preprocess.py`
- Training architecture: `ml/scripts/train.py`
- Label contract: `ml/data/processed/label_mapping.json`
- Evaluation artifact: `ml/models/verification_results.json`
