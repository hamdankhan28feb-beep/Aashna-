import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProgress {
  xp: number;
  level: number;
  dailyStreak: number;
  lastActiveDate: string;
  letterStats: Record<string, { attempts: number; successes: number; weight: number }>;
}

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  dailyStreak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  letterStats: {},
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Syncs Firestore down to local storage when user logs in
export const syncProgressFromCloud = async () => {
  if (!auth.currentUser) return;
  try {
    const docRef = doc(db, 'users', auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      localStorage.setItem('aashna_progress', JSON.stringify(docSnap.data()));
    }
  } catch (e) {
    console.error("Failed to sync from cloud", e);
  }
};

export const getProgress = (): UserProgress => {
  const data = localStorage.getItem('aashna_progress');
  let progress = DEFAULT_PROGRESS;
  
  if (data) {
    try {
      progress = JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse progress", e);
    }
  }
  
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate streaks
  if (progress.lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (progress.lastActiveDate === yesterdayStr) {
      progress.dailyStreak += 1;
    } else if (progress.lastActiveDate < yesterdayStr) {
      progress.dailyStreak = 0; // Streak broken
    }
    progress.lastActiveDate = today;
    saveProgress(progress);
  }
  
  return progress;
};

export const saveProgress = (progress: UserProgress) => {
  localStorage.setItem('aashna_progress', JSON.stringify(progress));
  
  // Background sync to cloud if logged in
  if (auth.currentUser) {
    const dataToSave = {
      ...progress,
      email: auth.currentUser.email, // Add email for the leaderboard!
      updatedAt: new Date().toISOString()
    };
    
    setDoc(doc(db, 'users', auth.currentUser.uid), dataToSave, { merge: true }).catch(e => {
      console.error("Failed to save to cloud", e);
    });
  }
};

export const addXp = (amount: number): UserProgress => {
  const p = getProgress();
  p.xp += amount;
  p.level = Math.floor(p.xp / 100) + 1; // Level up every 100 XP
  saveProgress(p);
  return p;
};

// Spaced Repetition System (SRS) - updates how hard a letter is based on time taken
export const updateLetterStats = (letter: string, timeToSignMs: number) => {
  const p = getProgress();
  if (!p.letterStats[letter]) {
    p.letterStats[letter] = { attempts: 0, successes: 0, weight: 1.0 };
  }
  
  const stat = p.letterStats[letter];
  stat.attempts += 1;
  stat.successes += 1;
  
  // If it took longer than 3 seconds to sign, increase weight (make it appear more often)
  if (timeToSignMs > 3000) {
    stat.weight += 0.5;
  } else {
    // If signed quickly, reduce weight (minimum 0.1)
    stat.weight = Math.max(0.1, stat.weight - 0.2);
  }
  
  saveProgress(p);
};

// SRS Algorithm to pick the next best letter for the user to practice
export const getNextSRSLetter = (currentLetter: string): string => {
  const p = getProgress();
  let totalWeight = 0;
  
  // Assign default weight of 1.0 to unseen letters
  const weights = ALPHABET.map(letter => {
    // Skip current letter so we don't test it twice in a row
    if (letter === currentLetter) return { letter, weight: 0 };
    
    const weight = p.letterStats[letter] ? p.letterStats[letter].weight : 1.0;
    totalWeight += weight;
    return { letter, weight };
  });
  
  let random = Math.random() * totalWeight;
  for (const item of weights) {
    random -= item.weight;
    if (random <= 0) return item.letter;
  }
  
  return 'A'; // fallback
};
