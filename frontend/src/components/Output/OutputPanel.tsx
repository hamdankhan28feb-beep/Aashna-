import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export const OutputPanel: React.FC = () => {
  const { current, text } = useSelector((state: RootState) => state.prediction);

  return (
    <div className="w-full bg-slate-900 rounded-3xl border border-slate-800/60 shadow-2xl overflow-hidden flex flex-col relative group transition-all duration-300 hover:shadow-indigo-500/5 hover:border-slate-700/80">
      <div className="p-4 border-b border-slate-800/50 bg-slate-800/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Translation</h2>
        </div>
        
        {current && (
          <div className="flex items-center gap-3 bg-slate-950/50 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Confidence</span>
            <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${current.confidence > 0.8 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                style={{ width: `${Math.round(current.confidence * 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-300">{Math.round(current.confidence * 100)}%</span>
          </div>
        )}
      </div>
      
      <div className="p-6 md:p-8 flex-1 min-h-[200px] flex items-center justify-between gap-6">
        <div className="flex-1">
          <p className="text-4xl md:text-6xl font-light text-slate-100 break-words leading-tight tracking-tight">
            {text || <span className="text-slate-700">Start signing...</span>}
            <span className="inline-block w-1 h-10 md:h-14 bg-indigo-500 ml-1 animate-pulse align-middle rounded-full opacity-80"></span>
          </p>
        </div>
        
        {current && current.confidence > 0.5 && (
          <div className="hidden sm:flex shrink-0 w-28 h-28 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 items-center justify-center shadow-inner">
            <span className="text-6xl font-bold text-indigo-400 drop-shadow-md">{current.letter}</span>
          </div>
        )}
      </div>
    </div>
  );
};
