import React from 'react';
import { TrendingUp, BarChart3, Award, Clock } from 'lucide-react';
import type { GestureHistory } from '../types/mediapipe';

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

interface StatisticsProps {
  gestureHistory: GestureHistory[];
}

const Statistics: React.FC<StatisticsProps> = ({ gestureHistory }) => {
  const getStats = () => {
    const total = gestureHistory.length;
    const avgConfidence = total > 0 
      ? gestureHistory.reduce((sum, g) => sum + g.confidence, 0) / total 
      : 0;
    
    const gestureCount: { [key: string]: number } = {};
    gestureHistory.forEach(g => {
      gestureCount[g.gesture] = (gestureCount[g.gesture] || 0) + 1;
    });
    
    const mostCommon = Object.entries(gestureCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Ninguno';
    
    const recentGestures = gestureHistory.slice(0, 5);
    
    return { total, avgConfidence, mostCommon, recentGestures, gestureCount };
  };

  const stats = getStats();

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <TrendingUp className="h-6 w-6 text-green-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-2xl font-bold text-white">Estadísticas</h2>
        </div>
        <div className="backdrop-blur-md bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-bold border border-green-500/30">
          {stats.total} gestos
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Total gestures */}
        <StatCard
          icon={<BarChart3 className="h-6 w-6" />}
          title="Total de Gestos"
          value={stats.total.toString()}
          color="from-blue-500 to-cyan-500"
          bgColor="from-blue-500/20 to-cyan-500/20"
          borderColor="border-blue-500/30"
        />
        
        {/* Average confidence */}
        <StatCard
          icon={<Award className="h-6 w-6" />}
          title="Confianza Promedio"
          value={`${(stats.avgConfidence * 100).toFixed(1)}%`}
          color="from-green-500 to-emerald-500"
          bgColor="from-green-500/20 to-emerald-500/20"
          borderColor="border-green-500/30"
        />
        
        {/* Most common gesture */}
        <div className="backdrop-blur-md bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Award className="h-6 w-6 text-white" />
            </div>
            <span className="text-purple-300 text-sm font-medium">Gesto Más Común</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{GESTURE_EMOJIS[stats.mostCommon] || '🤷'}</span>
            <div>
              <p className="text-xl font-bold text-white capitalize">
                {stats.mostCommon.replace(/_/g, ' ')}
              </p>
              <p className="text-sm text-purple-300">
                {stats.gestureCount[stats.mostCommon] || 0} veces
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent gestures */}
      {stats.recentGestures.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Gestos Recientes</h3>
          </div>
          <div className="space-y-2">
            {stats.recentGestures.map((gesture, index) => (
              <div 
                key={gesture.id}
                className="flex items-center gap-3 p-3 backdrop-blur-md bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <span className="text-2xl">{GESTURE_EMOJIS[gesture.gesture] || '👋'}</span>
                <div className="flex-1">
                  <p className="text-white font-medium capitalize text-sm">
                    {gesture.gesture.replace(/_/g, ' ')}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {gesture.timestamp}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-2 bg-white/20 rounded-full overflow-hidden">
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
            ))}
          </div>
        </div>
      )}

      {stats.total === 0 && (
        <div className="text-center py-8 text-slate-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No hay estadísticas disponibles</p>
          <p className="text-sm">Inicia la detección para ver las métricas</p>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, bgColor, borderColor }) => {
  return (
    <div className={`backdrop-blur-md bg-gradient-to-r ${bgColor} rounded-2xl p-4 border ${borderColor} hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-full bg-gradient-to-r ${color}`}>
          {icon}
        </div>
        <span className="text-slate-300 text-sm font-medium">{title}</span>
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  );
};

export default Statistics;