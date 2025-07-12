import React from 'react';
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
  'one': '1️⃣',
  'two': '2️⃣',
  'three': '3️⃣',
  'four': '4️⃣',
  'five': '5️⃣',
  'None': '🚫',
  'Closed_Fist': '✊',
  'Open_Palm': '🖐️',
  'Pointing_Up': '☝️',
  'Thumb_Down': '👎',
  'Thumb_Up': '👍',
  'Victory': '✌️',
  'ILoveYou': '🤟'
};

interface GestureOverlayProps {
  gestures: DetectedGesture[];
}

const GestureOverlay: React.FC<GestureOverlayProps> = ({ gestures }) => {
  return (
    <div className="absolute bottom-6 left-6 right-6 z-10">
      <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-4 border border-white/20">
        <div className="flex items-center gap-4 overflow-x-auto">
          {gestures.map((gesture, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 min-w-max backdrop-blur-md bg-white/10 rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-all duration-300 animate-fade-in"
            >
              <div className="relative">
                <span className="text-3xl animate-bounce">{GESTURE_EMOJIS[gesture.gesture] || '👋'}</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              
              <div>
                <p className="text-sm font-bold text-white capitalize leading-tight">
                  {gesture.gesture.replace(/_/g, ' ')}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-blue-300 font-medium">
                    Mano {gesture.hand}
                  </span>
                  <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-300"
                      style={{ width: `${gesture.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-green-300 font-bold">
                    {(gesture.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GestureOverlay;