import React, { useState } from 'react';
import { flashcards, numberFlashcards } from '../../data/flashcards';
import { Flashcard } from './Flashcard';
import { Type, Hash } from 'lucide-react';

export const FlashcardsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'letters' | 'numbers'>('letters');
  
  const currentCards = activeTab === 'letters' ? flashcards : numberFlashcards;

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-[3rem] p-8 border-4 border-white shadow-2xl overflow-y-auto max-h-[80vh]">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500 tracking-tight mb-6">
          Learn {activeTab === 'letters' ? 'the Alphabet' : 'Numbers'}
        </h2>
        
        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="bg-white/80 p-1.5 rounded-full shadow-sm flex items-center border-2 border-white">
            <button
              onClick={() => setActiveTab('letters')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'letters'
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600'
              }`}
            >
              <Type className="w-4 h-4" /> Letters (A-Z)
            </button>
            <button
              onClick={() => setActiveTab('numbers')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'numbers'
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600'
              }`}
            >
              <Hash className="w-4 h-4" /> Numbers (0-9)
            </button>
          </div>
        </div>

        <p className="text-slate-500 font-bold mt-2">
          Click any card to flip it and see the ASL sign!
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {currentCards.map((data) => (
          <Flashcard key={data.letter} data={data} />
        ))}
      </div>
    </div>
  );
};
