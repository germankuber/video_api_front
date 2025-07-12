import React from 'react';
import { Camera, Zap, Activity, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  isAiReady: boolean;
  isCameraConnected: boolean;
  isRecording: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAiReady, isCameraConnected, isRecording }) => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-white/10">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex flex-col items-center text-center">
          {/* Logo and title */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full">
                <Activity className="h-12 w-12 text-white animate-bounce" />
              </div>
            </div>
            
            <div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                GestureAI
              </h1>
              <p className="text-xl text-slate-300 font-light">
                Reconocimiento de gestos con inteligencia artificial
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-pink-500 to-red-500 p-4 rounded-full">
                <Zap className="h-12 w-12 text-white animate-pulse" />
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex gap-6">
            <StatusIndicator
              icon={<Activity className="h-5 w-5" />}
              label="IA"
              status={isAiReady ? 'ready' : 'loading'}
              value={isAiReady ? 'Lista' : 'Cargando...'}
            />
            
            <StatusIndicator
              icon={isCameraConnected ? <Camera className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
              label="Cámara"
              status={isCameraConnected ? 'ready' : 'error'}
              value={isCameraConnected ? 'Conectada' : 'Desconectada'}
            />
            
            <StatusIndicator
              icon={isRecording ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
              label="Estado"
              status={isRecording ? 'recording' : 'paused'}
              value={isRecording ? 'Detectando' : 'En pausa'}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

interface StatusIndicatorProps {
  icon: React.ReactNode;
  label: string;
  status: 'ready' | 'loading' | 'error' | 'recording' | 'paused';
  value: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ icon, label, status, value }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'ready': return 'from-green-500 to-emerald-500';
      case 'loading': return 'from-yellow-500 to-orange-500';
      case 'error': return 'from-red-500 to-pink-500';
      case 'recording': return 'from-red-500 to-pink-500';
      case 'paused': return 'from-gray-500 to-slate-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getIndicatorAnimation = () => {
    switch (status) {
      case 'loading': return 'animate-pulse';
      case 'recording': return 'animate-ping';
      default: return '';
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-2xl px-6 py-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className={`relative p-2 rounded-full bg-gradient-to-r ${getStatusColor()}`}>
          {icon}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${getStatusColor()} opacity-50 ${getIndicatorAnimation()}`}></div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-300">{label}</p>
          <p className="text-white font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;