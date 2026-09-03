import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { CameraView } from '../Camera/CameraView';
import { clearText, setSignMode, setTargetLetter } from '../../store/predictionSlice';
import { playSuccessSound, playBossWinSound, playErrorSound } from '../../utils/audio';
import { getProgress, addXp, UserProgress } from '../../services/progressService';

type Difficulty = 'easy' | 'medium' | 'hard';
type MathOp = '+' | '-' | '×' | '÷';
// Independent game modes: counting (levels 1-2) vs. math challenge (level 3)
type GameMode = 'counting' | 'math';

interface MathEquation {
  a: number;
  b: number;
  op: MathOp;
  answer: number;
}

const ALL_OPERATIONS: MathOp[] = ['+', '-', '×', '÷'];

/**
 * Generate a single math question with difficulty-scaled operands and
 * single-digit answers (the user signs the answer, not the operands —
 * the ML prediction target is a single character, so answers must stay ≤ 9).
 *
 * Division is guaranteed evenly-divisible (dividend = quotient × divisor),
 * so no remainders or decimals ever appear.
 *
 * Number ranges chosen per level:
 *   easy   — operands 1-5,  products/quotients 1-6
 *   medium — operands 2-7,  products/quotients 4-9
 *   hard   — operands 2-9,  products/quotients 4-9 (retry if product > 9)
 */
function generateQuestion(difficulty: Difficulty, allowedOperations: MathOp[]): MathEquation {
  const ops = allowedOperations.length > 0 ? allowedOperations : ALL_OPERATIONS;
  const op = ops[Math.floor(Math.random() * ops.length)];

  switch (op) {
    case '+': {
      // Answer = sum; pick the sum first, then split into two positive addends
      const [lo, hi] = difficulty === 'easy' ? [2, 5] : difficulty === 'medium' ? [3, 7] : [5, 9];
      const answer = Math.floor(Math.random() * (hi - lo + 1)) + lo;
      const a = Math.floor(Math.random() * (answer - 1)) + 1;
      return { a, b: answer - a, op, answer };
    }
    case '-': {
      // a > b always, so answer (a - b) is positive
      const [lo, hi] = difficulty === 'easy' ? [2, 5] : difficulty === 'medium' ? [3, 7] : [5, 9];
      const a = Math.floor(Math.random() * (hi - lo + 1)) + lo;
      const b = Math.floor(Math.random() * (a - 1)) + 1;
      return { a, b, op, answer: a - b };
    }
    case '×': {
      const [alo, ahi, blo, bhi] =
        difficulty === 'easy'   ? [1, 2, 1, 3] :
        difficulty === 'medium' ? [2, 3, 2, 3] :
                                   [2, 4, 2, 3];
      const a = Math.floor(Math.random() * (ahi - alo + 1)) + alo;
      const b = Math.floor(Math.random() * (bhi - blo + 1)) + blo;
      // Guard: retry if product exceeds a single digit (~1/6 of hard combos)
      if (a * b > 9) return generateQuestion(difficulty, ops);
      return { a, b, op, answer: a * b };
    }
    case '÷': {
      // Evenly-divisible by construction: a (dividend) = answer (quotient) × b (divisor)
      const [qlo, qhi, dlo, dhi] =
        difficulty === 'easy'   ? [1, 2, 1, 2] :
        difficulty === 'medium' ? [2, 4, 2, 3] :
                                   [3, 9, 2, 3];
      const answer = Math.floor(Math.random() * (qhi - qlo + 1)) + qlo; // quotient — single digit
      const b = Math.floor(Math.random() * (dhi - dlo + 1)) + dlo;       // divisor
      return { a: answer * b, b, op, answer };                            // a = dividend
    }
  }
}

// Module-level state to persist progress when component unmounts (e.g. switching tabs)
const INITIAL_SAVED_STATE = () => ({
  gameMode: 'counting' as GameMode,
  level: 1,
  targetNumber: 1,
  questionCount: 0,
  missingSequence: [] as number[],
  missingIndex: 0,
  mathEq: { a: 0, b: 0, op: '+' as MathOp, answer: 0 },
  difficulty: 'easy' as Difficulty,
  selectedOps: [...ALL_OPERATIONS] as MathOp[],
});
let savedState = INITIAL_SAVED_STATE();

export const NumbersGameView: React.FC = () => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.prediction.text);
  
  // Game mode — counting and math are independent, user-selectable modes
  const [gameMode, setGameMode] = useState<GameMode>(savedState.gameMode);
  const [level, setLevel] = useState(savedState.level);
  const [targetNumber, setTargetNumber] = useState(savedState.targetNumber);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWrong, setShowWrong] = useState(false);   // Bug 3: wrong-answer feedback
  const [showHint, setShowHint] = useState(false);     // Bug 2: answer hidden by default
  const [questionCount, setQuestionCount] = useState(savedState.questionCount);
  
  // Level 2 state
  const [missingSequence, setMissingSequence] = useState<number[]>(savedState.missingSequence);
  const [missingIndex, setMissingIndex] = useState<number>(savedState.missingIndex);
  
  // Math challenge state (level 3+)
  const [mathEq, setMathEq] = useState(savedState.mathEq);
  const [difficulty, setDifficulty] = useState<Difficulty>(savedState.difficulty);
  const [selectedOps, setSelectedOps] = useState<Set<MathOp>>(new Set(savedState.selectedOps));
  
  // XP state
  const [progress, setProgressState] = useState<UserProgress>(getProgress());
  const [earnedXp, setEarnedXp] = useState<number | null>(null);
  
  // Sync state changes to global savedState
  useEffect(() => {
    savedState.gameMode = gameMode;
    savedState.level = level;
    savedState.targetNumber = targetNumber;
    savedState.questionCount = questionCount;
    savedState.missingSequence = missingSequence;
    savedState.missingIndex = missingIndex;
    savedState.mathEq = mathEq;
    savedState.difficulty = difficulty;
    savedState.selectedOps = Array.from(selectedOps);
  }, [gameMode, level, targetNumber, questionCount, missingSequence, missingIndex, mathEq, difficulty, selectedOps]);

  useEffect(() => {
    dispatch(setSignMode('numbers')); 
    dispatch(clearText());
    setShowHint(false);  // hide hint when level changes
    setShowWrong(false); // clear wrong-answer banner when level changes
    
    // Generate appropriate question whenever level changes
    if (level === 1) {
      dispatch(setTargetLetter(targetNumber.toString()));
    } else if (level === 2) {
      generateSequence();
    } else {
      // Math challenge mode (level 3) — uses user's difficulty + operation selection
      generateMath();
    }
    
    return () => {
      dispatch(setTargetLetter(null));
      // Bug 1 fix: reset persisted state on unmount so next mount starts at level 1
      savedState = INITIAL_SAVED_STATE();
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
    setShowHint(false);   // Bug 2: hide hint for new question
    setShowWrong(false);  // Bug 3: clear error banner for new question
  };

  const generateMath = () => {
    const eq = generateQuestion(difficulty, Array.from(selectedOps));
    setMathEq({ a: eq.a, b: eq.b, op: eq.op, answer: eq.answer });
    setTargetNumber(eq.answer);
    dispatch(setTargetLetter(eq.answer.toString()));
    setShowHint(false);   // Bug 2: hide hint for new question
    setShowWrong(false);  // Bug 3: clear error banner for new question
  };

  // Switch between the two independent game modes — no forced progression.
  // Counting mode runs levels 1-2 (counting → sequence); math mode is level 3.
  // Guarded while a success banner is showing so the pending advance-timeout
  // can't race the mode switch (buttons are disabled during the 1.5s celebration).
  const switchMode = (mode: GameMode) => {
    if (mode === gameMode) return;
    setGameMode(mode);
    setQuestionCount(0);
    setShowHint(false);
    setShowWrong(false);
    dispatch(clearText());
    if (mode === 'counting') {
      setLevel(1);
      setTargetNumber(1);
      // Level change → level effect dispatches setTargetLetter('1')
    } else {
      setLevel(3);
      // Level change → level effect generates the first math question
    }
  };

  // Regenerate math question when user changes difficulty or operation selection (math mode only)
  useEffect(() => {
    if (gameMode === 'math') generateMath();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, selectedOps]);

  useEffect(() => {
    if (text.length > 0) {
      const lastChar = text[text.length - 1];
      if (lastChar === targetNumber.toString() && !showSuccess) {
        setShowSuccess(true);
        setShowWrong(false);
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
              // Counting 1-9 complete → advance to the sequence game (still within counting mode)
              setLevel(2);
              setQuestionCount(0);
              playBossWinSound();
              const bonusProgress = addXp(50); // Level completion bonus
              setProgressState(bonusProgress);
            }
          } else if (gameMode === 'counting') {
            // Sequence game (counting mode, level 2)
            if (questionCount >= 2) {
              // Sequence beat → loop back to counting from 1 (counting mode is replayable)
              setLevel(1);
              setTargetNumber(1);
              setQuestionCount(0);
              playBossWinSound();
              const bonusProgress = addXp(100); // Game beat bonus
              setProgressState(bonusProgress);
            } else {
              setQuestionCount(qc => qc + 1);
              generateSequence();
            }
          } else {
            // Math challenge mode — fully independent of counting
            if (questionCount >= 2) {
              // Round complete → celebrate and start a fresh round (stays in math mode)
              setQuestionCount(0);
              playBossWinSound();
              const bonusProgress = addXp(100); // Round completion bonus
              setProgressState(bonusProgress);
              generateMath();
            } else {
              setQuestionCount(qc => qc + 1);
              generateMath();
            }
          }
        }, 1500);
      } else if (lastChar !== targetNumber.toString() && !showSuccess && !showWrong) {
        // Bug 3 fix: wrong answer detected — show error banner and clear after pause
        setShowWrong(true);
        playErrorSound();
        setTimeout(() => {
          setShowWrong(false);
          dispatch(clearText());
        }, 1500);
      }
    }
  }, [text, targetNumber, showSuccess, showWrong, level, gameMode, questionCount, dispatch]);

  const getLevelTitle = () => {
    if (level === 1) return "Count with me!";
    if (level === 2) return "Fill the Blank Number!";
    const opNames: Record<MathOp, string> = {
      '+': 'Addition',
      '-': 'Subtraction',
      '×': 'Multiplication',
      '÷': 'Division',
    };
    return `${opNames[mathEq.op]} Time!`;
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
            {gameMode === 'counting' ? `Counting · Lvl ${level}` : 'Math Challenge'}
          </div>
        </div>
      </div>

      {/* Game mode selector — counting and math are independent modes, freely switchable */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-slate-500">Game Mode:</span>
        <button
          onClick={() => switchMode('counting')}
          disabled={showSuccess}
          className={`px-5 py-2.5 rounded-full text-sm font-black transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
            gameMode === 'counting'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🔢 Count with Me
        </button>
        <button
          onClick={() => switchMode('math')}
          disabled={showSuccess}
          className={`px-5 py-2.5 rounded-full text-sm font-black transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
            gameMode === 'math'
              ? 'bg-gradient-to-r from-violet-400 to-fuchsia-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ➕ Math Challenge
        </button>
      </div>

      {/* Difficulty + operation settings (math challenge mode only) */}
      {gameMode === 'math' && (
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Math Challenge Settings</span>

        {/* Difficulty */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-500">Difficulty:</span>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-4 py-2 rounded-full text-sm font-black transition-all duration-200 ${
                difficulty === d
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        {/* Operation selection */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-500">Practice:</span>
          <button
            onClick={() => setSelectedOps(new Set(ALL_OPERATIONS))}
            className={`px-4 py-2 rounded-full text-sm font-black transition-all duration-200 ${
              selectedOps.size === ALL_OPERATIONS.length
                ? 'bg-violet-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {ALL_OPERATIONS.map(op => {
            const isActive = selectedOps.has(op);
            const label = op === '+' ? 'Addition' : op === '-' ? 'Subtraction' : op === '×' ? 'Multiplication' : 'Division';
            return (
              <button
                key={op}
                onClick={() => {
                  const next = new Set(selectedOps);
                  if (isActive) {
                    if (next.size > 1) next.delete(op); // always keep at least one selected
                  } else {
                    next.add(op);
                  }
                  setSelectedOps(next);
                }}
                className={`px-4 py-2 rounded-full text-sm font-black transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      )}

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

            {/* Bug 2 fix: Hint button — hidden by default, toggles on click, resets on new question */}
            {level > 1 && !showSuccess && (
              <div className="flex flex-col items-center gap-2 mb-4 w-full">
                <button
                  onClick={() => setShowHint(h => !h)}
                  className="px-5 py-2 rounded-full bg-amber-50 border-2 border-amber-200 text-amber-600 font-bold text-sm hover:bg-amber-100 hover:border-amber-300 transition-all duration-200 active:scale-95"
                >
                  {showHint ? '🙈 Hide Hint' : '💡 Show Hint'}
                </button>
                {showHint && (
                  <div className="bg-amber-50 border-4 border-amber-200 text-amber-700 font-black px-6 py-3 rounded-2xl text-2xl">
                    Answer: {targetNumber}
                  </div>
                )}
              </div>
            )}

            {showSuccess ? (
              <div className="bg-green-100 border-4 border-green-200 text-green-700 font-bold px-6 py-4 rounded-2xl w-full animate-bounce text-lg flex justify-between items-center">
                <span>🎉 Perfect!</span>
                {earnedXp && <span className="text-xl">+{earnedXp} XP</span>}
              </div>
            ) : showWrong ? (
              /* Wrong-answer banner — mirrors success banner styling in rose/red */
              <div className="bg-rose-100 border-4 border-rose-200 text-rose-700 font-bold px-6 py-4 rounded-2xl w-full animate-bounce text-lg flex justify-between items-center">
                <span>❌ Incorrect! Try again.</span>
              </div>
            ) : null}
            
          </div>
        </div>
        
        <div className="w-full lg:w-[60%]">
          <CameraView />
        </div>
      </div>
    </div>
  );
};
