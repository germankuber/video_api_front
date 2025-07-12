// Declaraciones de tipos para MediaPipe
import type {
    GestureRecognizerResult,
    GestureRecognizer as MediaPipeGestureRecognizer
} from '@mediapipe/tasks-vision';

// Re-export los tipos de MediaPipe para uso interno
export type GestureRecognizer = MediaPipeGestureRecognizer;
export type GestureResults = GestureRecognizerResult;

export interface Gesture {
  categoryName: string;
  score: number;
  displayName?: string;
}

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
}

export interface Handedness {
  categoryName: 'Left' | 'Right';
  score: number;
  displayName?: string;
}

export interface MediaPipeOptions {
  baseOptions: {
    modelAssetPath: string;
    delegate?: 'CPU' | 'GPU';
  };
  runningMode: 'IMAGE' | 'VIDEO';
  numHands?: number;
  minHandDetectionConfidence?: number;
  minHandPresenceConfidence?: number;
  minTrackingConfidence?: number;
}

// Tipos para los gestos
export type GestureType = 
  | 'thumbs_up'
  | 'thumbs_down'
  | 'victory'
  | 'pointing_up'
  | 'open_palm'
  | 'closed_fist'
  | 'okay'
  | 'love_you'
  | 'call_me'
  | 'rock'
  | 'peace'
  | 'stop'
  | 'one'
  | 'two'
  | 'three'
  | 'four'
  | 'five'
  | 'six'
  | 'seven'
  | 'eight'
  | 'nine'
  | 'ten';

export interface DetectedGesture {
  hand: number;
  gesture: string;
  confidence: number;
  timestamp: string;
}

export interface GestureHistory extends DetectedGesture {
  id: string;
}

export interface GestureStats {
  totalGestures: number;
  averageConfidence: number;
  mostCommonGesture: string;
}

export { };
