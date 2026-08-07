import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import * as tf from '@tensorflow/tfjs';
import { setPrediction } from '../../store/predictionSlice';
import { predictFrame } from '../../services/modelService';

export const CameraView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    let camera: Camera | null = null;
    let hands: Hands | null = null;
    let isActive = true;

    const setupMediaPipe = async () => {
      hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
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
    // Mirror the view for a more natural feel for the user
    canvasCtx.translate(canvasRef.current.width, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      // Draw hand landmarks
      for (const landmark of landmarks) {
        canvasCtx.beginPath();
        canvasCtx.arc(landmark.x * canvasRef.current.width, landmark.y * canvasRef.current.height, 5, 0, 2 * Math.PI);
        canvasCtx.fillStyle = '#6366f1'; 
        canvasCtx.fill();
      }
      
      // Calculate Bounding Box
      let minX = 1, minY = 1, maxX = 0, maxY = 0;
      for (const landmark of landmarks) {
        minX = Math.min(minX, landmark.x);
        minY = Math.min(minY, landmark.y);
        maxX = Math.max(maxX, landmark.x);
        maxY = Math.max(maxY, landmark.y);
      }
      
      const padding = 0.1;
      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX = Math.min(1, maxX + padding);
      maxY = Math.min(1, maxY + padding);
      
      const width = maxX - minX;
      const height = maxY - minY;
      
      const sourceX = minX * results.image.width;
      const sourceY = minY * results.image.height;
      const sourceW = width * results.image.width;
      const sourceH = height * results.image.height;
      
      // Draw cropped hand to 64x64 hidden canvas
      hiddenCtx.clearRect(0, 0, 64, 64);
      hiddenCtx.drawImage(
        results.image,
        sourceX, sourceY, sourceW, sourceH,
        0, 0, 64, 64
      );
      
      try {
        const tensor = tf.browser.fromPixels(hiddenCanvasRef.current);
        const prediction = await predictFrame(tensor);
        dispatch(setPrediction(prediction));
      } catch (e) {
        console.error("Prediction error:", e);
      }
    }
    
    canvasCtx.restore();
  };

  return (
    <div className="w-full lg:w-[60%] flex flex-col gap-4">
      <div className="relative w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-medium">Initializing AI Camera...</p>
          </div>
        )}
        
        <video ref={videoRef} className="hidden" playsInline />
        <canvas ref={canvasRef} width={640} height={480} className="w-full h-full object-cover" />
        <canvas ref={hiddenCanvasRef} width={64} height={64} className="hidden" />

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
          <div className="bg-slate-950/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isReady ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
              <span className="text-sm font-medium text-slate-300">
                {isReady ? 'Camera Active' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
