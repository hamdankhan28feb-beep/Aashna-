import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setUseLandmarkModel } from '../../store/predictionSlice';

/**
 * ModelToggle
 * -----------
 * Toggle switch that switches CameraView between the CNN pixel model (default)
 * and the experimental MediaPipe landmark-based MLP.
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
              ? 'bg-violet-100 text-violet-600'
              : 'bg-teal-100 text-teal-600'
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

      {/* Toggle switch */}
      <button
        role="switch"
        aria-checked={useLandmarkModel}
        onClick={() => dispatch(setUseLandmarkModel(!useLandmarkModel))}
        className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
          useLandmarkModel
            ? 'bg-violet-500 border-violet-500'
            : 'bg-slate-200 border-slate-200'
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
