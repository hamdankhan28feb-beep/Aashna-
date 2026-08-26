import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { CameraView } from '../Camera/CameraView';
import { setSignMode, setTargetLetter } from '../../store/predictionSlice';
import { addXp, UserProgress, getProgress } from '../../services/progressService';
import { playSuccessSound, playBossWinSound } from '../../utils/audio';

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

const SCRIPT = [
  { bot: "Hi there! Are you ready to practice?", targetWord: "YES" },
  { bot: "Awesome. Let's practice some animals. What barks?", targetWord: "DOG" },
  { bot: "Correct! And what meows?", targetWord: "CAT" },
  { bot: "You're doing great. How are you feeling today?", targetWord: "GOOD" },
  { bot: "That's wonderful! Have a great day!", targetWord: "BYE" }
];

export const RoleplayView: React.FC = () => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.prediction.text);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [scriptIdx, setScriptIdx] = useState(0);
  const [currentLetterIdx, setCurrentLetterIdx] = useState(0);
  const [progress, setProgressState] = useState<UserProgress>(getProgress());
  const [isTyping, setIsTyping] = useState(true);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const previousTextLength = useRef(text.length);

  // Initialize Conversation
  useEffect(() => {
    dispatch(setSignMode('phrases'));
    
    // Initial bot message delay
    const timer = setTimeout(() => {
      setMessages([{ sender: 'bot', text: SCRIPT[0].bot }]);
      setIsTyping(false);
      dispatch(setTargetLetter(SCRIPT[0].targetWord[0]));
    }, 1500);
    
    return () => {
      clearTimeout(timer);
      dispatch(setTargetLetter(null));
    }
  }, [dispatch]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // When a new letter is appended
  useEffect(() => {
    if (isTyping || scriptIdx >= SCRIPT.length) return;
    
    if (text.length > previousTextLength.current) {
      const lastLetter = text[text.length - 1];
      const targetWord = SCRIPT[scriptIdx].targetWord;
      const targetLetter = targetWord[currentLetterIdx];
      
      if (lastLetter === targetLetter) {
        playSuccessSound();
        
        if (currentLetterIdx === targetWord.length - 1) {
          // Word Complete! Add user message
          setMessages(prev => [...prev, { sender: 'user', text: targetWord }]);
          playBossWinSound();
          setProgressState(addXp(100));
          setIsTyping(true);
          
          const nextIdx = scriptIdx + 1;
          
          if (nextIdx < SCRIPT.length) {
            // Bot replies after a delay
            setTimeout(() => {
              setMessages(prev => [...prev, { sender: 'bot', text: SCRIPT[nextIdx].bot }]);
              setScriptIdx(nextIdx);
              setCurrentLetterIdx(0);
              dispatch(setTargetLetter(SCRIPT[nextIdx].targetWord[0]));
              setIsTyping(false);
            }, 2000);
          } else {
            setScriptIdx(nextIdx); // End of script
            setIsTyping(false);
          }
        } else {
          // Next Letter
          const nextIdx = currentLetterIdx + 1;
          setCurrentLetterIdx(nextIdx);
          dispatch(setTargetLetter(targetWord[nextIdx]));
        }
      }
    }
    previousTextLength.current = text.length;
  }, [text, currentLetterIdx, scriptIdx, isTyping, dispatch]);

  const currentTargetWord = scriptIdx < SCRIPT.length ? SCRIPT[scriptIdx].targetWord : null;

  return (
    <div className="flex flex-col gap-6 w-full h-[85vh]">
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between shrink-0">
        <div className="bg-blue-100 text-blue-600 font-black px-4 py-2 rounded-xl text-lg flex items-center gap-2">
          💬 Roleplay Mode
        </div>
        <div className="text-slate-500 font-bold">
          {progress.xp} XP
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full h-full min-h-0">
        {/* Chat UI */}
        <div className="w-full lg:w-[40%] flex flex-col bg-white rounded-[3rem] border-8 border-blue-100 shadow-[0_20px_50px_-12px_rgba(59,130,246,0.2)] overflow-hidden">
          
          <div className="bg-blue-50 p-6 border-b-2 border-blue-100 flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">🦉</div>
            <div>
              <h3 className="font-black text-slate-700">Aashna Bot</h3>
              <p className="text-sm font-bold text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Online
              </p>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl font-bold ${
                  msg.sender === 'user' 
                    ? 'bg-blue-500 text-white rounded-tr-sm' 
                    : 'bg-slate-100 text-slate-700 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && scriptIdx < SCRIPT.length && (
              <div className="flex w-full justify-start">
                <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {currentTargetWord && !isTyping && (
            <div className="p-6 bg-slate-50 border-t-2 border-slate-100 shrink-0">
              <div className="text-sm font-black text-slate-400 uppercase tracking-wider mb-2">Your turn to reply:</div>
              <div className="flex gap-1 flex-wrap">
                {currentTargetWord.split('').map((letter, idx) => (
                  <div 
                    key={idx}
                    className={`w-10 h-12 rounded-xl flex items-center justify-center text-xl font-black transition-all ${
                      idx < currentLetterIdx 
                        ? 'bg-blue-500 text-white' 
                        : idx === currentLetterIdx
                          ? 'bg-blue-100 text-blue-600 border-2 border-blue-300 transform scale-110'
                          : 'bg-white text-slate-300 border-2 border-slate-200'
                    }`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {scriptIdx >= SCRIPT.length && (
            <div className="p-6 bg-green-50 border-t-2 border-green-100 shrink-0 text-center text-green-700 font-bold">
              Conversation Complete! +500 XP
            </div>
          )}

        </div>
        
        {/* Camera UI */}
        <div className="w-full lg:w-[60%] h-full">
          <CameraView />
        </div>
      </div>
    </div>
  );
};
