# 🏗️ ARCHITECTURE DOCUMENT
## Sign Language Bridge - Technical System Design

**Document Version:** 1.1
**Last Updated:** August 27, 2026

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
│  ├─ Camera Component        (Webcam capture)                     │
│  ├─ Prediction Component    (Display results)                    │
│  ├─ Translation Component   (Show Urdu/English)                  │
│  ├─ Emoji Component         (Emotional expression)               │
│  └─ History Component       (Communication log)                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                  CLIENT-SIDE ML LAYER (Browser)                   │
├──────────────────────────────────────────────────────────────────┤
│  TensorFlow.js + MediaPipe.js                                     │
│  ├─ Hand Detection (MediaPipe)  → Detects hand positions         │
│  ├─ CNN Model (TensorFlow.js)   → Classifies 0-9 and A-Z         │
│  ├─ Post-processing             → Masks, normalizes, and smooths │
│  └─ Web Speech API              → Text-to-speech                 │
│                                                                    │
│  ✨ OFFLINE FIRST: All processing happens locally (private!)     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                     API LAYER (Backend Server)                    │
├──────────────────────────────────────────────────────────────────┤
│  Node.js + Express                                                │
│  ├─ /api/translate          → Google Translate API               │
│  ├─ /api/speak              → Google Text-to-Speech              │
│  ├─ /api/conversations      → Save & retrieve chats              │
│  ├─ /api/users              → User management                    │
│  └─ /api/signs              → Sign library & metadata            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    DATA & SERVICE LAYER                           │
├──────────────────────────────────────────────────────────────────┤
│  External Services:                                               │
│  ├─ Google Cloud Translation  → English ↔ Urdu                   │
│  ├─ Google Cloud TTS          → Text-to-speech                   │
│  ├─ Firebase Firestore        → Database                         │
│  ├─ Firebase Auth             → User authentication              │
│  ├─ Firebase Storage          → File storage (media)             │
│  └─ Firebase Hosting          → Web deployment                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. COMPONENT ARCHITECTURE

### 2.1 Frontend Components

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Language Selector (EN/UR)
│   │   └── User Menu
│   │
│   ├── MainContent
│   │   ├── CameraView
│   │   │   ├── Video Stream
│   │   │   ├── Hand Overlay (MediaPipe)
│   │   │   ├── Confidence Indicator
│   │   │   └── Start/Stop Button
│   │   │
│   │   ├── OutputPanel
│   │   │   ├── RecognizedText
│   │   │   ├── UrduTranslation
│   │   │   ├── EmojiDisplay
│   │   │   └── ConfidenceScore
│   │   │
│   │   ├── ControlsBar
│   │   │   ├── SpeakButton (🔊)
│   │   │   ├── ClearButton (🗑️)
│   │   │   ├── CopyButton (📋)
│   │   │   └── ShareButton (📤)
│   │   │
│   │   └── CommandButtons
│   │       ├── Backspace (Delete last letter)
│   │       ├── Space (Add space)
│   │       └── Period (Add punctuation)
│   │
│   └── SideBar
│       ├── History
│       ├── Favorites
│       ├── Settings
│       └── Help
│
└── Modals
    ├── SettingsModal
    ├── TutorialModal
    ├── HistoryModal
    └── ProfileModal
```

### 2.2 Backend Components

```
Express Server
├── Routes/
│   ├── auth.js              (User login/signup)
│   ├── predict.js           (Sign prediction)
│   ├── translate.js         (Language translation)
│   ├── speak.js             (Text-to-speech)
│   ├── conversations.js     (Chat history)
│   ├── users.js             (User profiles)
│   └── signs.js             (Sign library)
│
├── Controllers/
│   ├── authController.js
│   ├── predictController.js
│   ├── translateController.js
│   └── ...
│
├── Middleware/
│   ├── authentication.js    (JWT verification)
│   ├── errorHandler.js
│   ├── corsConfig.js
│   └── rateLimit.js
│
├── Services/
│   ├── googleTranslate.js   (Translation API)
│   ├── googleTTS.js         (Text-to-speech)
│   ├── firebaseDB.js        (Database operations)
│   └── modelService.js
│
└── Utils/
    ├── validators.js
    ├── logger.js
    └── helpers.js
```

---

## 3. DATA FLOW ARCHITECTURE

### 3.1 Real-time Prediction Flow

```
User performs sign
        ↓
Webcam captures frame (30 FPS)
        ↓
MediaPipe detects hand landmarks
        ↓
Extract hand keypoints (21 points per hand)
        ↓
Normalize & preprocess
        ↓
TensorFlow.js CNN model processes
        ↓
Model outputs: [confidence for 0-9 and a-z]
        ↓
Find highest confidence
        ↓
If confidence > 0.7 and the class is allowed for the active mode:
    ├─ Display letter
    ├─ Play sound (optional)
    ├─ Add to text output
Else:
    └─ Show "Uncertain"
        ↓
Text updates in real-time; challenge modes compare uppercase letters
        ↓
User sees result immediately
```

### 3.2 Translation Flow

```
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

### 3.4 Conversation Save Flow

```
User performs signs → Text generated
        ↓
Every 30 seconds OR on "Save" button
        ↓
Package data:
{
  userId: "user123",
  messages: [
    { text: "Hello", urdu: "السلام علیکم", timestamp: ... },
    { text: "How are you", urdu: "آپ کیسے ہو", timestamp: ... }
  ],
  duration: 120 (seconds),
  date: "2026-08-07"
}
        ↓
Send to Firebase Firestore
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

### 5.1 Authentication
```
POST   /api/auth/signup
       { email, password, name }
       → { userId, token, user }

POST   /api/auth/login
       { email, password }
       → { token, user }

POST   /api/auth/logout
       → { status: "logged out" }

GET    /api/auth/me
       (requires auth token)
       → { user }
```

### 5.2 Prediction
```
POST   /api/predict
       { imageBase64, model: "asl-letters" }
       → { 
           letter: "A",
           confidence: 0.97,
           alternatives: [
             { letter: "B", confidence: 0.02 },
             { letter: "C", confidence: 0.01 }
           ]
         }
```

### 5.3 Translation
```
POST   /api/translate
       { text: "Hello", fromLang: "en", toLang: "ur" }
       → { translated: "السلام علیکم" }

POST   /api/translate/batch
       { texts: ["Hello", "Goodbye"], toLanguage: "ur" }
       → { results: [{ original, translated }] }
```

### 5.4 Text-to-Speech
```
POST   /api/speak
       { text: "Hello", language: "en-US" }
       → { audioUrl: "data:audio/mp3;...", duration: 2.5 }
```

### 5.5 Conversations
```
POST   /api/conversations
       { messages: [...], title: "Morning" }
       → { conversationId, createdAt }

GET    /api/conversations
       (paginated)
       → { conversations: [], total: 42, page: 1 }

GET    /api/conversations/:id
       → { conversation details }

PUT    /api/conversations/:id
       { title, isPublic }
       → { updated conversation }

DELETE /api/conversations/:id
       → { status: "deleted" }
```

### 5.6 Users
```
GET    /api/users/:userId
       → { user profile }

PUT    /api/users/:userId
       { name, preferences, ... }
       → { updated user }

GET    /api/users/:userId/statistics
       → { stats: totalConversations, practiceHours, ... }

GET    /api/users/:userId/progress
       → { signsLearned, accuracy, badges, ... }
```

### 5.7 Signs
```
GET    /api/signs
       (query: category, difficulty, search)
       → { signs: [...], total: 250 }

GET    /api/signs/:id
       → { sign details }

GET    /api/signs/search?q=hello
       → { matching signs }
```

---

## 6. MODEL ARCHITECTURE

### 6.1 CNN Model (36-Class Recognition)

```
Input: 64x64x3 (RGB image)
    ↓
Conv2D(32, 3x3) + ReLU
    ↓
BatchNorm + MaxPool(2x2)
    ↓
Conv2D(64, 3x3) + ReLU
    ↓
BatchNorm + MaxPool(2x2)
    ↓
Conv2D(128, 3x3) + ReLU
    ↓
BatchNorm + MaxPool(2x2)
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
- Total: ~500K parameters
- Size: ~50 MB (Keras) → ~15 MB (TensorFlow.js)
- Accuracy: 98%+
- Inference Time: 50-100ms

### 6.2 Hand Detection (MediaPipe Holistic)

```
Input: RGB frame from webcam
    ↓
MediaPipe processes
    ↓
Output:
  - 21 hand landmarks per hand
  - x, y, z coordinates for each point
  - Confidence score
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
│   └── asl_model/
│       ├── model.json
│       └── weights.bin
└── public/
    ├── favicon.ico
    ├── images/
    └── data/
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
├── GOOGLE_CLOUD_API_KEY
├── FIREBASE_DATABASE_URL
├── JWT_SECRET
├── PORT=3000
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
|-------|-----------|---------|
| **Frontend** | React 18, TypeScript, Vite | Web UI |
| **Styling** | Tailwind CSS | Design system |
| **State Mgmt** | Redux Toolkit | App state |
| **ML/AI** | TensorFlow.js | Model inference |
| **Hand Detection** | MediaPipe JS | Hand landmarks |
| **Audio** | Web Audio API | Sound playback |
| **Backend** | Node.js, Express | API server |
| **Database** | Firebase Firestore | NoSQL database |
| **Auth** | Firebase Auth | User authentication |
| **Storage** | Firebase Cloud Storage | File storage |
| **Translation** | Google Cloud Translation | Language conversion |
| **TTS** | Google Cloud TTS | Text-to-speech |
| **Hosting** | Firebase Hosting | Frontend deployment |
| **Server** | Google Cloud Run | Backend deployment |
| **Version Control** | Git, GitHub | Code management |
| **CI/CD** | GitHub Actions | Automation |
| **Monitoring** | Google Cloud Logging | System monitoring |

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
├─ Models (asl_model: 15MB, cached)
├─ Static assets (HTML, CSS, JS)
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
**Last Updated:** August 7, 2026  
**Next Review:** August 14, 2026
