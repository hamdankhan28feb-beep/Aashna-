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
  }
];

export const AchievementsView: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    // In a real app we'd subscribe to Redux, but we can just poll local storage for the view
    setProgress(getProgress());
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
