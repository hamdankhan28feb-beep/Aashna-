import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Prediction } from "../types";

export type SignMode = 'letters' | 'numbers' | 'phrases';

interface PredictionState {
  current: Prediction | null;
  text: string;
  confidenceThreshold: number;
  signMode: SignMode;
  targetLetter: string | null;
  currentHint: string | null;
  useLandmarkModel: boolean;
}

const initialState: PredictionState = {
  current: null,
  text: "",
  confidenceThreshold: 0.7,
  signMode: 'letters',
  targetLetter: null,
  currentHint: null,
  useLandmarkModel: false,  // CNN model is the default
};

const predictionSlice = createSlice({
  name: "prediction",
  initialState,
  reducers: {
    setPrediction(state, action: PayloadAction<Prediction>) {
      state.current = action.payload;
    },
    appendLetter(state, action: PayloadAction<string>) {
      state.text += action.payload;
    },
    appendChar(state, action: PayloadAction<string>) {
      state.text += action.payload;
    },
    backspace(state) {
      state.text = state.text.slice(0, -1);
    },
    clearText(state) {
      state.text = "";
    },
    setSignMode(state, action: PayloadAction<SignMode>) {
      state.signMode = action.payload;
    },
    setTargetLetter(state, action: PayloadAction<string | null>) {
      state.targetLetter = action.payload;
      state.currentHint = null; // Clear hint when new target is set
    },
    setCurrentHint(state, action: PayloadAction<string | null>) {
      state.currentHint = action.payload;
    },
    setUseLandmarkModel(state, action: PayloadAction<boolean>) {
      state.useLandmarkModel = action.payload;
    },
  },
});

export const { setPrediction, appendLetter, appendChar, backspace, clearText, setSignMode, setTargetLetter, setCurrentHint, setUseLandmarkModel } = predictionSlice.actions;
export default predictionSlice.reducer;
