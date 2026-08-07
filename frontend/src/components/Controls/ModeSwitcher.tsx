import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setSignMode, SignMode } from '../../store/predictionSlice';

export const ModeSwitcher: React.FC = () => {
  const dispatch = useDispatch();
  const currentMode = useSelector((state: RootState) => state.prediction.signMode);

  const modes: { id: SignMode; label: string; icon: string }[] = [
    { id: 'letters', label: 'Letters (A-Z)', icon: '📝' },
    { id: 'numbers', label: 'Numbers (0-9)', icon: '🔢' },
    { id: 'phrases', label: 'Phrases', icon: '💬' }
  ];

  return (
    <div className="flex bg-white/60 backdrop-blur-md p-2 rounded-3xl border border-white/50 shadow-sm w-full md:w-max mx-auto lg:mx-0">
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => dispatch(setSignMode(mode.id))}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-sm font-bold transition-all duration-300 hover:-translate-y-1
              ${isActive 
                ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-lg shadow-teal-500/30 transform scale-105' 
                : 'text-slate-500 hover:text-teal-600 hover:bg-white/90 active:scale-95 active:translate-y-0 shadow-sm hover:shadow-md'}
            `}
          >
            <span className="text-lg">{mode.icon}</span>
            {mode.label}
          </button>
        );
      })}
    </div>
  );
};
