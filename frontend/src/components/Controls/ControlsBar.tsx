import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { appendChar, backspace, backspaceToWordStart, clearText } from '../../store/predictionSlice';
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
    <div className="flex flex-wrap items-center gap-4 w-full mt-2">
      <button 
        onClick={() => dispatch(appendChar(' '))}
        className="flex-1 sm:flex-none min-w-[8.5rem] px-6 py-4 bg-white hover:bg-slate-50 text-slate-600 rounded-[1.5rem] border-2 border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 font-bold flex items-center justify-center gap-3"
      >
        <span className="text-xl bg-slate-100 px-3 py-1 rounded-lg text-slate-400">␣</span> 
        Space
      </button>
      
      <button 
        onClick={() => dispatch(backspace())}
        className="flex-1 sm:flex-none min-w-[8.5rem] px-6 py-4 bg-white hover:bg-slate-50 text-slate-600 rounded-[1.5rem] border-2 border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 font-bold flex items-center justify-center gap-3"
      >
        <span className="text-xl">⌫</span> 
        Delete
      </button>

      <button 
        onClick={() => dispatch(backspaceToWordStart())}
        disabled={!text}
        title="Delete back to the start of the current word (undoes a Spell Assist suggestion)"
        className="flex-1 sm:flex-none min-w-[8.5rem] px-6 py-4 bg-white hover:bg-slate-50 disabled:hover:bg-white text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed rounded-[1.5rem] border-2 border-slate-100 hover:border-slate-200 disabled:border-slate-100 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 font-bold flex items-center justify-center gap-3"
      >
        <span className="text-xl">⌫</span> 
        Word
      </button>

      <button 
        onClick={handleSpeak}
        disabled={!text}
        className="flex-1 sm:flex-none min-w-[10rem] px-8 py-4 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white rounded-[1.5rem] border-0 disabled:border-2 disabled:border-slate-100 active:scale-95 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 hover:shadow-teal-500/40 transition-all duration-300 font-black flex items-center justify-center gap-3 shadow-lg shadow-teal-500/30 disabled:shadow-none sm:ml-auto"
      >
        Speak <span className="text-2xl animate-pulse">🔊</span>
      </button>
      
      <button 
        onClick={() => dispatch(clearText())}
        className="flex-1 sm:flex-none min-w-[8.5rem] px-6 py-4 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-[1.5rem] border-2 border-rose-100 hover:border-rose-200 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 font-bold flex items-center justify-center gap-2"
      >
        <span>🗑️</span> Clear
      </button>
    </div>
  );
};
