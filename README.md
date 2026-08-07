# 🤟 Sign Language Bridge

Real-time ASL → Text/Speech/Urdu communication app. See `/docs` for the full PRD and Architecture docs.

## Project Layout

```
sign-language-bridge/
├── ml/          → Python model training pipeline (dataset, preprocessing, training, TF.js export)
├── frontend/    → React + TypeScript + Vite web app (camera, prediction UI, translation, TTS)
├── backend/     → Node + Express API (translate, speak, conversations, users, signs)
└── docs/        → PRD.md and Architecture.md
```

## Recommended Build Order (matches PRD phases)

1. **ml/** — Get the dataset in, preprocess, train the CNN, export to TensorFlow.js. This unblocks everything else, since the frontend needs a real model to test against.
2. **frontend/** — Camera capture + MediaPipe hand detection + load the TF.js model + show live predictions.
3. **backend/** — Translation, TTS, and persistence endpoints once the core recognition loop works.
4. Wire frontend ↔ backend, add auth, history, polish.

## Getting Started

### 1. ML pipeline
```bash
cd ml
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Put your Kaggle ASL Alphabet dataset into ml/data/raw/ (see ml/README.md)
python scripts/preprocess.py
python scripts/train.py
python scripts/convert_to_tfjs.py
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your keys
npm run dev
```

## Tech Stack (from Architecture doc)

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind, Redux Toolkit |
| ML (browser) | TensorFlow.js, MediaPipe |
| ML (training) | Python, TensorFlow/Keras |
| Backend | Node.js, Express |
| Database | Firebase Firestore |
| Auth | Firebase Auth |
| Translation/TTS | Google Cloud Translation & TTS |
| Hosting | Firebase Hosting (frontend), Cloud Run (backend) |
