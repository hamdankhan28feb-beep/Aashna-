import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import * as tf from '@tensorflow/tfjs';
import { setPrediction, appendLetter } from '../../store/predictionSlice';
import { predictFrame } from '../../services/modelService';
import { RootState } from '../../store';

export const CameraView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  // Tracks the last letter that was actually appended to text.
  // Stored in a ref (not state) to avoid triggering re-renders on every frame.
  const lastLetterRef = useRef<string | null>(null);
  
  const currentMode = useSelector((state: RootState) => state.prediction.signMode);
  const modeRef = useRef(currentMode);
  
  useEffect(() => {
    modeRef.current = currentMode;
    lastLetterRef.current = null; // reset on mode change so first sign in new mode is never skipped
    if (currentMode === 'phrases') {
      // Clear stale confidence display — no predictions run in Phrases mode
      dispatch(setPrediction({ letter: '', confidence: 0, timestamp: Date.now() }));
    }
  }, [currentMode]);

  useEffect(() => {
    let camera: Camera | null = null;
    let hands: Hands | null = null;
    let isActive = true;

    const setupMediaPipe = async () => {
      hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults(onResults);

      if (videoRef.current) {
        camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && isActive) {
              await hands?.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        camera.start().then(() => setIsReady(true));
      }
    };

    setupMediaPipe();

    return () => {
      isActive = false;
      camera?.stop();
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
    
    // Draw with slight corner radius effect logic isn't trivial on canvas directly, 
    // but the canvas element itself will be rounded via CSS.
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      let globalMinX = 1, globalMinY = 1, globalMaxX = 0, globalMaxY = 0;
      
      for (const landmarks of results.multiHandLandmarks) {
        for (const landmark of landmarks) {
          canvasCtx.beginPath();
          // Use a friendly teal color for the tracking dots
          canvasCtx.arc(landmark.x * canvasRef.current.width, landmark.y * canvasRef.current.height, 6, 0, 2 * Math.PI);
          canvasCtx.fillStyle = '#2dd4bf'; // teal-400
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
      
      const padding = 0.1;
      globalMinX = Math.max(0, globalMinX - padding);
      globalMinY = Math.max(0, globalMinY - padding);
      globalMaxX = Math.min(1, globalMaxX + padding);
      globalMaxY = Math.min(1, globalMaxY + padding);
      
      const width = globalMaxX - globalMinX;
      const height = globalMaxY - globalMinY;
      
      const sourceX = globalMinX * results.image.width;
      const sourceY = globalMinY * results.image.height;
      const sourceW = width * results.image.width;
      const sourceH = height * results.image.height;
      
      hiddenCtx.clearRect(0, 0, 64, 64);
      hiddenCtx.drawImage(
        results.image,
        sourceX, sourceY, sourceW, sourceH,
        0, 0, 64, 64
      );
      
      try {
        const tensor = tf.browser.fromPixels(hiddenCanvasRef.current);
        // Phrases mode is not yet implemented — skip inference entirely
        if (modeRef.current === 'phrases') {
          tensor.dispose();
        } else {
          const prediction = await predictFrame(tensor, modeRef.current);
          // Always update the current prediction display (for UI confidence meter etc.)
          dispatch(setPrediction(prediction));
          // Only append to text when the predicted letter changes from the last confirmed one
          if (prediction.confidence >= 0.7 && prediction.letter !== lastLetterRef.current) {
            lastLetterRef.current = prediction.letter;
            dispatch(appendLetter(prediction.letter));
          }
        }
      } catch (e) {
        console.error("Prediction error:", e);
      }
    } else {
      // No hand in frame — reset so the same letter can be re-added next time
      lastLetterRef.current = null;
    }
    
    canvasCtx.restore();
  };

  return (
    <div className="w-full flex flex-col gap-4 relative animate-float">
      <div className="relative w-full aspect-video bg-white rounded-[3rem] overflow-hidden border-8 border-teal-100 shadow-[0_20px_50px_-12px_rgba(20,184,166,0.3)] flex items-center justify-center transform transition-transform hover:scale-[1.01]">
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
          <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-100 shadow-xl pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-slate-300'}`}></div>
              <span className="text-sm font-black text-slate-600 uppercase tracking-wider">
                {isReady ? 'Camera Live' : 'Connecting'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Friendly decorative elements */}
      <div className="absolute -top-6 -left-6 w-20 h-20 bg-yellow-300/30 rounded-full blur-2xl -z-10"></div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};
