export const playSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Create oscillator for the main "ding"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    // Start at C5
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    // Quickly slide up to C6 for a happy "ding"
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1);
    
    // Volume envelope
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio error:", e);
  }
};

export const playBossWinSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play a major arpeggio (C, E, G, C)
    const playNote = (freq: number, startTime: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    };

    const now = ctx.currentTime;
    playNote(523.25, now);         // C5
    playNote(659.25, now + 0.1);   // E5
    playNote(783.99, now + 0.2);   // G5
    playNote(1046.50, now + 0.3);  // C6
  } catch (e) {
    console.error("Audio error:", e);
  }
};

// Text-to-speech via the Web Speech API — the same pipeline ControlsBar's
// Speak button uses, wrapped for reuse. Cancels any ongoing speech first so
// consecutive bot replies don't queue up and play out of sync.
export const speakText = (text: string) => {
  try {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("Speech error:", e);
  }
};

// Stop any in-progress speech (e.g. when muting the bot's voice).
export const stopSpeaking = () => {
  try {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  } catch (e) {
    console.error("Speech error:", e);
  }
};

export const playErrorSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    // Low, sad buzz
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio error:", e);
  }
};
