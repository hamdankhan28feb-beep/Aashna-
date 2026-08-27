# Aashna Current Project Report

**Date:** August 27, 2026
**Project:** Aashna (Sign Language Bridge)
**Frontend:** React 18, TypeScript, Vite, Redux, TensorFlow.js, MediaPipe
**Backend:** Node.js and Express

## Executive Summary

Aashna currently provides browser-based ASL static-sign recognition using a unified 36-class TensorFlow.js model. The recognition pipeline supports letters and numbers, while Quiz (Duolingo-style practice), Spelling Bee, Role Play, badges, and leaderboard UI are implemented on top of the same letter recognition path.

The recent feature failure was caused by lowercase model labels being compared with uppercase challenge targets. Challenge text could also persist between activities, causing stale letters to be evaluated as new input. These issues have been fixed.

## Verified Fixes

| Area | Finding | Resolution |
|---|---|---|
| Model output | Model labels letters as lowercase `a-z`; challenge targets use uppercase | Normalize letter predictions to uppercase in `modelService.ts` |
| Quiz | Stale Redux text could be evaluated after changing targets or starting Boss Fight | Clear challenge text at initialization, target advance, and Boss Fight start |
| Spelling Bee | Previous activity text could be treated as current word input | Clear text when entering and after completing a word |
| Role Play | Previous activity text could interfere with the next scripted word | Clear text when entering and when the bot advances the script |
| Held signs | A held sign could produce repeated letters | Retain stability and deduplication; lift the hand to enter the same sign again |
| Badges | Progress was loaded only once on mount | Refresh on focus, storage changes, and periodic active-session refresh |
| Leaderboard | Firestore errors appeared as an empty leaderboard | Show a Firebase connection/rules error and retry action |

## Current Feature Status

- **Core recognition:** Functional for the static 36-class model (`0-9`, `A-Z`).
- **Duolingo-style Quiz:** Functional with SRS letter selection, XP, levels, streaks, and Boss Fight.
- **Spelling Bee:** Functional with word targets, per-letter progression, and XP rewards.
- **Role Play:** Functional with scripted word-by-word interaction and XP rewards.
- **Badges:** Functional from local progress data and refreshed while active.
- **Leaderboard:** Implemented through Firestore, but requires authentication, network access, and valid Firestore rules.
- **Local progress:** Available through browser local storage without Firebase credentials.
- **Dynamic ASL signs:** Not implemented. Moving signs such as J and Z require temporal modeling.

## Firebase Requirements

The package and modular imports are installed correctly:

```powershell
cd frontend
npm ls firebase
```

Expected result:

```text
firebase@12.18.0
```

Environment variables are not needed for Vite to resolve `firebase/firestore`, but real credentials are required for Auth and Firestore network operations. Configure `VITE_FIREBASE_*` values in `frontend/.env.local`, enable the required Firebase Auth provider, and publish rules that allow the intended authenticated `users` reads and writes.

## Validation

The following check passes:

```powershell
cd frontend
npm run build
```

The build completes TypeScript compilation and Vite production bundling with no source diagnostics. Vite still reports a non-blocking large JavaScript chunk warning from the current TensorFlow.js bundle.

## Known Gaps and Next Steps

1. Add browser-level tests for camera prediction normalization and each challenge mode.
2. Configure and test Firebase Auth and Firestore rules in a real environment.
3. Move progress into a shared reactive store instead of polling local storage for badges.
4. Add temporal landmark modeling for dynamic signs and continuous phrase recognition.
5. Complete backend conversation persistence and production API integration.
