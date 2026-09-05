import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Hands, Results, HAND_CONNECTIONS } from '@mediapipe/hands';
import * as tf from '@tensorflow/tfjs';
import { setPrediction, appendLetter, setCurrentHint } from '../../store/predictionSlice';
import { predictFrame } from '../../services/modelService';
import { predictLandmarks } from '../../services/landmarkModelService';
import { RootState } from '../../store';
import { generateHandFeedback } from '../../utils/landmarkHeuristics';

// Smoothed-candidate tracking refs live outside the component so they survive
// re-renders without triggering them (they're never in JSX).

export const CameraView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  
  // Commit a sign once the smoothed prediction has been stable for this duration.
  // 400 ms ≈ 12 frames at 30 fps — fast enough to feel instant, long enough to
  // absorb brief jitter between adjacent classes.
  const STABILITY_MS = 400;
  // Minimum raw per-frame confidence to count a frame as a "valid" observation
  // in the temporal buffer.  The smoothed (confidence-weighted) vote across
  // the buffer is what actually gates a commit, so this floor is deliberately
  // permissive — it lets slightly rotated or imperfect frames contribute.
  const CONFIDENCE_THRESHOLD = 0.55;

  const lastLetterRef             = useRef<string | null>(null);
  const candidateLetterRef        = useRef<string | null>(null);
  const candidateStartTimeRef     = useRef<number | null>(null);
  const lastHintTimeRef           = useRef<number>(0);
  // Rolling buffer of the last N per-frame predictions used for confidence-
  // weighted majority voting.  Provides temporal smoothing so that a single
  // shaky frame cannot break an otherwise stable streak.
  const predictionBufferRef = useRef<Array<{ letter: string; confidence: number }>>([]);
  
  const currentMode       = useSelector((state: RootState) => state.prediction.signMode);
  const useLandmarkModel  = useSelector((state: RootState) => state.prediction.useLandmarkModel);
  const targetLetter      = useSelector((state: RootState) => state.prediction.targetLetter);
  const modeRef           = useRef(currentMode);
  const useLandmarkRef    = useRef(useLandmarkModel);
  const targetLetterRef   = useRef(targetLetter);
  
  useEffect(() => {
    modeRef.current = currentMode;
    lastLetterRef.current             = null;
    candidateLetterRef.current        = null;
    candidateStartTimeRef.current     = null;
    predictionBufferRef.current       = [];
    if (currentMode === 'phrases') {
      dispatch(setPrediction({ letter: '', confidence: 0, timestamp: Date.now() }));
    }
  }, [currentMode, dispatch]);

  useEffect(() => {
    useLandmarkRef.current = useLandmarkModel;
  }, [useLandmarkModel]);

  useEffect(() => {
    targetLetterRef.current = targetLetter;
  }, [targetLetter]);

  useEffect(() => {
    let hands: Hands | null = null;
    let isActive = true;
    let requestRef: number;
    let isProcessing = false;

    // In-memory canvas for lightweight preprocessing before MediaPipe
    const preprocessCanvas = document.createElement('canvas');
    preprocessCanvas.width = 640;
    preprocessCanvas.height = 480;
    // willReadFrequently is crucial for performance when using getImageData constantly
    const preCtx = preprocessCanvas.getContext('2d', { willReadFrequently: true });

    const setupMediaPipe = async () => {
      hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.4,   // lower → faster first-hand pickup
        minTrackingConfidence: 0.5     // keep at 0.5 for stable landmark quality
      });

      hands.onResults(onResults);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user', frameRate: { ideal: 60 } }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsReady(true);
            
            const processFrame = async () => {
              if (!isActive || !videoRef.current || !preCtx) return;
              
              if (!isProcessing) {
                isProcessing = true;
                
                preCtx.drawImage(videoRef.current, 0, 0, 640, 480);
                
                const imageData = preCtx.getImageData(0, 0, 640, 480);
                const data = imageData.data;
                
                // Sample every 64 bytes (16 pixels × 4 channels) — 4× fewer
                // iterations than the old step-16 loop; plenty for an average.
                let totalLuminance = 0;
                let count = 0;
                for (let i = 0; i < data.length; i += 64) {
                  totalLuminance += (data[i] + data[i+1] + data[i+2]) / 3;
                  count++;
                }
                const avgLuminance = totalLuminance / count;
                
                const LUMINANCE_THRESHOLD = 100;
                if (avgLuminance < LUMINANCE_THRESHOLD) {
                  const gamma = 1.0 + (1.0 - (avgLuminance / LUMINANCE_THRESHOLD)); 
                  const gammaCorrection = 1 / gamma;
                  
                  const lut = new Uint8Array(256);
                  for (let i = 0; i < 256; i++) {
                    lut[i] = Math.min(255, Math.pow(i / 255, gammaCorrection) * 255);
                  }
                  
                  for (let i = 0; i < data.length; i += 4) {
                    data[i]     = lut[data[i]];     
                    data[i + 1] = lut[data[i + 1]]; 
                    data[i + 2] = lut[data[i + 2]]; 
                  }
                  preCtx.putImageData(imageData, 0, 0);
                }
                
                await hands?.send({ image: preprocessCanvas });
                isProcessing = false;
              }
              
              if (isActive) {
                requestRef = requestAnimationFrame(processFrame);
              }
            };
            
            processFrame();
          };
        }
      } catch (e) {
        console.error("Camera error:", e);
      }
    };

    setupMediaPipe();

    return () => {
      isActive = false;
      if (requestRef) cancelAnimationFrame(requestRef);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      hands?.close();
    };
  }, []);

  const onResults = async (results: Results) => {
    if (!canvasRef.current || !videoRef.current || !hiddenCanvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    const hiddenCtx = hiddenCanvasRef.current.getContext('2d');
    if (!canvasCtx || !hiddenCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.translate(canvasRef.current.width, 0);
    canvasCtx.scale(-1, 1);
    
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      let globalMinX = 1, globalMinY = 1, globalMaxX = 0, globalMaxY = 0;
      const primaryHandLandmarks = results.multiHandLandmarks[0];
      
      for (const landmarks of results.multiHandLandmarks) {
          const cW = canvasRef.current.width;
          const cH = canvasRef.current.height;

          // ── Pass 1: skeleton connections (drawn below dots) ──────────────
          canvasCtx.strokeStyle = '#2dd4bf';
          canvasCtx.lineWidth = 2.5;
          canvasCtx.lineCap = 'round';
          for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
            const a = landmarks[startIdx];
            const b = landmarks[endIdx];
            canvasCtx.beginPath();
            canvasCtx.moveTo(a.x * cW, a.y * cH);
            canvasCtx.lineTo(b.x * cW, b.y * cH);
            canvasCtx.stroke();
          }

          // ── Pass 2: joint dots (drawn on top of connections) ─────────────
          for (const landmark of landmarks) {
            canvasCtx.beginPath();
            canvasCtx.arc(landmark.x * cW, landmark.y * cH, 6, 0, 2 * Math.PI);
            canvasCtx.fillStyle = '#2dd4bf';
            canvasCtx.fill();
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = '#ffffff';
            canvasCtx.stroke();

            globalMinX = Math.min(globalMinX, landmark.x);
            globalMinY = Math.min(globalMinY, landmark.y);
            globalMaxX = Math.max(globalMaxX, landmark.x);
            globalMaxY = Math.max(globalMaxY, landmark.y);
          }
        }
      
      const PAD_RATIO = 0.15;
      const imgW = results.image.width;
      const imgH = results.image.height;

      const centerPxX = ((globalMinX + globalMaxX) / 2) * imgW;
      const centerPxY = ((globalMinY + globalMaxY) / 2) * imgH;
      const bboxPxW   = (globalMaxX - globalMinX) * imgW;
      const bboxPxH   = (globalMaxY - globalMinY) * imgH;

      const squareSide = Math.max(bboxPxW, bboxPxH);
      const paddedSide = squareSide * (1 + 2 * PAD_RATIO);
      const halfSide   = paddedSide / 2;

      const sourceX = Math.max(0, centerPxX - halfSide);
      const sourceY = Math.max(0, centerPxY - halfSide);
      const sourceW = Math.min(imgW, centerPxX + halfSide) - sourceX;
      const sourceH = Math.min(imgH, centerPxY + halfSide) - sourceY;

      hiddenCtx.clearRect(0, 0, 64, 64);
      hiddenCtx.drawImage(
        results.image, 
        sourceX, sourceY, sourceW, sourceH,
        0, 0, 64, 64
      );
      
      try {
        let prediction;

        if (useLandmarkRef.current) {
          // ── Landmark model path ──────────────────────────────────────────
          // No canvas/pixel work needed — use the already-extracted landmarks.
          // primaryHandLandmarks are the raw NormalizedLandmark objects from MediaPipe.
          prediction = await predictLandmarks(primaryHandLandmarks, modeRef.current);
        } else {
          // ── CNN model path (default, unchanged) ──────────────────────────
          const tensor = tf.browser.fromPixels(hiddenCanvasRef.current);
          prediction   = await predictFrame(tensor, modeRef.current);
        }

        dispatch(setPrediction(prediction));

        const now = Date.now();

        // ── Temporal smoothing via confidence-weighted majority vote ────────
        // Push the current frame into a rolling buffer and score each class by
        // the sum of its confidence across the window.  This lets slightly
        // rotated / imperfect frames still contribute to a stable consensus,
        // while isolated mis-classifications (low confidence on the wrong
        // class) are naturally suppressed.
        const MAX_BUFFER = 5;
        const buf = predictionBufferRef.current;
        buf.push({ letter: prediction.letter, confidence: prediction.confidence });
        if (buf.length > MAX_BUFFER) buf.shift();

        const classScores = new Map<string, number>();
        for (const entry of buf) {
          classScores.set(entry.letter, (classScores.get(entry.letter) ?? 0) + entry.confidence);
        }
        let smoothedLetter = buf[buf.length - 1].letter;
        let smoothedScore  = 0;
        let totalScore     = 0;
        for (const [letter, score] of classScores) {
          totalScore += score;
          if (score > smoothedScore) {
            smoothedLetter = letter;
            smoothedScore  = score;
          }
        }
        // Ratio of the winner's score to the total — 1.0 means full agreement.
        const stability = totalScore > 0 ? smoothedScore / totalScore : 0;

        // Hint logic — uses raw per-frame prediction for immediate feedback.
        if (targetLetterRef.current) {
          if (prediction.letter !== targetLetterRef.current || prediction.confidence < CONFIDENCE_THRESHOLD) {
            if (now - lastHintTimeRef.current > 400) {
              const hint = generateHandFeedback(targetLetterRef.current, primaryHandLandmarks);
              dispatch(setCurrentHint(hint));
              lastHintTimeRef.current = now;
            }
          } else if (prediction.letter === targetLetterRef.current && prediction.confidence >= CONFIDENCE_THRESHOLD) {
            if (now - lastHintTimeRef.current > 200) {
              dispatch(setCurrentHint(null));
              lastHintTimeRef.current = now;
            }
          }
        }

        // ── Commit gate ─────────────────────────────────────────────────────
        // All three conditions must hold:
        //  1. Raw current-frame confidence ≥ CONFIDENCE_THRESHOLD  (hand present, valid sign)
        //  2. Smoothed stability ≥ 0.65  (≥ ~65 % of buffer mass agrees on one class)
        //  3. The smoothed winner has been stable for ≥ STABILITY_MS
        //  4. It's a different letter from the last committed one (no repeats)
        if (
          prediction.confidence >= CONFIDENCE_THRESHOLD &&
          stability >= 0.65 &&
          buf.length >= 3
        ) {
          const letter = smoothedLetter;

          if (letter !== lastLetterRef.current) {
            // Track when this smoothed letter first became the consensus.
            if (candidateLetterRef.current !== letter) {
              candidateLetterRef.current    = letter;
              candidateStartTimeRef.current = now;
            } else if (now - (candidateStartTimeRef.current ?? now) >= STABILITY_MS) {
              lastLetterRef.current = letter;
              candidateLetterRef.current = null;
              predictionBufferRef.current = [];
              dispatch(appendLetter(letter));
            }
          }
        }
      } catch (e) {
        console.error("Prediction error:", e);
      }
    } else {
      // No hand detected — reset all smoothing state so the next sign starts
      // with a clean buffer and no stale candidate.
      lastLetterRef.current         = null;
      candidateLetterRef.current    = null;
      candidateStartTimeRef.current = null;
      predictionBufferRef.current   = [];
      if (targetLetterRef.current) {
        dispatch(setCurrentHint("Show your hand to the camera"));
      }
    }

    canvasCtx.restore();
  };

  return (
    <div className="w-full flex flex-col gap-4 relative animate-float">
      <div data-tour="camera-view" className="relative w-full aspect-video bg-white rounded-[3rem] overflow-hidden border-8 border-teal-100 shadow-[0_20px_50px_-12px_rgba(20,184,166,0.3)] flex items-center justify-center transform transition-transform hover:scale-[1.01]">
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-6 bg-slate-50/80 backdrop-blur-sm z-10">
            <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin shadow-lg"></div>
            <p className="font-bold text-lg tracking-wide text-slate-600">Starting Camera...</p>
          </div>
        )}
        
        <video ref={videoRef} className="hidden" playsInline />
        <canvas ref={canvasRef} width={640} height={480} className="w-full h-full object-cover rounded-[1.5rem]" />
        <canvas ref={hiddenCanvasRef} width={64} height={64} className="hidden" />

        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
          {/* Camera status */}
          <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-100 shadow-xl pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-slate-300'}`}></div>
              <span className="text-sm font-black text-slate-600 uppercase tracking-wider">
                {isReady ? 'Camera Live' : 'Connecting'}
              </span>
            </div>
          </div>

          {/* Active model badge — always visible so it's unambiguous during testing */}
          <div data-tour="model-badge" className={`px-4 py-2 rounded-2xl border shadow-lg text-xs font-black uppercase tracking-wider pointer-events-auto
            ${useLandmarkModel
              ? 'bg-violet-500 text-white border-violet-400 shadow-violet-500/30'
              : 'bg-white/90 text-slate-600 border-slate-100'
            }`}>
            {useLandmarkModel ? '🤙 Landmark Model' : '🧠 CNN Model'}
          </div>
        </div>
      </div>
      
      <div className="absolute -top-6 -left-6 w-20 h-20 bg-yellow-300/30 rounded-full blur-2xl -z-10"></div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};
