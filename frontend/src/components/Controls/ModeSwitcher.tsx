import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setSignMode, SignMode } from '../../store/predictionSlice';
import { Type, Hash, MessageSquare } from 'lucide-react';

// ── Feature flag ────────────────────────────────────────────────────────────
// Phrases mode is hidden until a dedicated phrase-recognition model exists.
// Flip this to true to re-enable the button — all underlying phrases mode
// logic (predictionSlice, CameraView, RoleplayView) is left untouched.
const SHOW_PHRASES_MODE = false;

export const ModeSwitcher: React.FC = () => {
  const dispatch = useDispatch();
  const currentMode = useSelector((state: RootState) => state.prediction.signMode);

  const modes: { id: SignMode; label: string; icon: React.ReactNode }[] = [
    { id: 'letters', label: 'Letters (A-Z)', icon: <Type className="w-4 h-4" /> },
    { id: 'numbers', label: 'Numbers (0-9)', icon: <Hash className="w-4 h-4" /> }
  ];

  if (SHOW_PHRASES_MODE) {
    modes.push({ id: 'phrases', label: 'Phrases', icon: <MessageSquare className="w-4 h-4" /> });
  }

  return (
    <div className="flex bg-white/60 backdrop-blur-md p-2 rounded-3xl border border-white/50 shadow-sm w-full md:w-max mx-auto lg:mx-0">
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => dispatch(setSignMode(mode.id))}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap
              ${isActive 
                ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-lg shadow-teal-500/30' 
                : 'text-slate-800 hover:text-teal-700 hover:bg-white/90 shadow-sm hover:shadow-md'}
            `}
          >
            {mode.icon}
            {mode.label}
          </button>
        );
      })}
    </div>
  );
};
