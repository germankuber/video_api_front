import React from 'react';
import { Target, Zap, TrendingUp } from 'lucide-react';
import type { DetectedGesture } from '../types/mediapipe';

const GESTURE_EMOJIS: { [key: string]: string } = {
  'thumbs_up': '👍',
  'thumbs_down': '👎',
  'victory': '✌️',
  'pointing_up': '☝️',
  'open_palm': '🖐️',
  'closed_fist': '✊',
  'okay': '👌',
  'love_you': '🤟',
  'call_me': '🤙',
  'rock': '🤘',
  'peace': '✌️',
  'stop': '🛑',
  'None': '🚫',
  'Closed_Fist': '✊',
  'Open_Palm': '🖐️',
  'Pointing_Up': '☝️',
  'Thumb_Down': '👎',
  'Thumb_Up': '👍',
  'Victory': '✌️',
  'ILoveYou': '🤟'
};

interface CurrentGestureProps {
  gesture: DetectedGesture | null;
  isRecording: boolean;
}

const CurrentGesture: React.FC<CurrentGestureProps> = ({ gesture, isRecording }) => {
  return (
    <div className="relative h-full">
      <div className="bg-black/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl h-full relative overflow-hidden">
        {/* Premium background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 p-8 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <Target className="h-7 w-7 text-violet-400" />
              <div className="absolute inset-0 bg-violet-400/20 rounded-full blur-md"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Current Gesture</h2>
              <p className="text-sm text-slate-400">Real-time detection</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {gesture ? (
              <div className="text-center space-y-6">
                {/* Gesture display */}
                <div className="relative">
                  <div className="text-8xl mb-6 transform hover:scale-110 transition-transform duration-300">
                    {GESTURE_EMOJIS[gesture.gesture] || '👋'}
                  </div>
                  
                  {/* Animated rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-40 border border-violet-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute w-32 h-32 border border-purple-400/30 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
                  </div>
                </div>
                
                {/* Gesture name */}
                <h3 className="text-3xl font-black text-white capitalize mb-4">
                  {gesture.gesture.replace(/_/g, ' ')}
                </h3>
                
                {/* Details card */}
                <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-400 mb-1">Hand</p>
                      <p className="text-xl font-bold text-white">
                        {gesture.hand === 1 ? 'Left' : 'Right'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-400 mb-1">Time</p>
                      <p className="text-lg font-bold text-violet-400">
                        {gesture.timestamp}
                      </p>
                    </div>
                  </div>
                  
                  {/* Confidence meter */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Confidence Level
                      </span>
                      <span className="text-xl font-bold text-emerald-400">
                        {(gesture.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 via-violet-400 to-purple-400 transition-all duration-500 relative"
                        style={{ width: `${gesture.confidence * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                {isRecording ? (
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="text-7xl opacity-60 animate-pulse">🔍</div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 border-2 border-violet-400/30 rounded-full animate-spin"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Scanning for gestures...</h3>
                      <p className="text-slate-400">Show your hand to the camera</p>
                    </div>
                    <div className="flex justify-center gap-1">
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-7xl opacity-50">⏸️</div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Detection Paused</h3>
                      <p className="text-slate-400">Click "Start Detection" to begin</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentGesture;