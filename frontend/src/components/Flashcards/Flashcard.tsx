import React, { useState } from 'react';
import type { FlashcardData } from '../../data/flashcards';

interface FlashcardProps {
  data: FlashcardData;
}

export const Flashcard: React.FC<FlashcardProps> = ({ data }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full aspect-[3/4] perspective-1000 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`w-full h-full duration-500 preserve-3d relative transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front of Card (Letter + Image) */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-3xl border-4 border-slate-100 shadow-xl overflow-hidden flex flex-col items-center justify-center p-4 hover:border-teal-200 transition-colors">
          <div className="text-[5rem] leading-none mb-2 transform group-hover:scale-110 transition-transform duration-300">
            {data.emoji}
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-5xl font-black text-teal-500">{data.letter}</span>
            <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">for</span>
          </div>
          <div className="text-3xl font-black text-slate-700 mt-2 tracking-tight">
            {data.word}
          </div>
        </div>

        {/* Back of Card (ASL Sign) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl border-4 border-white shadow-xl overflow-hidden flex flex-col items-center justify-center p-4 text-white">
          <p className="text-sm font-bold tracking-widest uppercase opacity-90 mb-4">ASL Sign</p>
          <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg overflow-hidden p-2">
            <img 
              src={`/asl/${data.letter}.jpg`} 
              alt={`ASL sign for ${data.letter}`} 
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<span class="text-4xl font-black text-slate-400 border-4 border-dashed border-slate-200 p-4 rounded-xl">${data.letter}</span>`;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
