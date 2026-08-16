# 🧠 PROJECT MEMORY
## Sign Language Bridge - Key Context & Decisions

---

## 1. PROJECT VISION

**Mission:** Help deaf people communicate independently with hearing people

**Problem We're Solving:**
- Deaf people struggle to communicate with hearing people without an interpreter
- Language barriers limit education and employment opportunities
- Communication technology doesn't serve the deaf community well

**Our Solution:**
- Real-time sign language recognition using AI
- Convert signs to text and speech
- Translate to local languages (Urdu for Pakistan)
- Empower deaf people with independence

---

## 2. KEY TEAM MEMBERS

```
Muhammad:
├─ Role: Co-founder, ML Engineer, Full-stack developer
├─ Responsibilities: Model training, Python backend, AI integration
├─ Strengths: Deep learning, data processing, hackathon experience
├─ Contact: [Your contact]
└─ GitHub: hamdankhan28feb-beep

Partner:
├─ Role: Co-founder, Frontend Developer
├─ Responsibilities: React UI, Camera integration, User experience
├─ Strengths: React, UI/UX, real-time interactions
├─ Contact: [Partner contact]
└─ GitHub: [Partner GitHub]
```

---

## 3. CRITICAL PROJECT DECISIONS

### Decision 1: Start with ASL, Not PSL ✅
**Decision:** Use American Sign Language first, migrate to Pakistani Sign Language later

**Why:**
- Large public dataset available (87,000 images from Kaggle)
- Faster development (less labeling needed)
- More ML resources and tutorials
- Hackathon timeline constraint

**Future:** Will transition to PSL (Pakistan Sign Language) after MVP

**Impact:** Allows us to ship faster, validate approach, then adapt for Pakistan market

---

### Decision 2: TensorFlow.js (Browser-based ML) ✅
**Decision:** Run the ML model in the browser, not on servers

**Why:**
- Privacy: No video/image uploaded to servers
- Speed: No network latency (real-time)
- Cost: No expensive GPU servers
- Offline: Works without internet

**Trade-off:** Requires model to be small (~15-20 MB), so less complex models

**Alternative We Rejected:** Python Flask backend + GPU servers (slower, less private, expensive)

---

### Decision 3: Firebase for Database ✅
**Decision:** Use Firebase instead of traditional SQL database

**Why:**
- Managed service (less DevOps)
- Real-time capabilities
- Easy authentication
- Scales automatically
- Free tier is generous

**Trade-off:** Vendor lock-in with Google, less control over data

---

### Decision 4: Phased Approach ✅
**Decision:** Build MVP with A-Z letters first, then expand

**Why:**
- Faster shipping (2 weeks vs 4 weeks)
- Can test with real users early
- Get feedback before building full features
- Reduce risk

**Phases:**
1. A-Z recognition (basic MVP)
2. Numbers + phrases (expansion)
3. Text-to-speech (output)
4. Translation (localization)
5. Emoji (UX enhancement)

**Impact:** Can ship working product in Week 2, gather feedback

---

### Decision 5: Focus on User Impact ✅
**Decision:** Design for deaf users first, hearing people second

**Why:**
- Solves real problem
- Creates competitive advantage
- Aligns with mission
- Better market fit

**Design Principles:**
- Clear, simple interface
- No confusing jargon
- Real-time feedback
- Works for all abilities

---

## 4. CRITICAL LEARNINGS

### What Worked Well:
```
✅ Downloaded pre-trained model weights
✅ Used public dataset (Kaggle ASL)
✅ GitHub Copilot for faster coding
✅ Clear planning before coding
✅ Modular code structure
```

### What We'd Do Differently:
```
❌ Would have started with smaller dataset first (test pipeline)
❌ Should have tested model accuracy earlier
❌ Need more documentation during coding
❌ Frontend setup should happen in parallel
```

---

## 5. TECHNOLOGY STACK RATIONALE

### Frontend: React 18 + Vite
```
Why:
✅ Component-based (modular)
✅ Large ecosystem
✅ Vite = super fast builds
✅ Good for real-time updates
```

### ML: TensorFlow.js + MediaPipe
```
Why:
✅ Browser-native
✅ No server needed
✅ MediaPipe = mature hand detection
✅ Fast inference
```

### Backend: Node.js + Express
```
Why:
✅ JavaScript (same language as frontend)
✅ Good for real-time (WebSocket ready)
✅ Large npm ecosystem
✅ Easy to scale
```

### Database: Firebase Firestore
```
Why:
✅ NoSQL (flexible schema for sign data)
✅ Real-time updates
✅ Built-in authentication
✅ Serverless (no ops)
```

---

## 6. COMPETITION & MARKET

### Existing Solutions:
```
❌ Google Translate
   - Doesn't support sign language
   - No real-time camera input

❌ Specialized sign language apps
   - Exist but poor quality
   - Limited language support
   - High prices

❌ Academic projects
   - Not user-friendly
   - Hard to deploy
```

### Our Competitive Advantages:
```
✅ Free and open-source approach
✅ Focus on deaf user needs
✅ Multi-language (English + Urdu)
✅ Real-time, offline-capable
✅ Active development & support
```

---

## 7. IMPORTANT CONSTRAINTS

### Technical Constraints:
```
Model Size:      < 50 MB (browser memory)
Inference Time:  < 100ms (real-time)
Accuracy:        > 90% (user acceptable)
Bandwidth:       < 1 Mbps (developing countries)
Device Support:  Chrome, Firefox, Safari, Mobile browsers
```

### Business Constraints:
```
Timeline:        4 weeks to MVP
Budget:          Minimal (using free tiers)
Team:            2 developers (no designer)
Launch Target:   Hackathon deadline
```

### User Constraints:
```
No prior tech knowledge needed
Works on basic smartphones
Doesn't require stable internet (offline first)
Intuitive - max 2 mins to learn
Accessible for all abilities
```

---

## 8. PHASE GATES & MILESTONES

```
Phase 1 Gate: Model evaluation passes (>90% accuracy) ✅
→ APPROVE to move to Phase 2

Phase 2 Gate: Camera works, hand detection visible
→ APPROVE to move to Phase 3

Phase 3 Gate: Real-time A-Z recognition working
→ APPROVE to move to Phase 4

Phase 4 Gate: Text building functional
→ APPROVE to move to Phase 5

Phase 5 Gate: Text-to-speech working
→ APPROVE to move to Phase 6

Phase 6 Gate: Translation API integrated
→ APPROVE to move to Phase 7

Final Gate: All features tested, zero critical bugs
→ DEPLOY to production
```

---

## 9. SUCCESS METRICS

### Must-Have (MVP)
```
✅ A-Z recognition works
✅ > 90% accuracy
✅ < 100ms inference time
✅ Text displays in real-time
✅ Works on desktop/mobile
✅ No crashes or errors
```

### Should-Have (Good Product)
```
✅ Text-to-speech works
✅ English-Urdu translation
✅ User can save conversations
✅ Emoji support
✅ Works offline
```

### Nice-to-Have (Polish)
```
✅ User profiles with history
✅ Learning progress tracking
✅ Multiple language support
✅ Mobile app
✅ PSL support
```

---

## 10. RISK MITIGATION

### Risk 1: Model Accuracy Too Low
```
Problem: If accuracy < 90%, app unusable
Mitigation: 
  - Continuously test on real users
  - Retrain with user feedback
  - Add confidence threshold
Solution: Use smaller vocabulary if needed (A-Z first)
```

### Risk 2: Model Too Slow for Real-time
```
Problem: If inference > 500ms, feels laggy
Mitigation:
  - Profile code to find bottlenecks
  - Use quantization to reduce model size
  - Optimize hand detection
Solution: Benchmark weekly
```

### Risk 3: Timeline Slippage
```
Problem: Can't ship in 4 weeks
Mitigation:
  - Ruthlessly prioritize MVP features
  - Cut non-essential features early
  - Pair programming to speed up
Solution: Ship A-Z recognition first, expand later
```

### Risk 4: User Data Privacy Breach
```
Problem: User trust destroyed if data leaked
Mitigation:
  - Never store raw video
  - Encrypt database
  - Use HTTPS everywhere
  - Regular security audits
Solution: Privacy-first architecture
```

---

## 11. PARTNER COMMUNICATION PROTOCOL

### Daily Sync (15 mins):
```
1. What did I complete yesterday?
2. What am I working on today?
3. Any blockers?
4. Anything to discuss?
```

### Weekly Sync (1 hour):
```
1. Review completed work
2. Test functionality together
3. Plan next week
4. Code review session
```

### Decision-Making Process:
```
For major decisions:
1. Discuss together
2. List pros/cons
3. Decide by consensus
4. Document decision in Memory.md
```

---

## 12. FREQUENTLY ASKED QUESTIONS

### Q: Why not use PSL?
**A:** ASL dataset is available, PSL data is scarce. We'll migrate to PSL after MVP succeeds.

### Q: Why TensorFlow.js and not Python?
**A:** We need to run the model in the browser for privacy and speed. TensorFlow.js is the best option.

### Q: Will this work offline?
**A:** Yes! The model runs locally in the browser. Only API calls (translate, TTS) need internet.

### Q: How long to train?
**A:** 5-10 minutes on CPU. Already done! ✅

### Q: Can we make a mobile app?
**A:** Later. Start with web, then React Native for iOS/Android.

### Q: What about accuracy?
**A:** Currently 98% on test set. May drop to 95% on real users (hand angles, lighting vary).

### Q: How much will this cost?
**A:** Free tier covers MVP (Firebase free, Google Cloud free credits).

---

## 13. RESOURCES & REFERENCES

### Dataset:
```
Kaggle ASL Alphabet: 87,000 images of A-Z letters
Download: kaggle.com/datasets/ayuraj/asl-dataset
```

### Technologies:
```
TensorFlow.js:   ml5js.org, tensorflow.org/js
MediaPipe:       mediapipe.dev
React:           reactjs.org
Firebase:        firebase.google.com
Google Cloud:    cloud.google.com
```

### Learning Resources:
```
Sign Language: 
  - Wikipedia: Sign language
  - ASL dictionary: handspeak.com
  - YouTube: ASL tutorials

ML:
  - TensorFlow tutorials
  - MediaPipe documentation
  - Fast.ai courses
```

---

## 14. FUTURE ROADMAP (Post-MVP)

### Phase 2 (Months 2-3):
```
[ ] PSL (Pakistani Sign Language) support
[ ] Phrase recognition (common words)
[ ] User profiles and history
[ ] Mobile app (React Native)
[ ] Community features (share conversations)
```

### Phase 3 (Months 4-6):
```
[ ] Video chat integration
[ ] Live transcription
[ ] Educational content
[ ] Deaf community partnerships
[ ] Accessibility features
```

### Phase 4 (Year 2):
```
[ ] Expand to 20+ sign languages
[ ] Full sentence recognition
[ ] AI-powered grammar correction
[ ] Real-time caption service
[ ] Enterprise solutions
```

---

## 15. KEY CONTACTS & LINKS

```
Project Repository:
GitHub: github.com/hamdankhan28feb-beep/Aashna-

Datasets:
Kaggle: kaggle.com/datasets/ayuraj/asl-dataset

APIs:
Google Cloud: console.cloud.google.com
Firebase: console.firebase.google.com

Tools:
GitHub: github.com
Figma (Design): figma.com
Slack (Team): [Your workspace]
```

---

## 16. DECISION LOG

| Date | Decision | Rationale | Owner |
|------|----------|-----------|-------|
| Aug 7, 2026 | Start with ASL, not PSL | Dataset available, faster shipping | Muhammad Hamdan|
| Aug 7, 2026 | Use TensorFlow.js | Privacy, speed, cost | Muhammad Hamdan|
| Aug 7, 2026 | Use Firebase | Managed service, easy scaling | Muhammad Hamdan|
| Aug 7, 2026 | Phased approach (A-Z first) | Ship faster, get feedback | Both |
| Aug 7, 2026 | Focus on deaf users first | Better product, market fit | Muhammad Hamdan |

---

## 17. PROJECT ARTIFACTS

```
Code:
├── GitHub: hamdankhan28feb-beep/Aashna-
├── Branch: main, develop, feature/*
└── Tags: v1.0.0, v1.1.0, ...

Documentation:
├── PRD.md                ← Product vision
├── Architecture.md       ← System design
├── Rules.md             ← Coding standards
├── Phases.md            ← Timeline & tasks
├── Design.md            ← UI/UX system
└── Memory.md            ← This file

Models:
├── asl_model.h5         ← Trained Keras model
└── asl_model_web/       ← TensorFlow.js format

Data:
├── data/raw/            ← Original images
└── data/processed/      ← Preprocessed arrays
```

---

## 18. UPDATES TO THIS DOCUMENT

**When to update Memory.md:**
- After each phase completion
- When making important decisions
- When learning something critical
- When updating timeline
- When risks materialize
- When adding new features

**Who updates:**
- Muhammad Hamdan: Technical decisions, ML updates
- Ayesha Nehal: Frontend decisions, UX updates
- Both: Project status, timeline changes

---

## CURRENT STATUS ✅

```
Project: Sign Language Bridge
Team: Muhammad Hamdan + Ayesha Nehal
Date: August 7, 2026
Status: MVP Development Started

Completed:
✅ Project vision defined
✅ Team assembled
✅ Architecture designed
✅ Technologies chosen
✅ Dataset downloaded (87,000 images)
✅ Model trained (98% accuracy)
✅ Documentation created

In Progress:
⏳ Phase 1: Model evaluation & conversion

Next:
⏳ Phase 2: Frontend setup
⏳ Phase 3: Real-time predictions
⏳ Phases 4-9: Full implementation

Target: 4 weeks to MVP (by Aug 31, 2026)
```

---

**Document Owner:** Muhammad Hamdan + Ayesha Nehal  
**Last Updated:** August 7, 2026  
**Next Review:** After each phase completion
