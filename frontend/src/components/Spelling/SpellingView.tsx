import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { CameraView } from '../Camera/CameraView';
import { setSignMode, setTargetLetter } from '../../store/predictionSlice';
import { addXp, UserProgress, getProgress } from '../../services/progressService';
import { playSuccessSound, playBossWinSound } from '../../utils/audio';

const WORDS = [
  "CAT", "DOG", "SUN", "HELLO", "GOOD", "YES", "NO", "MILK", "WATER", "MOM", "DAD", "LOVE"
];

export const SpellingView: React.FC = () => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.prediction.text);
  
  const [targetWord, setTargetWord] = useState(WORDS[0]);
  const [currentLetterIdx, setCurrentLetterIdx] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgressState] = useState<UserProgress>(getProgress());
  
  const previousTextLength = useRef(text.length);

  // Initialize
  useEffect(() => {
    dispatch(setSignMode('phrases'));
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(randomWord);
    setCurrentLetterIdx(0);
    dispatch(setTargetLetter(randomWord[0]));
    
    return () => {
      dispatch(setTargetLetter(null));
    }
  }, [dispatch]);

  // When a new letter is appended
  useEffect(() => {
    if (text.length > previousTextLength.current) {
      const lastLetter = text[text.length - 1];
      const targetLetter = targetWord[currentLetterIdx];
      
      if (lastLetter === targetLetter && !showSuccess) {
        playSuccessSound();
        
        if (currentLetterIdx === targetWord.length - 1) {
          // Word Complete!
          setShowSuccess(true);
          playBossWinSound();
          setProgressState(addXp(50)); // Big XP for spelling a word
          
          setTimeout(() => {
            setShowSuccess(false);
            const nextWord = WORDS[Math.floor(Math.random() * WORDS.length)];
            setTargetWord(nextWord);
            setCurrentLetterIdx(0);
            dispatch(setTargetLetter(nextWord[0]));
          }, 2000);
        } else {
          // Next Letter
          const nextIdx = currentLetterIdx + 1;
          setCurrentLetterIdx(nextIdx);
          dispatch(setTargetLetter(targetWord[nextIdx]));
        }
      }
    }
    previousTextLength.current = text.length;
  }, [text, currentLetterIdx, targetWord, showSuccess, dispatch]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="bg-fuchsia-100 text-fuchsia-600 font-black px-4 py-2 rounded-xl text-lg flex items-center gap-2">
          🐝 Spelling Bee
        </div>
        <div className="text-slate-500 font-bold">
          {progress.xp} XP
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <div className="w-full lg:w-[40%] flex flex-col gap-6">
          <div className="bg-white rounded-[3rem] p-8 lg:p-10 border-8 border-fuchsia-100 shadow-[0_20px_50px_-12px_rgba(217,70,239,0.2)] relative overflow-hidden flex flex-col items-center text-center animate-float">
            
            <h2 className="text-2xl font-black text-slate-600 mb-8">Can you spell...</h2>
            
            <div className="flex justify-center gap-2 mb-12 flex-wrap">
              {targetWord.split('').map((letter, idx) => (
                <div 
                  key={idx}
                  className={`w-16 h-20 md:w-20 md:h-24 rounded-2xl flex items-center justify-center text-5xl md:text-6xl font-black transition-all duration-300 ${
                    idx < currentLetterIdx 
                      ? 'bg-green-500 text-white shadow-lg transform -translate-y-2' 
                      : idx === currentLetterIdx
                        ? 'bg-fuchsia-100 text-fuchsia-600 border-4 border-fuchsia-300 transform scale-110'
                        : 'bg-slate-50 text-slate-300 border-4 border-slate-100'
                  }`}
                >
                  {letter}
                </div>
              ))}
            </div>

            {showSuccess ? (
              <div className="bg-green-100 border-4 border-green-200 text-green-700 font-bold px-6 py-4 rounded-2xl w-full animate-bounce text-lg flex justify-between items-center">
                <span>🎉 Perfect Spelling!</span>
                <span className="text-xl">+50 XP</span>
              </div>
            ) : (
              <div className="bg-fuchsia-50 border-4 border-fuchsia-100 text-fuchsia-600 font-bold px-6 py-4 rounded-2xl w-full text-lg">
                Sign the letter <span className="font-black text-2xl mx-1">{targetWord[currentLetterIdx]}</span>
              </div>
            )}

          </div>
        </div>
        
        <div className="w-full lg:w-[60%]">
          <CameraView />
        </div>
      </div>
    </div>
  );
};
