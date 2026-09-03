import React, { useState } from 'react';
import { tutorials, type Tutorial } from '../../data/tutorials';
import { TutorialCard } from './TutorialCard';
import { TutorialPlayerModal } from './TutorialPlayerModal';

export const TutorialsView: React.FC = () => {
  const [selected, setSelected] = useState<Tutorial | null>(null);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page header */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between shrink-0">
        <div className="bg-lime-100 text-lime-600 font-black px-4 py-2 rounded-xl text-lg flex items-center gap-2">
          🎓 Tutorials
        </div>
        <div className="text-slate-500 font-bold">
          {tutorials.length} {tutorials.length === 1 ? 'lesson' : 'lessons'}
        </div>
      </div>

      {/* Intro banner */}
      <div className="bg-gradient-to-r from-lime-50 to-emerald-50 border-4 border-lime-100 rounded-[2rem] p-6 flex items-start sm:items-center gap-4">
        <div className="text-4xl shrink-0">🎬</div>
        <div>
          <h2 className="font-black text-slate-700 text-lg">Video tutorials from your instructor</h2>
          <p className="font-bold text-slate-400 text-sm mt-1">
            Short recordings that guide you through signing techniques and the app's features.
            Pick a lesson below to get started!
          </p>
        </div>
      </div>

      {/* Lesson grid / empty state */}
      {tutorials.length === 0 ? (
        <div className="bg-white rounded-[3rem] border-8 border-lime-100 shadow-[0_20px_50px_-12px_rgba(132,204,22,0.2)] p-12 flex flex-col items-center justify-center gap-4 text-center">
          <div className="text-6xl animate-bounce">🎬</div>
          <h3 className="text-xl font-black text-slate-700">No tutorials yet</h3>
          <p className="font-bold text-slate-400 max-w-md">
            Video recordings will appear here once they're added. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <TutorialCard key={tutorial.id} tutorial={tutorial} onOpen={setSelected} />
          ))}
        </div>
      )}

      <TutorialPlayerModal tutorial={selected} onClose={() => setSelected(null)} />
    </div>
  );
};
