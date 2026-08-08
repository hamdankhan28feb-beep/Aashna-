import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export const OutputPanel: React.FC = () => {
  const { current, text } = useSelector((state: RootState) => state.prediction);
  const [bounce, setBounce] = useState(false);

  // Trigger bounce animation when a confident letter is detected
  useEffect(() => {
    if (current && current.confidence > 0.8) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 600);
      return () => clearTimeout(timer);
    }
  }, [current?.timestamp]);

  const isConfident = current && current.confidence > 0.7;

  return (
    <div className="w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col relative transition-all duration-300">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-orange-400 animate-pulse"></div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span>✍️</span> Translation
            </h2>
        </div>
        
        {current && (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
            <span className="text-xs text-slate-400 font-bold tracking-wider">CONFIDENCE</span>
            <div className="h-2.5 w-24 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${isConfident ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`}
                style={{ width: `${Math.round(current.confidence * 100)}%` }}
              />
            </div>
            <span className={`text-sm font-black ${isConfident ? 'text-teal-600' : 'text-orange-500'}`}>
              {Math.round(current.confidence * 100)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6 md:p-10 flex-1 min-h-[220px] flex items-center justify-between gap-6">
        <div className="flex-1">
          <p className="text-4xl md:text-6xl font-bold text-slate-700 break-words leading-tight tracking-tight">
            {text || <span className="text-slate-300 font-medium">Start signing...</span>}
            <span className="inline-block w-1.5 h-12 md:h-16 bg-teal-400 ml-2 animate-pulse align-middle rounded-full opacity-80"></span>
          </p>
        </div>
        
        {current && current.confidence > 0.5 && (
          <div className={`shrink-0 w-32 h-32 rounded-[2rem] border-4 flex items-center justify-center shadow-lg transition-all duration-300 ${isConfident ? 'bg-teal-50 border-teal-200' : 'bg-orange-50 border-orange-200'} ${bounce ? 'animate-success' : ''}`}>
            <span className={`text-7xl font-black ${isConfident ? 'text-teal-500' : 'text-orange-400'}`}>
              {current.letter}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
