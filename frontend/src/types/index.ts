export interface Prediction {
  letter: string;
  confidence: number; // 0-1
  timestamp: number;
}

export interface Message {
  id: string;
  text: string;
  urdu?: string;
  emoji?: string;
  timestamp: number;
  confidence: number;
}

export type Language = "en" | "ur";
