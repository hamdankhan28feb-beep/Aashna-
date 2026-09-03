# 🏗️ ARCHITECTURE DOCUMENT
## Sign Language Bridge - Technical System Design

**Document Version:** 1.2
**Last Updated:** September 3, 2026

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                     SIGN LANGUAGE BRIDGE                         │
│              Real-time Sign Language Recognition App             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (Web)                       │
├──────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Tailwind CSS                             │
│  ├─ AuthView              (Firebase login / Google Sign-In)      │
│  ├─ CameraView            (Webcam capture + MediaPipe overlay)   │
│  ├─ OutputPanel           (Recognized text + confidence bar)     │
│  ├─ ControlsBar           (Space / Backspace / Speak / Clear)    │
│  ├─ TabBar                (Practice, Flashcards, Quiz, etc.)     │
│  ├─ FlashcardsView        (Letter & number flashcard decks)      │
│  ├─ QuizView              (Duolingo-style quiz mode)             │
│  ├─ NumbersGameView       (Number recognition challenge)         │
│  ├─ SpellingView          (Spelling bee mode)                    │
│  ├─ RoleplayView          (Scenario-based practice — scaffold)   │
│  ├─ TutorialsView         (Lesson catalog with video assets)     │
│  ├─ LeaderboardView       (Firebase-backed rankings)             │
│  ├─ AchievementsView      (20 unique badges)                     │
│  └─ OnboardingTour        (First-visit guided tour)              │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                  CLIENT-SIDE ML LAYER (Browser)                   │
├──────────────────────────────────────────────────────────────────┤
│  TensorFlow.js + MediaPipe.js                                     │
│  ├─ Hand Detection (MediaPipe)     → 21 landmarks per hand      │
│  ├─ Landmark MLP (primary engine)  → Classifies from 63 floats  │
│  ├─ CNN Model (fallback/available) → Classifies 64×64 images    │
│  ├─ Spell Assist (trie-based)      → Offline word autocomplete  │
│  ├─ Landmark Heuristics            → Finger-position hints      │
│  └─ Web Speech API                 → Text-to-speech             │
│                                                                    │
│  ✨ OFFLINE FIRST: All processing happens locally (private!)     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                     API LAYER (Backend Server)                    │
├──────────────────────────────────────────────────────────────────┤
│  Node.js + Express                                                │
│  ├─ /api/chat               → Gemini AI chat (✅ implemented)   │
│  ├─ /api/translate          → Translation (⚠ stub/placeholder) │
│  ├─ /api/speak              → Server TTS (⚠ 501 Not Impl.)     │
│  ├─ /api/conversations      → Save & retrieve (⚠ 501 stub)     │
│  ├─ /api/signs              → Sign library (hardcoded A-Z)       │
│  └─ /health                 → Readiness probe (✅ implemented)  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    DATA & SERVICE LAYER                           │
├──────────────────────────────────────────────────────────────────┤
│  External Services:                                               │
│  ├─ Google Gemini API         → AI chat (✅ integrated)          │
│  ├─ Google Cloud Translation  → English ↔ Urdu (⚠ not wired)  │
│  ├─ Google Cloud TTS          → Text-to-speech (⚠ not wired)   │
│  ├─ Firebase Firestore        → Progress, badges, leaderboard   │
│  ├─ Firebase Auth             → User authentication (client)     │
│  └─ Firebase Hosting          → Web deployment (planned)         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. COMPONENT ARCHITECTURE

### 2.1 Frontend Components

```
App (wrapped in Redux Provider)
├── AuthView (Firebase email/password + Google Sign-In)
│
├── TabBar (navigation between modes)
│   ├── Practice Tab
│   │   ├── CameraView
│   │   │   ├── Video Stream (getUserMedia)
│   │   │   ├── MediaPipe Hands Overlay (21 landmarks)
│   │   │   ├── Adaptive Gamma Correction (low-light)
│   │   │   └── Square Crop + Resize (64×64)
│   │   ├── OutputPanel
│   │   │   ├── Confidence Bar
│   │   │   ├── Current Letter Display
│   │   │   └── Accumulated Text Buffer
│   │   └── ControlsBar
│   │       ├── Space / Backspace
│   │       ├── Speak (Web Speech API)
│   │       └── Clear
│   │
│   ├── Flashcards Tab (letters A-Z + numbers 0-9 decks)
│   ├── Numbers Game Tab (digit recognition challenge)
│   ├── Quiz Tab (Duolingo-style multiple choice)
│   ├── Spelling Tab (spelling bee with spell assist)
│   ├── Roleplay Tab (scenario view — UI scaffold only)
│   ├── Tutorials Tab (lesson catalog — videos pending)
│   ├── Leaderboard Tab (Firebase-backed rankings)
│   └── Achievements Tab (20 unique badges)
│
├── OnboardingTour (react-joyride, first-visit)
└── Modals / Settings
```

#### Frontend Services
```
frontend/src/services/
├── landmarkModelService.ts   (Primary: MediaPipe landmarks → MLP inference)
├── modelService.ts           (Fallback: image crop → CNN inference)
├── yoloService.ts            (Hand detection — currently unused)
├── progressService.ts        (XP, levels, streaks, letter stats → Firestore)
├── chatService.ts            (Client for /api/chat endpoint)
└── spellAssistService.ts     (Offline trie-based word autocomplete)
```

### 2.2 Backend Components

```
Express Server (backend/src/)
├── server.js                 (Entry point: middleware + route mounting)
│
├── Routes/
│   ├── chat.js               (POST /api/chat)
│   ├── translate.js          (POST /api/translate)
│   ├── speak.js              (POST /api/speak)
│   ├── conversations.js      (POST + GET /api/conversations, auth required)
│   └── signs.js              (GET /api/signs)
│
├── Controllers/
│   ├── chatController.js     (✅ Gemini integration — fully functional)
│   ├── translateController.js (⚠ Stub — returns original text)
│   ├── speakController.js    (⚠ 501 Not Implemented)
│   ├── conversationController.js (⚠ 501 — Firestore planned)
│   └── signController.js     (⚠ Hardcoded A-Z alphabet list)
│
├── Middleware/
│   ├── authentication.js     (JWT Bearer token verification)
│   ├── errorHandler.js       (Centralized JSON error responses)
│   └── rateLimit.js          (1000 req / 60s window)
│
└── Services/
    └── geminiService.js      (Google Gemini REST API integration)
```

---

## 3. DATA FLOW ARCHITECTURE

### 3.1 Real-time Prediction Flow (Current Implementation)

```
User performs sign
        ↓
Webcam captures frame (up to 60 FPS)
        ↓
Adaptive gamma correction for low-light frames
        ↓
MediaPipe Hands detects 21 landmarks (3D keypoints)
        ↓
┌─────────────────────────────────────────────┐
│  PRIMARY PATH: Landmark MLP Model             │
│  • Normalize landmarks (wrist = origin,        │
│    scale by middle-finger MCP distance)        │
│  • Flatten to 63 floats (21 × 3 coords)       │
│  • MLP inference: Input(63) → Dense(64) →     │
│    Dense(32) → Dense(36, softmax)              │
├─────────────────────────────────────────────┤
│  FALLBACK PATH: CNN Model (image-based)       │
│  • Square crop from landmark bounding box      │
│  • Resize to 64×64, normalize [0,1]           │
│  • CNN inference: 4 conv blocks → dense head  │
└─────────────────────────────────────────────┘
        ↓
Output: 36-class softmax (0-9, a-z)
        ↓
Argmax restricted by active mode:
  Letters mode: indices 10–35 (a–z)
  Numbers mode: indices 0–9 (0–9)
        ↓
If confidence ≥ 0.70 AND stable for 1,000 ms:
    ├─ dispatch(appendLetter()) → text buffer
    ├─ Play success sound (optional)
    └─ Update XP / progress
Else:
    └─ Display current prediction without committing
        ↓
User sees result immediately
```

> **Note:** The landmark MLP is the sole active engine in production
> (`useLandmarkModel` is hardcoded to `true` in the Redux slice).
> The CNN model remains available as a fallback but is not actively used.

### 3.2 Translation Flow (NOT YET IMPLEMENTED)

```
⚠ Status: Backend /api/translate returns a placeholder response.
  The translateController echoes the original text as "translated".
  Google Cloud Translation API integration is planned but not wired.

Planned flow (when implemented):
Recognized text in English
        ↓
Send to Google Translate API
        ↓
API returns Urdu translation
        ↓
Display side-by-side
        ↓
User can toggle English/Urdu view
```

### 3.3 Text-to-Speech Flow

```
English text ready
        ↓
User clicks "Speak" button
        ↓
Option 1: Web Speech API (free, offline, basic quality)
Option 2: Google Cloud TTS (paid, online, high quality)
        ↓
Audio generated
        ↓
Play sound to speaker
```

### 3.4 Conversation Save Flow (NOT YET IMPLEMENTED)

```
⚠ Status: Backend /api/conversations returns 501 Not Implemented.
  Firestore integration is planned but not yet wired.
  Currently, progress (XP, badges, leaderboard) is saved client-side
  via progressService.ts → Firebase Firestore directly from the frontend.

Planned flow (when implemented):
User performs signs → Text generated
        ↓
On "Save" button
        ↓
Package data (userId, messages, duration, date)
        ↓
Send to Firebase Firestore via backend API
        ↓
Conversation saved to database
        ↓
User can view history anytime
```

---

## 4. DATABASE SCHEMA

### 4.1 Firebase Firestore Structure

```
sign-language-bridge/
│
├── users/ (Collection)
│   └── {userId}
│       ├── email: "user@example.com"
│       ├── name: "Ahmed Khan"
│       ├── language: "ur" OR "en"
│       ├── createdAt: timestamp
│       ├── lastLogin: timestamp
│       ├── preferences: {
│       │   ├── textSize: "medium"
│       │   ├── theme: "light"
│       │   ├── ttsEnabled: true
│       │   ├── ttsLanguage: "en-US"
│       │   └── confidenceThreshold: 0.7
│       ├── profile: {
│       │   ├── avatar: "url"
│       │   ├── bio: "Learning sign language"
│       │   └── isPublic: true
│       └── statistics: {
│           ├── totalConversations: 42
│           ├── totalSignsUsed: 156
│           ├── practiceHours: 12
│           └── accuracy: 0.94
│
├── conversations/ (Collection)
│   └── {conversationId}
│       ├── userId: "user123"
│       ├── date: timestamp
│       ├── duration: 300 (seconds)
│       ├── messages: [
│       │   {
│       │     ├── id: "msg1"
│       │     ├── text: "Hello"
│       │     ├── urdu: "السلام علیکم"
│       │     ├── emoji: "👋"
│       │     ├── timestamp: timestamp
│       │     ├── confidence: 0.97
│       │     └── recognized: true
│       │   },
│       │   {
│       │     ├── id: "msg2"
│       │     ├── text: "Thank You"
│       │     ├── urdu: "شکریہ"
│       │     └── ...
│       │ ]
│       ├── title: "Morning Greeting"
│       └── isPublic: false
│
├── signs/ (Collection - Reference data)
│   └── {signId}
│       ├── letter: "A"
│       ├── name: "Alpha"
│       ├── category: "letter" (letter|number|phrase|emoji)
│       ├── emoji: "🅰️"
│       ├── urdu: "الف"
│       ├── description: "Make A shape with hand"
│       ├── difficulty: 1 (1-5)
│       └── images: ["url1", "url2"]
│
├── emojis/ (Collection)
│   └── {emojiId}
│       ├── emoji: "😊"
│       ├── name: "happy"
│       ├── urdu: "خوشحال"
│       ├── category: "emotion"
│       └── frequency: 234 (times used)
│
└── analytics/ (Collection)
    └── {date}
        ├── totalUsers: 1250
        ├── activeUsers: 340
        ├── totalPredictions: 45000
        ├── averageAccuracy: 0.954
        └── apiCalls: {
            ├── translate: 1200
            ├── tts: 450
            └── save: 890
        }
```

---

## 5. API ENDPOINTS

> **Implementation status key:** ✅ = Fully implemented, ⚠ = Stub/placeholder, ❌ = Not implemented

### 5.1 Health Check ✅
```
GET    /health
       → { status: "ok" }
```

### 5.2 Chat (Gemini AI) ✅
```
POST   /api/chat
       { message: "Hello", history: [{ role, parts }] }
       → { reply: "Hi there! How can I help..." }

Implementation: chatController.js → geminiService.js → Google Gemini REST API
Model: gemini-flash-latest (configurable via GEMINI_MODEL env)
```

### 5.3 Translation ⚠ (Placeholder)
```
POST   /api/translate
       { text: "Hello", fromLang: "en", toLang: "ur" }
       → { translated: "Hello" }   ← currently echoes original text

⚠ Google Cloud Translation API is not yet integrated.
  The controller returns the input text as the "translated" result.
```

### 5.4 Text-to-Speech ⚠ (501 Not Implemented)
```
POST   /api/speak
       { text: "Hello", language: "en-US" }
       → 501 Not Implemented

⚠ Google Cloud TTS is not yet integrated.
  The frontend uses the browser's Web Speech API for TTS instead.
```

### 5.5 Conversations ⚠ (501 Not Implemented)
```
POST   /api/conversations     (requires JWT Authorization header)
       { messages: [...], title: "Morning" }
       → 501 Not Implemented

GET    /api/conversations     (requires JWT Authorization header)
       → 501 Not Implemented

⚠ Firestore integration is planned but not yet wired.
  Progress tracking currently goes client-side via progressService.ts.
```

### 5.6 Signs ⚠ (Hardcoded Data)
```
GET    /api/signs
       → { signs: [{ letter: "A", category: "letter" }, ...] }

⚠ Returns a hardcoded list of A-Z letters with category "letter".
  Firestore signs/ collection integration is planned.
```

### 5.7 Authentication (Client-Side Only)
```
⚠ No backend auth endpoints exist (no /api/auth/*).
  Authentication is handled entirely client-side via Firebase Auth.
  The backend's requireAuth middleware validates JWT tokens
  but is only applied to /api/conversations (currently 501).
```

---

## 6. MODEL ARCHITECTURE

### 6.1 Landmark MLP Model (Primary Recognition Engine)

```
Input: 63 floats (21 landmarks × 3 coordinates, normalized)
    ↓
Normalization:
  • Translate so wrist (landmark 0) is origin
  • Scale by distance to middle-finger MCP (landmark 9)
    ↓
Dense(64, ReLU)
    ↓
Dropout(0.2)
    ↓
Dense(32, ReLU)
    ↓
Dropout(0.1)
    ↓
Dense(36, Softmax)
    ↓
Output: Probability distribution over 0-9 and a-z
```

**Parameters:**
- Lightweight MLP (~5K parameters)
- Size: < 1 MB
- Input: Normalized MediaPipe landmarks (not images)
- This is the sole active recognition engine in production

### 6.2 CNN Model (Image-Based Fallback)

```
Input: 64x64x3 (RGB image, normalized [0,1])
    ↓
Conv2D(32, 3x3) + ReLU + BatchNorm + MaxPool(2x2)
    ↓
Conv2D(64, 3x3) + ReLU + BatchNorm + MaxPool(2x2)
    ↓
Conv2D(128, 3x3) + ReLU + BatchNorm + MaxPool(2x2)
    ↓
Conv2D(256, 3x3) + ReLU + BatchNorm + MaxPool(2x2)
    ↓
Flatten
    ↓
Dense(256) + ReLU + Dropout(0.5)
    ↓
Dense(128) + ReLU + Dropout(0.5)
    ↓
Dense(36) + Softmax
    ↓
Output: Probability distribution over 0-9 and a-z
```

**Parameters:**
- Total: ~2.8M parameters
- Size: ~50 MB (Keras) → ~15 MB (TensorFlow.js)
- Test Accuracy: 93.57% (held-out test set, 36 classes)
- Inference Time: 50-100ms
- Note: 4 conv blocks (not 3); available as fallback but not actively used

### 6.3 Hand Detection (MediaPipe Hands)

```
Input: RGB frame from webcam
    ↓
MediaPipe Hands processes
    ↓
Output:
  - 21 hand landmarks per hand
  - x, y, z coordinates for each point
  - Hand presence detection
```

---

## 7. DEPLOYMENT ARCHITECTURE

### 7.1 Frontend Deployment

```
React App (built with Vite)
    ↓
Build process (minification, code splitting)
    ↓
Artifacts:
├── index.html
├── js/main.{hash}.js
├── css/style.{hash}.css
├── models/
│   ├── asl_model/            (CNN model — fallback)
│   │   ├── model.json
│   │   └── group1-shard1of1.bin
│   └── landmark_model/      (MLP model — primary)
│       ├── model.json
│       └── group1-shard1of1.bin
├── asl/                     (ASL dataset images for flashcards)
├── videos/                  (Tutorial video assets)
└── bg-pattern.jpg, logo.png
    ↓
Deploy to Firebase Hosting
    ↓
Available at: https://sign-language-bridge.web.app
```

### 7.2 Backend Deployment

```
Node.js Express App
    ↓
Environment variables (.env):
├── PORT=3000
├── FRONTEND_ORIGIN=http://localhost:5173
├── JWT_SECRET
├── GOOGLE_CLOUD_API_KEY     (for Gemini API)
├── GEMINI_MODEL             (default: gemini-flash-latest)
└── NODE_ENV=production
    ↓
Docker container (optional):
├── Dockerfile
└── docker-compose.yml
    ↓
Deploy to Google Cloud Run
    ↓
Available at: https://api.sign-language-bridge.com
```

### 7.3 CI/CD Pipeline

```
Developer pushes code
    ↓
GitHub Actions triggered
    ├─ Run tests
    ├─ Lint code
    ├─ Build frontend
    ├─ Build backend
    └─ Run security scans
    ↓
If all pass:
    ├─ Deploy to Firebase Hosting (frontend)
    ├─ Deploy to Google Cloud Run (backend)
    └─ Run smoke tests
    ↓
Update production
```

---

## 8. TECHNOLOGY STACK

| Layer | Technology | Purpose |
|-------|-----------|----------|
| **Frontend** | React 18, TypeScript, Vite | Web UI |
| **Styling** | Tailwind CSS | Design system |
| **State Mgmt** | Redux Toolkit | App state (prediction, text, mode) |
| **ML/AI (Primary)** | TensorFlow.js + MediaPipe Hands | Landmark MLP inference |
| **ML/AI (Fallback)** | TensorFlow.js | CNN image-based inference |
| **Audio** | Web Speech API + Web Audio API | TTS + sound effects |
| **Backend** | Node.js, Express | API server |
| **AI Chat** | Google Gemini API | Conversational AI via /api/chat |
| **Database** | Firebase Firestore | Progress, badges, leaderboard (client-side) |
| **Auth** | Firebase Auth | User authentication (client-side) |
| **Hosting** | Firebase Hosting | Frontend deployment (planned) |
| **Version Control** | Git, GitHub | Code management |
| **Onboarding** | react-joyride | First-visit guided tour |

---

## 9. SECURITY ARCHITECTURE

### 9.1 Authentication & Authorization

```
User Login
    ↓
Firebase Auth (handles encryption)
    ↓
JWT token generated
    ↓
Token stored in localStorage (httpOnly would be better)
    ↓
Every API call includes Authorization header
    ↓
Backend verifies token
    ↓
Request processed if valid, rejected if invalid
```

### 9.2 Data Protection

```
Client-side:
├─ No video stored
├─ Only text/metadata sent to server
└─ HTTPS only (TLS 1.3)

Server-side:
├─ Firestore encryption at rest
├─ API key restrictions
├─ Rate limiting (prevent abuse)
├─ Input validation (prevent injection)
└─ SQL injection prevention (using parameterized queries)

Database:
├─ Firebase security rules
├─ User data isolation
├─ Regular backups
└─ GDPR compliance
```

---

## 10. SCALABILITY & PERFORMANCE

### 10.1 Caching Strategy

```
Level 1: Browser Cache
├─ Models (landmark_model: <1MB + asl_model: ~15MB, cached)
├─ Static assets (HTML, CSS, JS)
├─ ASL dataset images (flashcard reference)
└─ User preferences

Level 2: CDN Cache
├─ Frontend assets
├─ Images
└─ Videos (optional)

Level 3: Server Cache
├─ Translation results (30 min TTL)
├─ User profiles (5 min TTL)
└─ Sign library (1 hour TTL)
```

### 10.2 Load Balancing

```
Traffic → Google Cloud Load Balancer
    ↓
Routes to multiple Cloud Run instances
    ↓
Auto-scaling: 1-100 instances based on load
    ↓
Firestore handles database scaling automatically
```

---

## 11. MONITORING & LOGGING

### 11.1 Metrics Tracked

```
Frontend:
├─ Page load time
├─ Model inference time
├─ API response time
├─ Error rates
└─ User interactions

Backend:
├─ API response time
├─ Database query time
├─ Error logs
├─ API usage per user
└─ Service uptime

Database:
├─ Read/write operations
├─ Query latency
├─ Storage usage
└─ Number of active users
```

### 11.2 Alerting

```
If prediction accuracy < 90%
    → Alert team

If API response > 2 seconds
    → Alert team

If error rate > 1%
    → Alert team

If database > 80% quota
    → Scale up
```

---

## 12. DISASTER RECOVERY

### 12.1 Backup Strategy

```
Database Backups:
├─ Daily automated backups
├─ 30-day retention
├─ Geo-redundant storage
└─ Test restore monthly

Code Backups:
├─ GitHub repository (primary)
├─ Google Cloud Source Repositories (backup)
└─ All commits logged

Model Backups:
├─ Multiple versions stored
├─ Version control (git tags)
└─ Can rollback anytime
```

### 12.2 Failure Scenarios

```
Scenario: Google Cloud down
→ Failover to backup region (automatic)
→ Users experience no interruption

Scenario: Model gives wrong results
→ Switch to previous model version
→ Investigate issue
→ Retrain if needed

Scenario: Database corruption
→ Restore from last good backup
→ Recover lost data
→ Notify users if needed
```

---

## 13. ARCHITECTURE DECISIONS

| Decision | Why | Trade-offs |
|----------|-----|-----------|
| **Client-side ML** | Privacy + speed | Offline first, no server load | Higher device requirements |
| **TensorFlow.js** | Browser compatible | Easy deployment | Less flexible than Python |
| **Firebase** | Managed service | Less DevOps | Vendor lock-in |
| **REST API** | Simple | Easy to use | Not real-time (need WebSocket for that) |
| **NoSQL (Firestore)** | Flexible schema | Easy to scale | Complex queries harder |

---

## 14. FUTURE ARCHITECTURE ENHANCEMENTS

- [ ] WebSocket for real-time collaboration
- [ ] Microservices for API (separate translation, TTS services)
- [ ] GraphQL API (more efficient)
- [ ] Redis caching (faster)
- [ ] Kubernetes orchestration (complex scaling)
- [ ] Mobile app (React Native)
- [ ] PSL model integration

---

**Document Owner:** Architecture Team  
**Last Updated:** September 3, 2026  
**Next Review:** After backend stub endpoints are fully implemented
