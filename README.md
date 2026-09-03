<p align="center">
  <img src="frontend/public/logo.png" alt="Aashna Logo" width="120" />
</p>

<h1 align="center">Aashna</h1>

<p align="center">
  <strong>Bridging Communication. Connecting Communities.</strong><br />
  A real-time American Sign Language recognition app powered by deep learning.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#-developed-by">Developed By</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#running-the-project">Run</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Alibaba%20Cloud%20AI%20Hackathon-Pakistan%202026-blue?style=flat-square" alt="Alibaba Cloud AI Hackathon Pakistan 2026" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
</p>

---

Aashna is a full-stack ASL learning platform that uses your webcam to recognise hand signs in real time. It runs two interchangeable deep-learning models entirely in the browser — a pixel-based CNN and a MediaPipe landmark-based MLP — and wraps recognition in gamified practice modes, a Gemini-powered roleplay chatbot, Firebase authentication, and a live leaderboard.

Developed for the **Alibaba Cloud AI Hackathon Pakistan 2026**.

---

## Table of Contents

- [Features](#features)
- [Developed By](#-developed-by)
- [Attribution](#-attribution)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Firebase Setup](#firebase-setup)
- [Running the Project](#running-the-project)
- [Model Files](#model-files)
- [Project Structure](#project-structure)
- [Security & Public Repository](#-security--public-repository)
- [Third-Party Assets & Datasets](#-third-party-assets--datasets)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- **Live Practice** — Real-time ASL fingerspelling recognition via webcam, with Letters (A–Z) and Numbers (0–9) modes.
- **Flashcards** — Browse and study ASL hand signs with reference images for every letter and number.
- **Duolingo Mode** — Gamified quiz-style practice with hints and progressive difficulty.
- **Numbers Game** — Dedicated practice mode for recognising ASL number signs (0–9).
- **Spelling Bee** — Spell words by signing each letter, with Spell Assist suggestions.
- **Roleplay** — Conversational chatbot powered by Google Gemini, designed for practising everyday ASL communication scenarios.
- **Tutorials** — Structured lesson catalog with levels and video references.
- **Leaderboard** — Competitive rankings stored in Firestore.
- **Badges** — Achievement system with unlockable badges for milestones.
- **Onboarding Tour** — Guided walkthrough that auto-starts on a user's first visit.
- **Text-to-Speech** — Built-in "Speak" button reads recognised text aloud using the browser's Web Speech API.

> **Note:** A **Phrases** signing mode exists in the codebase but is currently hidden behind a feature flag (`SHOW_PHRASES_MODE = false`). It will be enabled once a dedicated phrase-recognition model is available.

---

## 👥 Developed By

Aashna was designed and developed by:

- **[Muhammad Hamdan](https://github.com/hamdankhan28feb-beep)**
- **[Ayesha Nehal](https://github.com/AyeshaNehal)**

Developed as part of the **Alibaba Cloud AI Hackathon Pakistan 2026**.

---

## 📜 Attribution

Aashna is an original project created by **Muhammad Hamdan** and **Ayesha Nehal**.

- **Repository:** [github.com/hamdankhan28feb-beep/Aashna](https://github.com/hamdankhan28feb-beep/Aashna)

You are free to use, copy, modify, merge, publish, distribute, and build upon this project under the terms of the [MIT License](LICENSE). We only ask that you:

1. **Retain the original copyright notice** and license file in any copy or substantial portion of the software.
2. **Credit the original authors** when redistributing or showcasing derivative work.
3. **Link back to the original repository** where practical.

GitHub's commit history and contributor records document the development timeline and individual contributions to this project.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Redux Toolkit, Tailwind CSS, TensorFlow.js, MediaPipe Hands, Firebase (Auth + Firestore client SDK) |
| **Backend** | Node.js, Express 4 (ESM), CORS, express-rate-limit, Firebase Admin SDK, JSON Web Tokens |
| **ML Pipeline** | Python, TensorFlow / Keras, OpenCV, scikit-learn, MediaPipe, TensorFlow.js converter |
| **AI Chat** | Google Gemini API (`gemini-flash-latest`) via backend `/api/chat` endpoint |
| **Hosting** | Firebase Hosting (frontend), Google Cloud Run (backend — planned) |

---

## Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **npm** ≥ 9
- **Python** ≥ 3.10 (only required if you plan to run the ML training scripts)
- A **Firebase** project (free Spark plan is sufficient)
- A **Google Cloud API key** with the Gemini API enabled (required for the Roleplay chatbot)

---

## Installation

This is a monorepo-style layout with two independent services. Install dependencies for **each** separately:

```bash
# 1. Clone the repository
git clone https://github.com/hamdankhan28feb-beep/Aashna.git
cd Aashna

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Install backend dependencies
cd ../backend
npm install

# 4. (Optional) Install ML dependencies
cd ../ml
pip install -r requirements.txt
```

---

## Environment Variables

The project requires **two separate `.env` files** — one for each service. Copy the provided `.env.example` files and fill in your own values.

> ⚠️ **IMPORTANT — NEVER commit real credentials.** Actual `.env` files are listed in `.gitignore` and must **never** be pushed to the repository. All values shown below are **placeholders only** — replace them with your own keys when running locally.

### Frontend — `frontend/.env`

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"
```

> All frontend environment variables **must** be prefixed with `VITE_` — Vite only exposes `VITE_*` variables to the browser bundle.

### Backend — `backend/.env`

```env
PORT=3000
NODE_ENV=development

# Google Cloud — required for the Roleplay chatbot
GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key

# Gemini model used by /api/chat (defaults to gemini-flash-latest)
GEMINI_MODEL=gemini-flash-latest

# Firebase Admin SDK credentials
FIREBASE_DATABASE_URL=
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# JWT signing secret (change this to a random string)
JWT_SECRET=change-me

# CORS — must match your frontend dev server URL
FRONTEND_ORIGIN=http://localhost:5173
```

> The `GOOGLE_CLOUD_API_KEY` is used **server-side only** — it is never sent to or embedded in any frontend file. The frontend communicates with Gemini exclusively through the backend's `/api/chat` endpoint.

---

## Firebase Setup

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com).

2. **Enable Authentication** — go to **Authentication → Sign-in method** and enable the sign-in provider you want to use (e.g., Google, Email/Password).

3. **Enable Firestore** — go to **Firestore Database** and create the database. Start in production mode.

4. **Copy your web app config** — go to **Project Settings → General → Your apps → Web app** and copy the configuration values into `frontend/.env` (see the mapping in the [Environment Variables](#environment-variables) section above).

5. **Set Firestore security rules** — replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // All reads and writes require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

6. **Restrict your API key** (recommended) — in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), edit the Firebase web API key and add HTTP referrer restrictions to prevent misuse:

```
http://localhost:5173/*
https://your-deployed-domain.com/*
```

---

## Running the Project

The frontend and backend run as **two separate processes**.

### Frontend

```bash
cd frontend

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

### Backend

```bash
cd backend

# Development server with --watch auto-reload (http://localhost:3000)
npm run dev

# Production start
npm start

# Run tests
npm run test
```

> During development, the Vite dev server automatically proxies `/api/*` requests to `http://localhost:3000`, so make sure **both** servers are running. The proxy is configured in `frontend/vite.config.ts`.

---

## Model Files

Both trained models are included in the repository under `frontend/public/models/` — **no external download is required**. The app loads them directly in the browser via TensorFlow.js.

| Model | Directory | Type | Test Accuracy | Input |
|---|---|---|---|---|
| **CNN** | `asl_model/` | Pixel-based deep CNN | ~93.57% | Cropped 64×64 hand image |
| **Landmark MLP** | `landmark_model/` | Coordinate-based MLP | ~96.14% | Normalised MediaPipe hand landmarks |
| **YOLOv8 Hand Detector** | `yolo_hand/` | Object detection | — | Webcam frame |

### Why two recognition models?

The **CNN** was the original model — it classifies cropped pixel regions and works well under controlled lighting. The **Landmark MLP** was developed later as a more robust alternative: it takes normalised (x, y) coordinates from MediaPipe's hand skeleton instead of raw pixels, making it significantly more resistant to background clutter, skin tone variation, and lighting changes.

The app currently uses the **Landmark model by default**. A `ModelToggle` component exists in the codebase for switching between models but is not yet wired into the UI.

### Source Keras files

The original Keras model weights used to produce the TF.js bundles are stored in `ml/models/`:

- `asl_model.keras` — CNN source (~33 MB)
- `landmark_model.keras` — MLP source (~115 KB)

These are only needed if you want to retrain or convert the models yourself (see the ML scripts in `ml/scripts/`).

---

## Project Structure

```
Aashna/
├── frontend/                    # React + Vite + TypeScript frontend
│   ├── public/
│   │   ├── models/              # TF.js model bundles (asl_model, landmark_model, yolo_hand)
│   │   ├── asl/                 # ASL dataset reference images (a–z, 0–9)
│   │   ├── videos/              # Tutorial video assets
│   │   ├── logo.png
│   │   └── bg-pattern.jpg
│   ├── src/
│   │   ├── components/          # Feature components (18 directories)
│   │   │   ├── Auth/            # Firebase login/signup
│   │   │   ├── Camera/          # Webcam + MediaPipe + inference loop
│   │   │   ├── Controls/        # ModeSwitcher, ModelToggle, ControlsBar
│   │   │   ├── Navigation/      # TabBar (9-tab navigation)
│   │   │   ├── Layout/          # MainLayout, Header, Footer
│   │   │   ├── Output/          # Recognition output display
│   │   │   ├── Flashcards/      # Flashcard study mode
│   │   │   ├── Quiz/            # Duolingo-style quiz
│   │   │   ├── NumbersGame/     # Numbers recognition game
│   │   │   ├── Spelling/        # Spelling Bee mode
│   │   │   ├── Roleplay/        # Gemini-powered chatbot
│   │   │   ├── Tutorials/       # Lesson catalog & viewer
│   │   │   ├── Leaderboard/     # Firestore-backed rankings
│   │   │   ├── Achievements/    # Badges & achievements
│   │   │   ├── Tour/            # Onboarding guided tour
│   │   │   └── ...
│   │   ├── services/            # Model loaders (modelService, landmarkModelService, yoloService)
│   │   ├── store/               # Redux Toolkit (predictionSlice)
│   │   ├── lib/                 # Firebase initialisation
│   │   ├── data/                # Static data (tutorials catalog, achievements)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript type definitions
│   │   ├── utils/               # Utility functions
│   │   ├── styles/              # Global Tailwind styles
│   │   ├── App.tsx              # Root component (tab routing + auth gate)
│   │   └── main.tsx             # Entry point
│   ├── .env.example
│   ├── vite.config.ts           # Dev server (port 5173, /api proxy → localhost:3000)
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                     # Express.js REST API
│   ├── src/
│   │   ├── controllers/         # Route handlers (chat, translate, speak, signs, conversations)
│   │   ├── routes/              # Express routers
│   │   ├── middleware/          # Auth guard, error handler, rate limiter
│   │   ├── services/            # geminiService.js (Gemini API client)
│   │   └── server.js            # App entry point
│   ├── .env.example
│   └── package.json
│
├── ml/                          # Python ML pipeline
│   ├── scripts/                 # Training, preprocessing, conversion scripts
│   │   ├── train.py             # Train CNN model
│   │   ├── train_landmark_model.py  # Train landmark MLP
│   │   ├── preprocess.py        # Dataset preprocessing
│   │   ├── extract_landmarks.py # MediaPipe landmark extraction
│   │   ├── convert_to_tfjs.py   # Keras → TF.js conversion
│   │   └── ...
│   ├── data/                    # Raw images, processed landmarks, datasets
│   ├── models/                  # Trained .keras files + verification results
│   ├── requirements.txt
│   └── README.md
│
├── docs/                        # Project documentation
│   ├── Architecture.md
│   ├── Design.md
│   ├── PRD.md
│   ├── Phases.md
│   ├── Rules.md
│   └── ...
│
└── .gitignore
```

---

## 🔒 Security & Public Repository

This repository is **public**. The following practices are enforced and should be maintained by all contributors:

- **`.env` files are gitignored** — never commit them. Use the `.env.example` templates as a starting point.
- **API keys must never be committed** — including `GOOGLE_CLOUD_API_KEY`, Firebase web keys (`VITE_FIREBASE_*`), and any third-party service keys.
- **Firebase Admin private keys must never be committed** — the `FIREBASE_PRIVATE_KEY` value in `backend/.env` grants full administrative access to your Firebase project.
- **JWT secrets must never be committed** — `JWT_SECRET` in `backend/.env` is used for token signing and must be a unique, random string kept private.
- **Rotate credentials if accidentally exposed** — if any secret is committed to Git history, rotate it immediately and consider rewriting history with [git filter-repo](https://github.com/newren/git-filter-repo) or [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/).

> 💡 Even though Firebase **web** API keys are technically public by design, they can still be abused against your project quota. Always apply **HTTP referrer restrictions** and **Firestore Security Rules** (see [Firebase Setup](#firebase-setup)).

---

## 📦 Third-Party Assets & Datasets

- **ASL Alphabet Dataset** — The images under `ml/data/raw/` and `frontend/public/asl/` are derived from the [Kaggle ASL Alphabet Dataset](https://www.kaggle.com/datasets/grassknoted/asl-alphabet). This dataset may be subject to its own license and usage restrictions. Please review the [original dataset's terms on Kaggle](https://www.kaggle.com/datasets/grassknoted/asl-alphabet) before redistributing it.
- **MediaPipe** — Hand landmark detection is provided by [Google MediaPipe](https://developers.google.com/mediapipe) under the Apache 2.0 License.
- **TensorFlow.js** — Browser-side inference uses [TensorFlow.js](https://www.tensorflow.org/js), licensed under the Apache 2.0 License.
- **Google Gemini API** — The Roleplay chatbot uses Google's Generative Language API, subject to [Google's Terms of Service](https://ai.google.dev/terms).

---

## Troubleshooting

### Firebase env vars not loading

Vite only exposes environment variables prefixed with `VITE_` to the browser. If Firebase initialisation fails silently, verify that:
- Your file is named `.env` (not `.env.local` or `.env.production`) and is located in `frontend/`.
- Every variable starts with `VITE_FIREBASE_` (not just `FIREBASE_`).
- You restarted the dev server after editing `.env` — Vite reads env files only at startup.

### Model loading errors in browser console

- Check that the `frontend/public/models/` directory is intact (it should contain `asl_model/`, `landmark_model/`, and `yolo_hand/` subdirectories, each with a `model.json` and weight files).
- Large model weight files may fail to load on slow connections — check the Network tab for failed requests to `.bin` files.
- Ensure you are not running the app from `file://` — use `npm run dev` or `npm run preview`.

### Backend not running

The Roleplay chatbot and several other features require the backend to be running on `http://localhost:3000`. Symptoms of a missing backend:
- Roleplay messages return errors or never resolve.
- The browser console shows failed `POST /api/chat` requests.
- Start the backend with `cd backend && npm run dev`.

### CORS errors

The backend's CORS is configured to accept requests from `FRONTEND_ORIGIN` (default: `http://localhost:5173`). If you change the frontend port or deploy to a different origin, update `FRONTEND_ORIGIN` in `backend/.env` to match. During local development the Vite proxy (`/api` → `http://localhost:3000`) handles this transparently, so CORS issues typically only appear in production or when hitting the backend directly.

### Gemini chat returns 503

The `/api/chat` endpoint requires `GOOGLE_CLOUD_API_KEY` to be set in `backend/.env`. If missing, the server returns:
```json
{ "error": { "message": "Chat service is not configured (missing API key on the server)" } }
```
Ensure your key has the **Generative Language API** enabled in the Google Cloud Console.

---

## License

This project is licensed under the **MIT License** — you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the conditions in the full license text.

See the [LICENSE](LICENSE) file for the complete license text.

**Copyright (c) 2026 Muhammad Hamdan & Ayesha Nehal**

---

<p align="center">
  Created with 💜 for the Deaf & Hard of Hearing Community
</p>
