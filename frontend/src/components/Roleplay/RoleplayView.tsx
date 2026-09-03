import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { CameraView } from '../Camera/CameraView';
import { ControlsBar } from '../Controls/ControlsBar';
import { clearText, setSignMode } from '../../store/predictionSlice';
import { addXp, UserProgress, getProgress } from '../../services/progressService';
import { playSuccessSound, speakText, stopSpeaking } from '../../utils/audio';
import { sendChatMessage, type ChatMessage } from '../../services/chatService';

// Free-form conversation with the AI chatbot. The user signs a message with
// the camera (recognized letters accumulate in state.prediction.text), presses
// Send, and the message is posted to /api/chat on our backend — the only place
// the Gemini API key lives. Bot replies appear in the log and are spoken
// aloud through the shared TTS pipeline (toggleable).
const GREETING = "Hi there! I'm your chat buddy. Sign a message with the camera and press Send to start our conversation!";

export const RoleplayView: React.FC = () => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.prediction.text);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [progress, setProgressState] = useState<UserProgress>(getProgress());
  const [isTyping, setIsTyping] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speakReplies, setSpeakReplies] = useState(true);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const speakRepliesRef = useRef(speakReplies);
  
  useEffect(() => {
    speakRepliesRef.current = speakReplies;
  }, [speakReplies]);
  
  // Initialize Conversation
  useEffect(() => {
    // 'phrases' mode gives the camera the full A–Z + 0–9 recognition range
    dispatch(setSignMode('phrases'));
    dispatch(clearText());
    
    // Initial bot greeting delay
    const timer = setTimeout(() => {
      setMessages([{ sender: 'bot', text: GREETING }]);
      if (speakRepliesRef.current) speakText(GREETING);
      setIsTyping(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [dispatch]);
  
  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  const handleSend = async () => {
    const message = text.trim();
    if (!message || isTyping) return;
    
    // Snapshot the conversation so far — the backend appends this new
    // message itself, so the history must not include it.
    const history = messages;
    
    // Move the signed text into the chat log and reset the composer
    dispatch(clearText());
    setMessages(prev => [...prev, { sender: 'user', text: message }]);
    setProgressState(addXp(100)); // reward practice effort per signed message
    playSuccessSound();
    setIsTyping(true);
    setError(null);
    
    try {
      const reply = await sendChatMessage(message, history);
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
      if (speakRepliesRef.current) speakText(reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong — please try again.');
    } finally {
      setIsTyping(false);
    }
  };
  
  const toggleSpeak = () => {
    const next = !speakReplies;
    if (!next) stopSpeaking(); // muting also stops any reply mid-speech
    setSpeakReplies(next);
  };
  
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
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-slate-700">Aashna Bot</h3>
              <p className="text-sm font-bold text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Online
              </p>
            </div>
            <button
              onClick={toggleSpeak}
              title={speakReplies ? 'Mute bot voice' : 'Speak bot replies out loud'}
              className="w-11 h-11 shrink-0 bg-white hover:bg-blue-100 border-2 border-blue-100 rounded-2xl text-xl transition-all active:scale-95"
            >
              {speakReplies ? '🔊' : '🔇'}
            </button>
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
            
            {isTyping && (
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

          {/* Composer: live view of what the camera has recognized + Send */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t-2 border-slate-100 shrink-0">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
              You're signing:
            </div>
            <div className="flex items-stretch gap-3">
              <div className="flex-1 min-h-[3.25rem] max-h-24 overflow-y-auto bg-white border-2 border-slate-200 rounded-2xl px-4 py-2 font-bold text-slate-700 flex items-center break-words">
                {text || <span className="text-slate-300 font-medium">Start signing...</span>}
              </div>
              <button
                onClick={handleSend}
                disabled={!text.trim() || isTyping}
                className="shrink-0 px-5 sm:px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 disabled:shadow-none disabled:translate-y-0 flex items-center gap-2"
              >
                Send <span className="text-xl">📤</span>
              </button>
            </div>
            {error && <p className="mt-2 text-sm font-bold text-rose-500">{error}</p>}
          </div>
        </div>
        
        {/* Camera UI + the same text-editing controls as Practice mode */}
        <div className="w-full lg:w-[60%] flex flex-col gap-6 min-h-0">
          <CameraView />
          <ControlsBar />
        </div>
      </div>
    </div>
  );
};
