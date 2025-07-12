import React from 'react';
import { TrendingUp, BarChart3, Award, Clock, Activity } from 'lucide-react';
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
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
    
    const recentGestures = gestureHistory.slice(0, 3);
    
    return { total, avgConfidence, mostCommon, recentGestures, gestureCount };
  };

  const stats = getStats();

  return (
    <div className="bg-black/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-md"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Analytics</h2>
            <p className="text-sm text-slate-400">Performance metrics</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4">
          <StatCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Total Gestures"
            value={stats.total.toString()}
            color="emerald"
          />
          
          <StatCard
            icon={<Award className="h-5 w-5" />}
            title="Avg. Confidence"
            value={`${(stats.avgConfidence * 100).toFixed(1)}%`}
            color="violet"
          />
        </div>

        {/* Most common gesture */}
        {stats.mostCommon !== 'None' && (
          <div className="bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-5 w-5 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Most Common</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{GESTURE_EMOJIS[stats.mostCommon] || '🤷'}</span>
              <div>
                <p className="text-lg font-bold text-white capitalize">
                  {stats.mostCommon.replace(/_/g, ' ')}
                </p>
                <p className="text-sm text-purple-300">
                  {stats.gestureCount[stats.mostCommon] || 0} times
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent gestures */}
        {stats.recentGestures.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Recent Activity</h3>
            </div>
            <div className="space-y-2">
              {stats.recentGestures.map((gesture, index) => (
                <div 
                  key={gesture.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <span className="text-xl">{GESTURE_EMOJIS[gesture.gesture] || '👋'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium capitalize text-sm truncate">
                      {gesture.gesture.replace(/_/g, ' ')}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {gesture.timestamp}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-8 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-violet-400 transition-all duration-300"
                        style={{ width: `${gesture.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-emerald-300 font-bold">
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
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No data available</p>
            <p className="text-sm">Start detection to see analytics</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: 'emerald' | 'violet' | 'blue';
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
  const colorClasses = {
    emerald: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400',
    violet: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-4 border hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`${colorClasses[color]}`}>
          {icon}
        </div>
        <span className="text-slate-300 text-sm font-medium">{title}</span>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
};

export default Statistics;