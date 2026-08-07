import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Prediction } from "../types";

interface PredictionState {
  current: Prediction | null;
  text: string;
  confidenceThreshold: number;
}

const initialState: PredictionState = {
  current: null,
  text: "",
  confidenceThreshold: 0.7, // per PRD data flow: only accept predictions above this
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
  },
});

export const { setPrediction, appendChar, backspace, clearText } = predictionSlice.actions;
export default predictionSlice.reducer;
