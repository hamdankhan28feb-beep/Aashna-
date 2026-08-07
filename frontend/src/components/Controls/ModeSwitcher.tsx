import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setSignMode, SignMode } from '../../store/predictionSlice';

export const ModeSwitcher: React.FC = () => {
  const dispatch = useDispatch();
  const currentMode = useSelector((state: RootState) => state.prediction.signMode);

  const modes: { id: SignMode; label: string }[] = [
    { id: 'letters', label: 'Letters (A-Z)' },
    { id: 'numbers', label: 'Numbers (0-9)' },
    { id: 'phrases', label: 'Phrases' }
  ];

  return (
    <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-lg w-full">
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => dispatch(setSignMode(mode.id))}
            className={`
              flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300
              ${isActive 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
            `}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
};
