import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { CameraView } from '../Camera/CameraView';
import { clearText, setSignMode, setTargetLetter } from '../../store/predictionSlice';
import { playSuccessSound, playBossWinSound } from '../../utils/audio';
import { getProgress, addXp, UserProgress } from '../../services/progressService';

// Module-level state to persist progress when component unmounts (e.g. switching tabs)
let savedState = {
  level: 1,
  targetNumber: 1,
  questionCount: 0,
  missingSequence: [] as number[],
  missingIndex: 0,
  mathEq: { a: 0, b: 0, op: '+' as '+' | '-' }
};

export const NumbersGameView: React.FC = () => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.prediction.text);
  
  const [level, setLevel] = useState(savedState.level);
  const [targetNumber, setTargetNumber] = useState(savedState.targetNumber);
  const [showSuccess, setShowSuccess] = useState(false);
  const [questionCount, setQuestionCount] = useState(savedState.questionCount);
  
  // Level 2 state
  const [missingSequence, setMissingSequence] = useState<number[]>(savedState.missingSequence);
  const [missingIndex, setMissingIndex] = useState<number>(savedState.missingIndex);
  
  // Level 3 & 4 state
  const [mathEq, setMathEq] = useState(savedState.mathEq);
  
  // XP state
  const [progress, setProgressState] = useState<UserProgress>(getProgress());
  const [earnedXp, setEarnedXp] = useState<number | null>(null);
  
  // Sync state changes to global savedState
  useEffect(() => {
    savedState.level = level;
    savedState.targetNumber = targetNumber;
    savedState.questionCount = questionCount;
    savedState.missingSequence = missingSequence;
    savedState.missingIndex = missingIndex;
    savedState.mathEq = mathEq;
  }, [level, targetNumber, questionCount, missingSequence, missingIndex, mathEq]);

  useEffect(() => {
    dispatch(setSignMode('numbers')); 
    dispatch(clearText());
    
    // Only generate new sequence/math if we haven't already generated one for this level
    if (level === 1) {
      dispatch(setTargetLetter(targetNumber.toString()));
    } else if (level === 2 && missingSequence.length === 0) {
      generateSequence();
    } else if (level === 3 && mathEq.a === 0) {
      generateMath('+');
    } else if (level === 4 && mathEq.a === 0) {
      generateMath('-');
    } else {
       // Restore target letter for current state
       dispatch(setTargetLetter(targetNumber.toString()));
    }
    
    return () => {
      dispatch(setTargetLetter(null));
    }
  }, [level]); // We only want this to run when LEVEL changes initially or component mounts.

  const generateSequence = () => {
    const start = Math.floor(Math.random() * 5) + 1; // 1 to 5
    const seq = [start, start+1, start+2, start+3];
    const hiddenIdx = Math.floor(Math.random() * 4);
    setMissingSequence(seq);
    setMissingIndex(hiddenIdx);
    setTargetNumber(seq[hiddenIdx]);
    dispatch(setTargetLetter(seq[hiddenIdx].toString()));
  };

  const generateMath = (op: '+' | '-') => {
    let a, b, ans;
    if (op === '+') {
      ans = Math.floor(Math.random() * 8) + 2; // answer between 2 and 9
      a = Math.floor(Math.random() * (ans - 1)) + 1;
      b = ans - a;
    } else {
      a = Math.floor(Math.random() * 8) + 2; // a between 2 and 9
      b = Math.floor(Math.random() * (a - 1)) + 1; // b between 1 and a-1
      ans = a - b;
    }
    setMathEq({ a, b, op });
    setTargetNumber(ans);
    dispatch(setTargetLetter(ans.toString()));
  };

  useEffect(() => {
    if (text.length > 0) {
      const lastChar = text[text.length - 1];
      if (lastChar === targetNumber.toString() && !showSuccess) {
        setShowSuccess(true);
        playSuccessSound();
        
        // Grant XP for correct answer
        const xpGained = level === 1 ? 5 : 15; // More XP for math/sequences
        const newProgress = addXp(xpGained);
        setProgressState(newProgress);
        setEarnedXp(xpGained);
        
        setTimeout(() => {
          setShowSuccess(false);
          setEarnedXp(null);
          dispatch(clearText());
          if (level === 1) {
            if (targetNumber < 9) {
              setTargetNumber(targetNumber + 1);
              dispatch(setTargetLetter((targetNumber + 1).toString()));
            } else {
              setLevel(2);
              setQuestionCount(0);
              playBossWinSound();
              const bonusProgress = addXp(50); // Level completion bonus
              setProgressState(bonusProgress);
            }
          } else {
            // Logic for Levels 2, 3, 4
            if (questionCount >= 2) {
              if (level < 4) {
                setLevel(level + 1);
                setQuestionCount(0);
                playBossWinSound();
                const bonusProgress = addXp(50); // Level completion bonus
                setProgressState(bonusProgress);
              } else {
                // Game beat! Loop back or stay.
                setLevel(1);
                setTargetNumber(1);
                setQuestionCount(0);
                playBossWinSound();
                const bonusProgress = addXp(100); // Game beat bonus
                setProgressState(bonusProgress);
              }
            } else {
              setQuestionCount(qc => qc + 1);
              if (level === 2) generateSequence();
              else if (level === 3) generateMath('+');
              else if (level === 4) generateMath('-');
            }
          }
        }, 1500);
      }
    }
  }, [text, targetNumber, showSuccess, level, questionCount, dispatch]);

  const getLevelTitle = () => {
    if (level === 1) return "Count with me!";
    if (level === 2) return "Fill the Blank Number!";
    if (level === 3) return "Addition Time!";
    return "Subtraction Time!";
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Bar with XP and Stats */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-100 text-cyan-600 font-black px-4 py-2 rounded-xl text-lg flex items-center gap-2">
            ⭐ Lvl {progress.level}
          </div>
          <div className="text-slate-500 font-bold flex items-center gap-2">
            {progress.xp} XP
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-orange-500 font-black text-xl">
            🔥 {progress.dailyStreak} Day Streak
          </div>
          <div className="bg-cyan-50 text-cyan-600 font-black px-4 py-2 rounded-xl shadow-inner border-2 border-cyan-100">
            Game Level {level}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <div className="w-full lg:w-[40%] flex flex-col gap-6">
          <div className="bg-white rounded-[3rem] p-8 lg:p-10 border-8 border-cyan-100 shadow-2xl shadow-cyan-500/20 relative overflow-hidden flex flex-col items-center text-center animate-float">
            
            <div className="w-full flex items-center justify-center mb-8 gap-4">
              <span className="text-4xl">🦉</span>
              <h2 className="text-2xl font-black text-slate-600">
                {getLevelTitle()}
              </h2>
            </div>
            
            {level === 1 ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-8 relative w-full h-12">
                  <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-300 -translate-y-1/2 rounded-full" />
                  <div className="relative z-10 flex w-full justify-between px-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <div 
                        key={num} 
                        className={`w-8 h-8 rounded-full shadow-[inset_0_-4px_4px_rgba(0,0,0,0.15)] border-2 transition-all duration-500 ${
                          num < targetNumber 
                            ? 'bg-yellow-400 border-yellow-500' 
                            : num === targetNumber && showSuccess 
                              ? 'bg-green-400 border-green-500 scale-110' 
                              : num === targetNumber 
                                ? 'bg-yellow-400 border-yellow-500 animate-pulse'
                                : 'bg-slate-100 border-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className={`text-[10rem] leading-none font-black my-4 transition-all duration-300 ${showSuccess ? 'text-green-500 scale-125 rotate-12' : 'text-cyan-500'}`}>
                  {targetNumber}
                </div>
              </>
            ) : level === 2 ? (
              <>
                <div className="flex items-center justify-center gap-4 mb-8 bg-slate-50 p-6 rounded-3xl border-4 border-slate-100 w-full">
                  {missingSequence.map((num, idx) => (
                    <div key={idx} className="flex-1 flex items-center justify-center aspect-square rounded-2xl bg-white shadow-md border-2 border-slate-200 text-3xl font-black text-slate-600 transition-all duration-300">
                      {idx === missingIndex ? (showSuccess ? <span className="text-green-500 scale-125 inline-block">{num}</span> : <span className="text-rose-400 animate-bounce inline-block">?</span>) : num}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-6 mb-8 bg-slate-50 p-6 rounded-3xl border-4 border-slate-100 w-full text-5xl font-black text-slate-600">
                  <span>{mathEq.a}</span>
                  <span className="text-cyan-400">{mathEq.op}</span>
                  <span>{mathEq.b}</span>
                  <span className="text-cyan-400">=</span>
                  <div className="w-20 h-20 flex items-center justify-center bg-white rounded-2xl shadow-inner border-4 border-slate-200">
                    {showSuccess ? <span className="text-green-500 scale-125 transition-transform">{targetNumber}</span> : <span className="text-rose-400 animate-pulse">?</span>}
                  </div>
                </div>
              </>
            )}

            {level > 1 && (
                <div className="flex justify-center gap-3 mb-8 w-full">
                   {[1, 2, 3, 4].map((_, i) => (
                      <div key={i} className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-white/50 ${
                        i === 0 ? 'bg-green-500' : i === 1 ? 'bg-rose-500' : i === 2 ? 'bg-purple-500 scale-110' : 'bg-blue-500'
                      }`}>
                         {i === 2 ? targetNumber : (targetNumber + i + 1) % 9 + 1}
                      </div>
                   ))}
                </div>
            )}

            {showSuccess ? (
              <div className="bg-green-100 border-4 border-green-200 text-green-700 font-bold px-6 py-4 rounded-2xl w-full animate-bounce text-lg flex justify-between items-center">
                <span>🎉 Perfect!</span>
                {earnedXp && <span className="text-xl">+{earnedXp} XP</span>}
              </div>
            ) : (
              <div className="bg-cyan-50 border-4 border-cyan-100 text-cyan-600 font-bold px-6 py-4 rounded-2xl w-full text-lg">
                Sign '{targetNumber}' to the camera!
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
