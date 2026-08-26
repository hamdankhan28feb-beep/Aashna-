import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { CameraView } from '../Camera/CameraView';
import { setSignMode, setTargetLetter } from '../../store/predictionSlice';
import { getProgress, addXp, updateLetterStats, getNextSRSLetter, UserProgress } from '../../services/progressService';
import { playSuccessSound, playBossWinSound, playErrorSound } from '../../utils/audio';

// The AI Hand Coach now supports every letter!
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""); 

export const QuizView: React.FC = () => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.prediction.text);
  const targetLetter = useSelector((state: RootState) => state.prediction.targetLetter) || 'A';
  const currentHint = useSelector((state: RootState) => state.prediction.currentHint);
  
  const [streak, setStreak] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgressState] = useState<UserProgress>(getProgress());
  const [earnedXp, setEarnedXp] = useState<number | null>(null);
  
  // Boss Fight State
  const [isBossFight, setIsBossFight] = useState(false);
  const [bossTimeLeft, setBossTimeLeft] = useState(30);
  const [bossScore, setBossScore] = useState(0);
  const [bossState, setBossState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  
  const challengeStartTime = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  // Initialize Standard Mode
  useEffect(() => {
    if (!isBossFight) {
      dispatch(setSignMode('phrases'));
      dispatch(setTargetLetter(getNextSRSLetter('')));
      challengeStartTime.current = Date.now();
    }
    return () => {
      dispatch(setTargetLetter(null));
    }
  }, [dispatch, isBossFight]);

  // Boss Fight Timer
  useEffect(() => {
    if (bossState === 'playing' && bossTimeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setBossTimeLeft(t => t - 1);
      }, 1000);
    } else if (bossTimeLeft === 0 && bossState === 'playing') {
      setBossState('lost');
      playErrorSound();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [bossState, bossTimeLeft]);

  const startBossFight = () => {
    setIsBossFight(true);
    setBossState('playing');
    setBossScore(0);
    setBossTimeLeft(30);
    dispatch(setTargetLetter(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]));
  };

  // When a new letter is appended
  useEffect(() => {
    if (text.length > 0) {
      const lastLetter = text[text.length - 1];
      
      if (lastLetter === targetLetter && !showSuccess) {
        setShowSuccess(true);
        playSuccessSound();
        
        if (bossState === 'playing') {
          const newScore = bossScore + 1;
          setBossScore(newScore);
          
          if (newScore >= 5) {
            setBossState('won');
            playBossWinSound();
            const newProgress = addXp(100); // Massive Boss Bonus
            setProgressState(newProgress);
            setEarnedXp(100);
          } else {
            setTimeout(() => {
              setShowSuccess(false);
              dispatch(setTargetLetter(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]));
            }, 1000);
          }
        } else if (!isBossFight) {
          // Standard Mode Logic
          setStreak(s => s + 1);
          const timeTakenMs = Date.now() - challengeStartTime.current;
          updateLetterStats(targetLetter, timeTakenMs);
          
          const xpGained = timeTakenMs < 2000 ? 20 : 10;
          const newProgress = addXp(xpGained);
          setProgressState(newProgress);
          setEarnedXp(xpGained);
          
          setTimeout(() => {
            setShowSuccess(false);
            setEarnedXp(null);
            dispatch(setTargetLetter(getNextSRSLetter(targetLetter)));
            challengeStartTime.current = Date.now();
          }, 1500);
        }
      }
    }
  }, [text, targetLetter, showSuccess, dispatch, isBossFight, bossState, bossScore]);

  const streakProgress = Math.min((streak / 10) * 100, 100);
  const bossProgress = (bossScore / 5) * 100;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Progress Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-violet-100 text-violet-600 font-black px-4 py-2 rounded-xl text-lg flex items-center gap-2">
            ⭐ Lvl {progress.level}
          </div>
          <div className="text-slate-500 font-bold">
            {progress.xp} XP
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-orange-500 font-black text-xl">
            🔥 {progress.dailyStreak} Day Streak
          </div>
          {!isBossFight && (
            <button 
              onClick={startBossFight}
              className="bg-rose-500 text-white font-bold px-4 py-2 rounded-xl shadow-md hover:bg-rose-600 active:scale-95 transition-all flex items-center gap-2"
            >
              ⚔️ Boss Fight
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <div className="w-full lg:w-[40%] flex flex-col gap-6">
          <div className={`bg-white rounded-[3rem] p-8 lg:p-10 border-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center animate-float ${
            isBossFight ? 'border-rose-100 shadow-rose-500/20' : 'border-violet-100 shadow-violet-500/20'
          }`}>
            
            {bossState === 'won' ? (
              <div className="flex flex-col items-center gap-4 my-8">
                <div className="text-8xl animate-bounce">🏆</div>
                <h2 className="text-3xl font-black text-rose-500">BOSS DEFEATED!</h2>
                <div className="bg-rose-100 text-rose-700 font-bold px-6 py-4 rounded-2xl text-xl">
                  +100 XP Massive Bonus!
                </div>
                <button onClick={() => { setIsBossFight(false); setBossState('idle'); setShowSuccess(false); }} className="mt-4 bg-slate-100 text-slate-600 font-bold px-6 py-3 rounded-xl hover:bg-slate-200">
                  Return to Practice
                </button>
              </div>
            ) : bossState === 'lost' ? (
              <div className="flex flex-col items-center gap-4 my-8">
                <div className="text-8xl grayscale">🦉</div>
                <h2 className="text-3xl font-black text-slate-500">Time's Up!</h2>
                <p className="font-bold text-slate-400">You ran out of time.</p>
                <button onClick={() => { setIsBossFight(false); setBossState('idle'); setShowSuccess(false); }} className="mt-4 bg-slate-100 text-slate-600 font-bold px-6 py-3 rounded-xl hover:bg-slate-200">
                  Try Again Later
                </button>
              </div>
            ) : (
              <>
                <div className="w-full flex items-center justify-between mb-8 gap-4">
                  <span className="text-3xl">{isBossFight ? '👹' : '🦉'}</span>
                  <div className="flex-1 bg-slate-100 h-6 rounded-full overflow-hidden border-2 border-slate-200 relative">
                    {isBossFight && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference z-10">
                        {bossTimeLeft}s LEFT
                      </div>
                    )}
                    <div 
                      className={`${isBossFight ? 'bg-rose-400' : 'bg-green-400'} h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end px-2`}
                      style={{ width: `${Math.max(isBossFight ? bossProgress : streakProgress, 5)}%` }}
                    >
                      <div className="w-4 h-2 bg-white/40 rounded-full" />
                    </div>
                  </div>
                  <span className="text-xl font-bold text-slate-400">
                    {isBossFight ? `${bossScore}/5` : `Combo ${streak}`}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-slate-600 mb-2">Can you sign...</h2>
                
                <div className={`text-9xl font-black my-8 transition-all duration-300 ${
                  showSuccess ? 'text-green-500 scale-125 rotate-12' : (isBossFight ? 'text-rose-600' : 'text-violet-600')
                }`}>
                  {targetLetter}
                </div>

                {showSuccess ? (
                  <div className="bg-green-100 border-4 border-green-200 text-green-700 font-bold px-6 py-4 rounded-2xl w-full animate-bounce text-lg flex justify-between items-center">
                    <span>🎉 Perfect!</span>
                    {!isBossFight && <span className="text-xl">+{earnedXp} XP</span>}
                  </div>
                ) : (currentHint && !isBossFight) ? (
                  <div className="bg-orange-50 border-4 border-orange-200 text-orange-700 font-bold px-6 py-4 rounded-2xl w-full animate-pulse text-lg flex flex-col gap-2">
                    <span className="text-sm uppercase tracking-wider text-orange-500">AI Feedback</span>
                    <span>{currentHint}</span>
                  </div>
                ) : (
                  <div className={`${isBossFight ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-violet-50 border-violet-100 text-violet-600'} border-4 font-bold px-6 py-4 rounded-2xl w-full text-lg`}>
                    {isBossFight ? `Quick! ${bossTimeLeft} seconds left!` : 'Show the letter to the camera!'}
                  </div>
                )}
              </>
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
