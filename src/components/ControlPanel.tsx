import React from 'react';
import { Play, Pause, RotateCcw, Camera, Settings, Zap, Power } from 'lucide-react';

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
    <div className="flex justify-center mb-12">
      <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          {/* Main control button */}
          <button
            onClick={onToggleRecording}
            disabled={!isReady}
            className={`group relative flex items-center gap-4 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
              isRecording 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40' 
                : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
            } ${!isReady ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl'}`}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Icon */}
            <div className="relative z-10">
              {isRecording ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </div>
            
            {/* Text */}
            <span className="relative z-10">
              {isRecording ? 'Stop Detection' : 'Start Detection'}
            </span>
            
            {/* Status indicator */}
            {isRecording && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
            )}
          </button>
          
          {/* Secondary controls */}
          <div className="flex gap-3">
            <ControlButton
              icon={<RotateCcw className="h-5 w-5" />}
              label="Clear"
              onClick={onClearHistory}
              variant="secondary"
            />
            
            <ControlButton
              icon={<Camera className="h-5 w-5" />}
              label="Reset Camera"
              onClick={onRestartCamera}
              variant="secondary"
            />
            
            <ControlButton
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              onClick={() => {/* TODO: Add settings */}}
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const ControlButton: React.FC<ControlButtonProps> = ({ 
  icon, 
  label, 
  onClick, 
  variant = 'secondary' 
}) => {
  const baseClasses = "group relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 font-medium border";
  
  const variantClasses = variant === 'primary' 
    ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white border-violet-500/30 hover:shadow-violet-500/25"
    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
      title={label}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
        <span className="hidden sm:block">{label}</span>
      </div>
    </button>
  );
};

export default ControlPanel;