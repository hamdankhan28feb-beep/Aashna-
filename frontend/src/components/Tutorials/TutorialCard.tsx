import React from 'react';
import { Play } from 'lucide-react';
import type { Tutorial } from '../../data/tutorials';

interface TutorialCardProps {
  tutorial: Tutorial;
  onOpen: (tutorial: Tutorial) => void;
}

const LEVEL_STYLES: Record<Tutorial['level'], string> = {
  Beginner: 'bg-emerald-100 text-emerald-600',
  Intermediate: 'bg-amber-100 text-amber-600',
  Advanced: 'bg-rose-100 text-rose-600',
};

export const TutorialCard: React.FC<TutorialCardProps> = ({ tutorial, onOpen }) => {
  const isAvailable = Boolean(tutorial.videoUrl);

  return (
    <button
      type="button"
      onClick={() => onOpen(tutorial)}
      className="group text-left w-full bg-white rounded-[2rem] border-4 border-lime-100 shadow-[0_10px_30px_-12px_rgba(132,204,22,0.25)] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-lime-200 hover:shadow-[0_20px_40px_-12px_rgba(132,204,22,0.4)] active:translate-y-0 active:scale-[0.98]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-lime-50 via-emerald-50 to-cyan-50 flex items-center justify-center overflow-hidden">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            isAvailable
              ? 'bg-white shadow-lg text-lime-500 group-hover:scale-110 group-hover:bg-lime-500 group-hover:text-white'
              : 'bg-white/60 text-slate-300'
          }`}
        >
          <Play className="w-7 h-7 fill-current" />
        </div>

        {!isAvailable && (
          <span className="absolute top-3 right-3 bg-slate-900/70 backdrop-blur-sm text-white text-[0.65rem] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
            Video coming soon
          </span>
        )}

        <span className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-sm text-white text-xs font-black px-2.5 py-1 rounded-full">
          ⏱ {tutorial.duration}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <span
          className={`self-start text-[0.65rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${LEVEL_STYLES[tutorial.level]}`}
        >
          {tutorial.level}
        </span>
        <h3 className="font-black text-slate-700 text-lg leading-snug group-hover:text-lime-600 transition-colors">
          {tutorial.title}
        </h3>
        <p className="text-sm font-bold text-slate-400 leading-relaxed line-clamp-2">
          {tutorial.description}
        </p>
      </div>
    </button>
  );
};
