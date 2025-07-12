import React from 'react';
import { History, Trash2, Download } from 'lucide-react';
import type { GestureHistory as GestureHistoryType } from '../types/mediapipe';

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

interface GestureHistoryProps {
  gestureHistory: GestureHistoryType[];
  onClearHistory: () => void;
}

const GestureHistory: React.FC<GestureHistoryProps> = ({ gestureHistory, onClearHistory }) => {
  const exportHistory = () => {
    const dataStr = JSON.stringify(gestureHistory, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `gesture-history-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <History className="h-6 w-6 text-yellow-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-white">Historial</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="backdrop-blur-md bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-bold border border-yellow-500/30">
            {gestureHistory.length}
          </span>
          
          {gestureHistory.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={exportHistory}
                className="p-2 backdrop-blur-md bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 hover:bg-blue-500/30 transition-all duration-200"
                title="Exportar historial"
              >
                <Download className="h-4 w-4" />
              </button>
              
              <button
                onClick={onClearHistory}
                className="p-2 backdrop-blur-md bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 hover:bg-red-500/30 transition-all duration-200"
                title="Limpiar historial"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* History list */}
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {gestureHistory.map((gesture, index) => (
          <div 
            key={gesture.id}
            className="group flex items-center gap-4 p-4 backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Gesture emoji */}
            <div className="relative">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                {GESTURE_EMOJIS[gesture.gesture] || '👋'}
              </span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full text-xs flex items-center justify-center text-white font-bold">
                {gesture.hand}
              </div>
            </div>
            
            {/* Gesture info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white font-bold capitalize">
                  {gesture.gesture.replace(/_/g, ' ')}
                </p>
                <span className="text-xs text-slate-400">
                  #{gestureHistory.length - index}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-400">
                  {gesture.timestamp}
                </span>
                
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-300"
                      style={{ width: `${gesture.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-green-300 font-bold text-xs">
                    {(gesture.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Hand indicator */}
            <div className="text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                gesture.hand === 1 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              }`}>
                {gesture.hand === 1 ? 'L' : 'R'}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {gesture.hand === 1 ? 'Izq' : 'Der'}
              </span>
            </div>
          </div>
        ))}
        
        {gestureHistory.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No hay gestos registrados</p>
            <p className="text-sm">Inicia la detección para ver el historial</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestureHistory;