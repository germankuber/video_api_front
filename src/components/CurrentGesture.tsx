import React from 'react';
import { Target, Zap } from 'lucide-react';
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

interface CurrentGestureProps {
  gesture: DetectedGesture | null;
  isRecording: boolean;
}

const CurrentGesture: React.FC<CurrentGestureProps> = ({ gesture, isRecording }) => {
  return (
    <div className="relative h-full">
      {/* Glass card */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-red-500/20 rounded-3xl p-8 border border-white/20 shadow-2xl h-full relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-ping"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
        
        <div className="relative z-10 text-center h-full flex flex-col justify-center">
          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Target className="h-8 w-8 text-purple-400 animate-pulse" />
            <h2 className="text-3xl font-black text-white">GESTO ACTUAL</h2>
            <Zap className="h-8 w-8 text-yellow-400 animate-bounce" />
          </div>
          
          {gesture ? (
            <div className="space-y-8">
              {/* Gesture emoji with effects */}
              <div className="relative">
                <div className="text-9xl mb-6 transform transition-all duration-500 hover:scale-110 animate-bounce">
                  {GESTURE_EMOJIS[gesture.gesture] || '👋'}
                </div>
                
                {/* Rotating rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white/20 rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
                  <div className="absolute w-40 h-40 border-2 border-purple-400/30 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
                  <div className="absolute w-32 h-32 border-2 border-pink-400/30 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                </div>
              </div>
              
              {/* Gesture name */}
              <h3 className="text-4xl font-black text-white capitalize mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {gesture.gesture.replace(/_/g, ' ')}
              </h3>
              
              {/* Gesture details */}
              <div className="backdrop-blur-md bg-black/30 rounded-2xl p-6 border border-white/20">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-300 mb-1">Mano Detectada</p>
                    <p className="text-2xl font-bold text-white">
                      {gesture.hand === 1 ? 'Izquierda' : 'Derecha'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-300 mb-1">Timestamp</p>
                    <p className="text-lg font-bold text-blue-400">
                      {gesture.timestamp}
                    </p>
                  </div>
                </div>
                
                {/* Confidence bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Nivel de Confianza</span>
                    <span className="text-lg font-bold text-green-400">
                      {(gesture.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-4 bg-black/50 rounded-full overflow-hidden border border-white/20">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 transition-all duration-500 relative"
                      style={{ width: `${gesture.confidence * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12">
              {isRecording ? (
                <div className="space-y-6">
                  <div className="relative">
                    <div className="text-8xl mb-6 opacity-60 animate-pulse">🔍</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 border-4 border-blue-400/30 rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Buscando gestos...</h3>
                  <p className="text-xl text-slate-300">Mueve tu mano frente a la cámara</p>
                  <div className="flex justify-center gap-2 mt-6">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-8xl mb-6 opacity-50">⏸️</div>
                  <h3 className="text-3xl font-bold text-white mb-4">Detección pausada</h3>
                  <p className="text-xl text-slate-300">Presiona "Iniciar" para comenzar</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentGesture;