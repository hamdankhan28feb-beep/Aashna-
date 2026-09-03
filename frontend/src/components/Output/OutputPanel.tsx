import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sparkles } from 'lucide-react';
import { RootState } from '../../store';
import { commitWord } from '../../store/predictionSlice';
import { getSuggestions } from '../../services/spellAssistService';
import { getProgress } from '../../services/progressService';
import { playSuccessSound } from '../../utils/audio';

export const OutputPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { current, text } = useSelector((state: RootState) => state.prediction);
  const [bounce, setBounce] = useState(false);

  // Spell Assist: suggest completions for the partial word being signed
  // (the letters after the last space) once it has at least 2 letters.
  // Ranked offline by word frequency + the user's own letter practice stats.
  const suggestions = useMemo(() => {
    const partial = text.slice(text.lastIndexOf(' ') + 1);
    if (partial.length < 2) return [];
    return getSuggestions(partial, getProgress().letterStats);
  }, [text]);

  const handleCommitWord = (word: string) => {
    dispatch(commitWord(word.toUpperCase()));
    playSuccessSound();
  };

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
    <div className="relative w-full animate-float" style={{ animationDelay: '0.2s' }}>
      {/* Background Glows matching CameraView */}
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-300/30 rounded-full blur-2xl -z-10"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl -z-10"></div>

      <div data-tour="output-panel" className="w-full bg-white rounded-[2.5rem] border-4 lg:border-8 border-teal-100 shadow-[0_20px_50px_-12px_rgba(20,184,166,0.2)] overflow-hidden flex flex-col relative transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_20px_50px_-12px_rgba(20,184,166,0.3)]">
        <div className="p-5 border-b border-teal-50 bg-slate-50/50 flex justify-between items-center">
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
          <div className="flex-1 min-w-0">
            <p className="text-4xl md:text-6xl font-bold text-slate-700 break-words whitespace-normal leading-tight tracking-tight max-w-full">
              {text || <span className="text-slate-300 font-medium">Start signing...</span>}
              <span className="inline-block w-1.5 h-12 md:h-16 bg-teal-400 ml-2 animate-pulse align-middle rounded-full opacity-80"></span>
            </p>

            {suggestions.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-[0.65rem] font-black text-teal-400 uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" /> Spell Assist
                </span>
                {suggestions.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => handleCommitWord(word)}
                    aria-label={`Use the word ${word.toUpperCase()}`}
                    className="px-4 py-2 rounded-full bg-teal-50 border-2 border-teal-100 text-teal-700 font-black text-sm tracking-wide hover:bg-teal-500 hover:border-teal-500 hover:text-white active:scale-95 transition-all duration-200"
                  >
                    {word.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {current && current.confidence > 0.5 && (
            <div className={`shrink-0 w-32 h-32 rounded-[2rem] border-4 flex items-center justify-center shadow-lg transition-all duration-300 ${isConfident ? 'bg-teal-50 border-teal-200' : 'bg-orange-50 border-orange-200'} ${bounce ? 'animate-success' : ''}`}>
              <span className={`text-7xl font-black whitespace-nowrap ${isConfident ? 'text-teal-500' : 'text-orange-400'}`}>
                {current.letter}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
