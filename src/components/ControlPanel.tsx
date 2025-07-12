import React from 'react';
import { Play, Pause, RotateCcw, Camera, Settings, Zap } from 'lucide-react';

interface ControlPanelProps {
  isRecording: boolean;
  isReady: boolean;
  onToggleRecording: () => void;
  onClearHistory: () => void;
  onRestartCamera: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isRecording,
  isReady,
  onToggleRecording,
  onClearHistory,
  onRestartCamera
}) => {
  return (
    <div className="flex justify-center gap-4 mb-8">
      {/* Main control button */}
      <button
        onClick={onToggleRecording}
        disabled={!isReady}
        className={`group relative flex items-center gap-4 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
          isRecording 
            ? 'bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40' 
            : 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
        } ${!isReady ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl'}`}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Icon */}
        <div className="relative z-10">
          {isRecording ? (
            <Pause className="h-7 w-7 animate-pulse" />
          ) : (
            <Play className="h-7 w-7 group-hover:animate-bounce" />
          )}
        </div>
        
        {/* Text */}
        <span className="relative z-10">
          {isRecording ? 'Pausar Detección' : 'Iniciar Detección'}
        </span>
        
        {/* Status indicator */}
        {isRecording && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
        )}
      </button>
      
      {/* Secondary controls */}
      <div className="flex gap-3">
        <ControlButton
          icon={<RotateCcw className="h-6 w-6" />}
          label="Limpiar"
          onClick={onClearHistory}
          color="from-gray-600 to-gray-700"
          hoverColor="from-gray-700 to-gray-800"
        />
        
        <ControlButton
          icon={<Camera className="h-6 w-6" />}
          label="Cámara"
          onClick={onRestartCamera}
          color="from-blue-500 to-cyan-500"
          hoverColor="from-blue-600 to-cyan-600"
        />
        
        <ControlButton
          icon={<Settings className="h-6 w-6" />}
          label="Config"
          onClick={() => {/* TODO: Add settings */}}
          color="from-purple-500 to-indigo-500"
          hoverColor="from-purple-600 to-indigo-600"
        />
      </div>
    </div>
  );
};

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
  hoverColor: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ 
  icon, 
  label, 
  onClick, 
  color, 
  hoverColor 
}) => {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-6 py-4 bg-gradient-to-r ${color} hover:${hoverColor} text-white rounded-2xl transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-lg backdrop-blur-md border border-white/10`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="group-hover:animate-pulse">
          {icon}
        </div>
        <span className="hidden sm:block">{label}</span>
      </div>
    </button>
  );
};

export default ControlPanel;