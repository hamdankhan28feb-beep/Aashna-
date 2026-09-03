import React from 'react';
import { Camera, Layers, SpellCheck, MessageCircle, Trophy, Medal, Calculator, GraduationCap } from 'lucide-react';

export type TabMode = 'practice' | 'flashcards' | 'quiz' | 'numbers_game' | 'spelling' | 'roleplay' | 'tutorials' | 'leaderboard' | 'achievements';

interface TabBarProps {
  activeTab: TabMode;
  onTabChange: (tab: TabMode) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-8 w-full overflow-x-auto pb-4">
      <div data-tour="tab-bar" className="bg-white/60 backdrop-blur-md p-1.5 rounded-full border-2 border-white shadow-lg shadow-teal-500/10 flex items-center gap-1 min-w-max">
        <button
          onClick={() => onTabChange('practice')}
          className={`px-6 py-3 rounded-full text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'practice'
              ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-white shadow-md transform scale-105'
              : 'text-slate-800 hover:bg-white hover:text-teal-600'
          }`}
        >
          <Camera className="w-4 h-4" /> Live Practice
        </button>
        <button
          onClick={() => onTabChange('flashcards')}
          className={`px-6 py-3 rounded-full text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'flashcards'
              ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-md transform scale-105'
              : 'text-slate-800 hover:bg-white hover:text-rose-500'
          }`}
        >
          <Layers className="w-4 h-4" /> Flashcards
        </button>
        <button
          onClick={() => onTabChange('quiz')}
          className={`px-6 py-3 rounded-full text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'quiz'
              ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md transform scale-105'
              : 'text-slate-800 hover:bg-white hover:text-violet-500'
          }`}
        >
          <span className="text-lg">🦉</span> Duolingo Mode
        </button>
        <button
          onClick={() => onTabChange('numbers_game')}
          className={`px-6 py-3 rounded-full text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'numbers_game'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md transform scale-105'
              : 'text-slate-800 hover:bg-white hover:text-cyan-500'
          }`}
        >
          <Calculator className="w-4 h-4" /> Numbers Game
        </button>
        <button
          onClick={() => onTabChange('spelling')}
          className={`px-8 py-3 rounded-full text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'spelling'
              ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-md transform scale-105'
              : 'text-slate-800 hover:bg-white hover:text-pink-500'
          }`}
        >
          <SpellCheck className="w-5 h-5" /> Spelling Bee
        </button>
        <button
          onClick={() => onTabChange('roleplay')}
          className={`px-8 py-3 rounded-full text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'roleplay'
              ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-md transform scale-105'
              : 'text-slate-800 hover:bg-white hover:text-blue-500'
          }`}
        >
          <MessageCircle className="w-5 h-5" /> Roleplay
        </button>
        <button
          onClick={() => onTabChange('tutorials')}
          className={`px-8 py-3 rounded-full text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'tutorials'
              ? 'bg-gradient-to-r from-lime-400 to-emerald-500 text-white shadow-md transform scale-105'
              : 'text-slate-800 hover:bg-white hover:text-lime-600'
          }`}
        >
          <GraduationCap className="w-5 h-5" /> Tutorials
        </button>
        <button
          onClick={() => onTabChange('leaderboard')}
          className={`px-8 py-3 rounded-full text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'leaderboard'
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md transform scale-105'
              : 'text-slate-800 hover:bg-white hover:text-amber-500'
          }`}
        >
          <Trophy className="w-5 h-5" /> Leaderboard
        </button>
        <button
          onClick={() => onTabChange('achievements')}
          className={`px-8 py-3 rounded-full text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'achievements'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md transform scale-105'
              : 'text-slate-800 hover:bg-white hover:text-indigo-500'
          }`}
        >
          <Medal className="w-5 h-5" /> Badges
        </button>
      </div>
    </div>
  );
};
