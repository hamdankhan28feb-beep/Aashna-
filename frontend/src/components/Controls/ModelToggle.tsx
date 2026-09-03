import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setUseLandmarkModel } from '../../store/predictionSlice';

/**
 * ModelToggle
 * -----------
 * Toggle switch that switches CameraView between the CNN pixel model (red,
 * default) and the experimental MediaPipe landmark-based MLP (green).
 *
 * Place this inside ModeSwitcher or anywhere in the Practice tab panel.
 * It reads/writes `state.prediction.useLandmarkModel` from Redux.
 */
export const ModelToggle: React.FC = () => {
  const dispatch         = useDispatch();
  const useLandmarkModel = useSelector((state: RootState) => state.prediction.useLandmarkModel);

  return (
    <div className="flex items-center justify-between gap-4 w-full bg-white/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50 shadow-sm">
      <div className="flex flex-col">
        <span className="text-sm font-black text-slate-700">
          {useLandmarkModel ? '🤙 Landmark Model' : '🧠 CNN Model'}
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${
            useLandmarkModel
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-red-100 text-red-600'
          }`}>
            {useLandmarkModel ? 'Experimental' : 'Default'}
          </span>
        </span>
        <span className="text-xs text-slate-400 mt-0.5">
          {useLandmarkModel
            ? 'MediaPipe landmarks → MLP  (fast, background-invariant)'
            : 'Pixel crop → Deep CNN  (93.57% test accuracy)'}
        </span>
      </div>

      {/* Toggle switch — RED track = CNN model, GREEN track = Landmark model */}
      <button
        role="switch"
        aria-checked={useLandmarkModel}
        onClick={() => dispatch(setUseLandmarkModel(!useLandmarkModel))}
        className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 ${
          useLandmarkModel
            ? 'bg-emerald-500 border-emerald-500 focus-visible:ring-emerald-500'
            : 'bg-red-500 border-red-500 focus-visible:ring-red-500'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 mt-0.5 ${
            useLandmarkModel ? 'translate-x-7' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
};
