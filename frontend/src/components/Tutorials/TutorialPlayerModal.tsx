import React, { useEffect } from 'react';
import { Play, X } from 'lucide-react';
import type { Tutorial } from '../../data/tutorials';

interface TutorialPlayerModalProps {
  tutorial: Tutorial | null;
  onClose: () => void;
}

export const TutorialPlayerModal: React.FC<TutorialPlayerModalProps> = ({ tutorial, onClose }) => {
  // Close on Escape and lock page scroll while the player is open.
  useEffect(() => {
    if (!tutorial) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [tutorial, onClose]);

  if (!tutorial) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={tutorial.title}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="font-black text-slate-700 text-lg leading-snug">{tutorial.title}</h3>
          <button
            onClick={onClose}
            aria-label="Close video player"
            className="shrink-0 w-10 h-10 rounded-full bg-slate-50 border-2 border-slate-100 text-slate-400 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-500 flex items-center justify-center transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player / placeholder */}
        {tutorial.videoUrl ? (
          <video
            src={tutorial.videoUrl}
            controls
            autoPlay
            className="w-full aspect-video bg-black"
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-lime-50 via-emerald-50 to-cyan-50 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-white/70 flex items-center justify-center">
              <Play className="w-9 h-9 text-slate-300 fill-current" />
            </div>
            <p className="font-black text-slate-600 text-lg">Video coming soon</p>
            <p className="font-bold text-slate-400 text-sm max-w-sm">
              This lesson's recording hasn't been added yet — check back soon!
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="p-5 sm:p-6 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm font-bold text-slate-500 leading-relaxed">
            {tutorial.description}
          </p>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100">
              ⏱ {tutorial.duration}
            </span>
            <span className="text-xs font-black text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100">
              {tutorial.level}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
