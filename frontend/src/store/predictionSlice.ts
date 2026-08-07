import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Prediction } from "../types";

export type SignMode = 'letters' | 'numbers' | 'phrases';

interface PredictionState {
  current: Prediction | null;
  text: string;
  confidenceThreshold: number;
  signMode: SignMode;
}

const initialState: PredictionState = {
  current: null,
  text: "",
  confidenceThreshold: 0.7, 
  signMode: 'letters',
};

const predictionSlice = createSlice({
  name: "prediction",
  initialState,
  reducers: {
    setPrediction(state, action: PayloadAction<Prediction>) {
      state.current = action.payload;
      if (action.payload.confidence >= state.confidenceThreshold) {
        state.text += action.payload.letter;
      }
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
    }
  },
});

export const { setPrediction, appendChar, backspace, clearText, setSignMode } = predictionSlice.actions;
export default predictionSlice.reducer;
