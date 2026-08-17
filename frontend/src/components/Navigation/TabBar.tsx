import React from 'react';

export type TabMode = 'practice' | 'flashcards';

interface TabBarProps {
  activeTab: TabMode;
  onTabChange: (tab: TabMode) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-8 w-full">
      <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-full border-2 border-white shadow-lg shadow-teal-500/10 flex items-center gap-1">
        <button
          onClick={() => onTabChange('practice')}
          className={`px-8 py-3 rounded-full text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'practice'
              ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-white shadow-md transform scale-105'
              : 'text-slate-500 hover:bg-white hover:text-teal-600'
          }`}
        >
          <span className="text-lg">📷</span> Live Practice
        </button>
        <button
          onClick={() => onTabChange('flashcards')}
          className={`px-8 py-3 rounded-full text-sm font-black tracking-wide transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'flashcards'
              ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-md transform scale-105'
              : 'text-slate-500 hover:bg-white hover:text-rose-500'
          }`}
        >
          <span className="text-lg">🎴</span> Flashcards
        </button>
      </div>
    </div>
  );
};
