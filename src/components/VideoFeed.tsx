import React, { forwardRef } from 'react';
import { Camera, Wifi } from 'lucide-react';
import type { DetectedGesture } from '../types/mediapipe';
import GestureOverlay from './GestureOverlay';

interface VideoFeedProps {
  stream: MediaStream | null;
  error: string | null;
  isRecording: boolean;
  detectedGestures: DetectedGesture[];
}

const VideoFeed = forwardRef<{
  video: HTMLVideoElement | null;
  canvas: HTMLCanvasElement | null;
}, VideoFeedProps>(({ stream, error, isRecording, detectedGestures }, ref) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useImperativeHandle(ref, () => ({
    video: videoRef.current,
    canvas: canvasRef.current,
  }));

  return (
    <div className="relative group">
      {/* Glass card container */}
      <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Camera className="h-6 w-6 text-blue-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <h2 className="text-2xl font-bold text-white">Cámara en Vivo</h2>
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-2 backdrop-blur-md bg-red-500/20 px-4 py-2 rounded-full border border-red-500/30">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
              <Wifi className="h-4 w-4 text-red-400" />
              <span className="text-red-400 text-sm font-bold">EN VIVO</span>
            </div>
          )}
        </div>

        {/* Video container */}
        <div className="relative rounded-2xl overflow-hidden bg-black/50 backdrop-blur-sm border border-white/10">
          {/* Video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto aspect-video object-cover"
          />
          
          {/* Canvas overlay */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />

          {/* Loading state */}
          {!stream && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/90 to-purple-900/90 backdrop-blur-sm">
              <div className="text-center text-white">
                <div className="relative mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-blue-400 mx-auto"></div>
                  <Camera className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-400" />
                </div>
                <p className="text-xl font-semibold">Iniciando cámara...</p>
                <p className="text-sm text-slate-300 mt-2">Preparando el feed de video</p>
              </div>
            </div>
          )}

          {/* Gesture overlay */}
          {isRecording && detectedGestures.length > 0 && (
            <GestureOverlay gestures={detectedGestures} />
          )}

          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-blue-400/50 rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-blue-400/50 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-blue-400/50 rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-blue-400/50 rounded-br-lg"></div>
        </div>

        {/* Video info */}
        <div className="mt-4 flex justify-between items-center text-sm text-slate-400">
          <span>Resolución: 640x480</span>
          <span>FPS: 30</span>
          <span className={`flex items-center gap-1 ${stream ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${stream ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            {stream ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>
    </div>
  );
});

VideoFeed.displayName = 'VideoFeed';

export default VideoFeed;