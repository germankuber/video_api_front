import React, { forwardRef } from 'react';
import { Camera, Play, Pause } from 'lucide-react';
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
      <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Camera className="h-6 w-6 text-white" />
                {stream && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Live Camera Feed</h3>
                <p className="text-sm text-slate-400">Real-time gesture detection</p>
              </div>
            </div>
            
            {isRecording && (
              <div className="flex items-center gap-2 bg-red-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-red-500/30">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                <span className="text-red-400 text-sm font-bold uppercase tracking-wide">Recording</span>
              </div>
            )}
          </div>
        </div>

        {/* Video container */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-black">
          {/* Video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Canvas overlay */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />

          {/* Loading state */}
          {!stream && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/95 to-black/95 backdrop-blur-sm">
              <div className="text-center text-white">
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-white/10 border-t-violet-500 rounded-full animate-spin mx-auto"></div>
                  <Camera className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-violet-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Initializing Camera</h3>
                <p className="text-slate-400">Setting up video feed...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/95 to-black/95 backdrop-blur-sm">
              <div className="text-center text-white max-w-md px-6">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="h-10 w-10 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-red-400">Camera Error</h3>
                <p className="text-slate-300">{error}</p>
              </div>
            </div>
          )}

          {/* Gesture overlay */}
          {isRecording && detectedGestures.length > 0 && (
            <GestureOverlay gestures={detectedGestures} />
          )}

          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-violet-400/50"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-violet-400/50"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-violet-400/50"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-violet-400/50"></div>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-4 text-slate-400">
              <span>Resolution: 640x480</span>
              <span>FPS: 30</span>
            </div>
            <div className={`flex items-center gap-2 ${stream ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${stream ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="font-medium">{stream ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoFeed.displayName = 'VideoFeed';

export default VideoFeed;