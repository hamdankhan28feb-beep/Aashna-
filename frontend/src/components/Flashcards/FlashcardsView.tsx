import React from 'react';
import { flashcards } from '../../data/flashcards';
import { Flashcard } from './Flashcard';

export const FlashcardsView: React.FC = () => {
  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-[3rem] p-8 border-4 border-white shadow-2xl overflow-y-auto max-h-[80vh]">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500 tracking-tight">
          Learn the Alphabet
        </h2>
        <p className="text-slate-500 font-bold mt-2">
          Click any card to flip it and see the ASL sign!
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {flashcards.map((data) => (
          <Flashcard key={data.letter} data={data} />
        ))}
      </div>
    </div>
  );
};
