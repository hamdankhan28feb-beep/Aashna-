import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { appendChar, backspace, clearText } from '../../store/predictionSlice';
import { RootState } from '../../store';

export const ControlsBar: React.FC = () => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.prediction.text);

  const handleSpeak = () => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full mt-4">
      <button 
        onClick={() => dispatch(appendChar(' '))}
        className="px-5 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all font-medium flex items-center gap-2 shadow-sm"
      >
        <span className="text-xl opacity-50">␣</span> Space
      </button>
      
      <button 
        onClick={() => dispatch(backspace())}
        className="px-5 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all font-medium flex items-center gap-2 shadow-sm"
      >
        <span className="text-xl opacity-50">⌫</span> Delete
      </button>

      <button 
        onClick={handleSpeak}
        disabled={!text}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800/50 disabled:text-slate-600 text-white rounded-2xl border border-indigo-500 disabled:border-slate-800 transition-all font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/25 disabled:shadow-none ml-2"
      >
        Speak <span className="text-lg">🔊</span>
      </button>
      
      <div className="flex-1"></div>
      
      <button 
        onClick={() => dispatch(clearText())}
        className="px-5 py-3 bg-red-950/30 hover:bg-red-900/50 text-red-400 rounded-2xl border border-red-900/30 hover:border-red-800/50 transition-all font-medium"
      >
        Clear All
      </button>
    </div>
  );
};
