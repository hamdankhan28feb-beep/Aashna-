import React, { useState, useEffect } from 'react';
import { getProgress, UserProgress } from '../../services/progressService';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  isUnlocked: (p: UserProgress) => boolean;
}

const BADGES: Badge[] = [
  {
    id: 'novice',
    title: 'Novice Signer',
    description: 'Reach Level 2 by earning your first 100 XP.',
    icon: '🌱',
    color: 'bg-emerald-500',
    isUnlocked: (p) => p.level >= 2,
  },
  {
    id: 'streak_3',
    title: 'Warming Up',
    description: 'Achieve a 3-day learning streak.',
    icon: '🔥',
    color: 'bg-orange-500',
    isUnlocked: (p) => p.dailyStreak >= 3,
  },
  {
    id: 'streak_7',
    title: 'Unstoppable',
    description: 'Achieve a 7-day learning streak.',
    icon: '☄️',
    color: 'bg-rose-500',
    isUnlocked: (p) => p.dailyStreak >= 7,
  },
  {
    id: 'alphabet_half',
    title: 'Getting the Hang of It',
    description: 'Successfully sign 10 different letters.',
    icon: '🖐️',
    color: 'bg-blue-500',
    isUnlocked: (p) => Object.keys(p.letterStats).length >= 10,
  },
  {
    id: 'alphabet_master',
    title: 'Alphabet Master',
    description: 'Successfully sign all 26 letters of the alphabet.',
    icon: '👑',
    color: 'bg-amber-400',
    isUnlocked: (p) => Object.keys(p.letterStats).length >= 26,
  },
  {
    id: 'xp_hoarder',
    title: 'XP Hoarder',
    description: 'Earn a total of 1,000 XP.',
    icon: '💎',
    color: 'bg-cyan-400',
    isUnlocked: (p) => p.xp >= 1000,
  },
  {
    id: 'level_5',
    title: 'Dedicated Scholar',
    description: 'Reach Level 5 by mastering your signs.',
    icon: '🎓',
    color: 'bg-fuchsia-500',
    isUnlocked: (p) => p.level >= 5,
  },
  {
    id: 'level_10',
    title: 'Grandmaster',
    description: 'Reach the prestigious Level 10.',
    icon: '🧙',
    color: 'bg-yellow-600',
    isUnlocked: (p) => p.level >= 10,
  },
  {
    id: 'xp_dragon',
    title: 'Dragon Hoarder',
    description: 'Earn a massive total of 5,000 XP.',
    icon: '🐉',
    color: 'bg-emerald-600',
    isUnlocked: (p) => p.xp >= 5000,
  },
  {
    id: 'streak_14',
    title: 'Iron Will',
    description: 'Achieve a 14-day learning streak.',
    icon: '⚔️',
    color: 'bg-slate-700',
    isUnlocked: (p) => p.dailyStreak >= 14,
  },
  {
    id: 'streak_30',
    title: 'Legendary',
    description: 'Achieve a massive 30-day learning streak.',
    icon: '👑',
    color: 'bg-yellow-400',
    isUnlocked: (p) => p.dailyStreak >= 30,
  },
  {
    id: 'xp_overachiever',
    title: 'Overachiever',
    description: 'Earn an unbelievable 10,000 XP.',
    icon: '🌟',
    color: 'bg-pink-500',
    isUnlocked: (p) => p.xp >= 10000,
  },
  {
    id: 'level_20',
    title: 'Deity of Signs',
    description: 'Reach Level 20. You are unstoppable.',
    icon: '⚡',
    color: 'bg-indigo-600',
    isUnlocked: (p) => p.level >= 20,
  },
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Earn your first 100 XP.',
    icon: '👶',
    color: 'bg-blue-300',
    isUnlocked: (p) => p.xp >= 100,
  },
  {
    id: 'consistent_learner',
    title: 'Consistent Learner',
    description: 'Achieve a 2-day learning streak.',
    icon: '👍',
    color: 'bg-green-400',
    isUnlocked: (p) => p.dailyStreak >= 2,
  },
  {
    id: 'half_century',
    title: 'Galactic Explorer',
    description: 'Earn an astronomical 50,000 XP.',
    icon: '🚀',
    color: 'bg-red-600',
    isUnlocked: (p) => p.xp >= 50000,
  },
  {
    id: 'letter_explorer',
    title: 'Letter Explorer',
    description: 'Successfully sign 5 different letters.',
    icon: '🔍',
    color: 'bg-teal-400',
    isUnlocked: (p) => Object.keys(p.letterStats).length >= 5,
  },
  {
    id: 'vowel_master',
    title: 'Vowel Master',
    description: 'Successfully sign all 5 vowels (A, E, I, O, U).',
    icon: '🗣️',
    color: 'bg-orange-400',
    isUnlocked: (p) => ['A', 'E', 'I', 'O', 'U'].every(v => p.letterStats[v]),
  },
  {
    id: 'level_50',
    title: 'The Final Boss',
    description: 'Reach Level 50.',
    icon: '👹',
    color: 'bg-red-900',
    isUnlocked: (p) => p.level >= 50,
  },
  {
    id: 'streak_365',
    title: 'A Full Year',
    description: 'Achieve a 365-day streak. Absolute dedication.',
    icon: '🎉',
    color: 'bg-fuchsia-600',
    isUnlocked: (p) => p.dailyStreak >= 365,
  }
];

export const AchievementsView: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const refreshProgress = () => setProgress(getProgress());
    refreshProgress();
    window.addEventListener('focus', refreshProgress);
    window.addEventListener('storage', refreshProgress);
    const refreshTimer = window.setInterval(refreshProgress, 1000);

    return () => {
      window.removeEventListener('focus', refreshProgress);
      window.removeEventListener('storage', refreshProgress);
      window.clearInterval(refreshTimer);
    };
  }, []);

  if (!progress) return null;

  const unlockedCount = BADGES.filter(b => b.isUnlocked(progress)).length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 p-4">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] p-8 lg:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="z-10 text-center md:text-left">
          <h1 className="text-4xl lg:text-5xl font-black mb-4 flex items-center justify-center md:justify-start gap-3">
            <span>🎖️</span> Your Badges
          </h1>
          <p className="text-indigo-100 font-bold text-lg lg:text-xl max-w-lg">
            Complete challenges across the app to unlock exclusive badges and show off your ASL mastery.
          </p>
        </div>
        <div className="z-10 bg-white/20 backdrop-blur-md rounded-3xl p-6 text-center border-2 border-white/30">
          <div className="text-5xl font-black text-white mb-1">
            {unlockedCount} <span className="text-2xl text-indigo-200">/ {BADGES.length}</span>
          </div>
          <div className="text-sm font-bold uppercase tracking-wider text-indigo-100">
            Badges Unlocked
          </div>
        </div>
        
        {/* Decorative background circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BADGES.map((badge) => {
          const unlocked = badge.isUnlocked(progress);
          
          return (
            <div 
              key={badge.id}
              className={`relative rounded-[2rem] p-6 border-4 transition-all duration-500 flex flex-col items-center text-center ${
                unlocked 
                  ? 'bg-white border-indigo-100 shadow-[0_20px_50px_-12px_rgba(99,102,241,0.15)] hover:-translate-y-2' 
                  : 'bg-slate-50 border-slate-200 grayscale opacity-70'
              }`}
            >
              {!unlocked && (
                <div className="absolute top-4 right-4 text-2xl opacity-50">
                  🔒
                </div>
              )}
              
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-4 shadow-inner ${
                unlocked ? badge.color : 'bg-slate-300'
              }`}>
                {badge.icon}
              </div>
              
              <h3 className={`text-xl font-black mb-2 ${unlocked ? 'text-slate-700' : 'text-slate-400'}`}>
                {badge.title}
              </h3>
              
              <p className={`font-bold text-sm ${unlocked ? 'text-slate-500' : 'text-slate-400'}`}>
                {badge.description}
              </p>

              {unlocked && (
                <div className="mt-4 bg-green-100 text-green-600 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  Unlocked
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
