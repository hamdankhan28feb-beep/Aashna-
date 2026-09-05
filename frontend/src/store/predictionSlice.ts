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
  /** Spell Assist: the last chip commit, so backspaceToWordStart can undo it
   *  and return the user to letter-by-letter editing. */
  lastCommit: { word: string; prefix: string } | null;
}

const initialState: PredictionState = {
  current: null,
  text: "",
  confidenceThreshold: 0.55,
  signMode: 'letters',
  targetLetter: null,
  currentHint: null,
  useLandmarkModel: true,  // Landmark model (MediaPipe landmarks → MLP) is the sole recognition engine — no UI to switch back to CNN
  lastCommit: null,
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
    /** Spell Assist: replace the partial word being signed (the letters after
     *  the last space) with the chosen word plus a trailing space. */
    commitWord(state, action: PayloadAction<string>) {
      const word = action.payload.trim();
      if (!word) return;
      const idx = state.text.lastIndexOf(" ");
      const prefix = state.text.slice(idx + 1);
      state.text = state.text.slice(0, idx + 1) + word + " ";
      state.lastCommit = { word, prefix };
    },
    /** Spell Assist: undo the last commitWord back to letter-by-letter editing
     *  when it's still the tail of the text; otherwise delete the current
     *  partial word back to its start (word-level backspace). */
    backspaceToWordStart(state) {
      const { text, lastCommit } = state;
      if (lastCommit && text.endsWith(lastCommit.word + " ")) {
        state.text =
          text.slice(0, text.length - lastCommit.word.length - 1) + lastCommit.prefix;
        state.lastCommit = null;
        return;
      }
      const idx = text.lastIndexOf(" ");
      if (idx === -1) {
        state.text = ""; // single partial word: clear it
      } else if (idx === text.length - 1) {
        // Partial is empty (text ends with a space): remove the previous word
        // together with its trailing space.
        const prevIdx = text.slice(0, idx).lastIndexOf(" ");
        state.text = text.slice(0, prevIdx + 1);
      } else {
        state.text = text.slice(0, idx + 1);
      }
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

export const { setPrediction, appendLetter, appendChar, backspace, clearText, commitWord, backspaceToWordStart, setSignMode, setTargetLetter, setCurrentHint, setUseLandmarkModel } = predictionSlice.actions;
export default predictionSlice.reducer;
