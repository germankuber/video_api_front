import React from 'react';
import { Zap, Activity, Camera, Wifi, WifiOff, Shield } from 'lucide-react';

interface HeaderProps {
  isAiReady: boolean;
  isCameraConnected: boolean;
  isRecording: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAiReady, isCameraConnected, isRecording }) => {
  return (
    <header className="relative overflow-hidden bg-black/95 backdrop-blur-xl border-b border-white/10">
      {/* Premium background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-fuchsia-600/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Brand section */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-violet-500 to-purple-500 p-4 rounded-2xl">
                <Activity className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <div>
              <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
                GestureAI
              </h1>
              <p className="text-lg text-slate-400 font-medium mt-1">
                Professional Hand Gesture Recognition
              </p>
            </div>
          </div>

          {/* Status dashboard */}
          <div className="flex items-center gap-4">
            <StatusCard
              icon={<Shield className="h-5 w-5" />}
              label="AI Engine"
              status={isAiReady ? 'active' : 'loading'}
              value={isAiReady ? 'Ready' : 'Loading...'}
            />
            
            <StatusCard
              icon={<Camera className="h-5 w-5" />}
              label="Camera"
              status={isCameraConnected ? 'active' : 'error'}
              value={isCameraConnected ? 'Connected' : 'Disconnected'}
            />
            
            <StatusCard
              icon={isRecording ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
              label="Detection"
              status={isRecording ? 'recording' : 'paused'}
              value={isRecording ? 'Live' : 'Paused'}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  status: 'active' | 'loading' | 'error' | 'recording' | 'paused';
  value: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ icon, label, status, value }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'active': return {
        bg: 'from-emerald-500/20 to-green-500/20',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
        text: 'text-emerald-400'
      };
      case 'loading': return {
        bg: 'from-amber-500/20 to-yellow-500/20',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400 animate-pulse',
        text: 'text-amber-400'
      };
      case 'error': return {
        bg: 'from-red-500/20 to-rose-500/20',
        border: 'border-red-500/30',
        dot: 'bg-red-400',
        text: 'text-red-400'
      };
      case 'recording': return {
        bg: 'from-red-500/20 to-pink-500/20',
        border: 'border-red-500/30',
        dot: 'bg-red-400 animate-ping',
        text: 'text-red-400'
      };
      case 'paused': return {
        bg: 'from-slate-500/20 to-gray-500/20',
        border: 'border-slate-500/30',
        dot: 'bg-slate-400',
        text: 'text-slate-400'
      };
      default: return {
        bg: 'from-slate-500/20 to-gray-500/20',
        border: 'border-slate-500/30',
        dot: 'bg-slate-400',
        text: 'text-slate-400'
      };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={`backdrop-blur-xl bg-gradient-to-br ${styles.bg} rounded-xl px-4 py-3 border ${styles.border} hover:bg-opacity-80 transition-all duration-300`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={`${styles.text}`}>
            {icon}
          </div>
          <div className={`absolute -top-1 -right-1 w-2 h-2 ${styles.dot} rounded-full`}></div>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="text-sm font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;