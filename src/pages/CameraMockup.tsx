import React from 'react';
import { 
  Camera, 
  Play, 
  Pause, 
  Settings, 
  Maximize, 
  Volume2, 
  Wifi, 
  Battery, 
  Signal,
  Record,
  Square,
  RotateCcw,
  Zap,
  Eye,
  Target,
  Activity,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';

const CameraMockup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 left-40 w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 p-8">
        {/* Top status bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">LIVE</span>
            </div>
            <div className="text-white/60 text-sm">12:34:56</div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-white/80">
              <Wifi className="h-4 w-4" />
              <Signal className="h-4 w-4" />
              <Battery className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-12 gap-8 h-[calc(100vh-120px)]">
          {/* Left sidebar */}
          <div className="col-span-3 space-y-6">
            {/* Camera controls */}
            <div className="bg-black/20 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Camera Control</h3>
                  <p className="text-white/60 text-sm">Professional Settings</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                  <Record className="h-4 w-4" />
                  Start Recording
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-white/10 backdrop-blur-md text-white py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center">
                    <Play className="h-4 w-4" />
                  </button>
                  <button className="bg-white/10 backdrop-blur-md text-white py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center">
                    <Square className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Resolution</span>
                    <span className="text-white">4K Ultra HD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">FPS</span>
                    <span className="text-white">60 fps</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Quality</span>
                    <span className="text-green-400">Excellent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Detection */}
            <div className="bg-black/20 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">AI Detection</h3>
                  <p className="text-white/60 text-sm">Neural Engine</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">Active</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Confidence</span>
                    <span className="text-white">94.2%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full w-[94%] animate-pulse"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-white/60">Hands</div>
                    <div className="text-white font-bold">2</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-white/60">Gestures</div>
                    <div className="text-white font-bold">5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Main camera view */}
          <div className="col-span-6">
            <div className="relative h-full bg-black/30 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Camera frame */}
              <div className="absolute inset-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden">
                {/* Simulated video feed */}
                <div className="w-full h-full bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-pink-900/50 relative">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-3 grid-rows-3 h-full">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-white/20"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Gesture detection overlay */}
                  <div className="absolute top-8 left-8">
                    <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl animate-bounce">👍</div>
                        <div>
                          <div className="text-white font-bold">Thumbs Up</div>
                          <div className="text-green-400 text-sm">Confidence: 94.2%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hand tracking points */}
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                      {/* Hand outline simulation */}
                      <div className="w-32 h-40 relative">
                        {[...Array(21)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Recording indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2 bg-red-500/20 backdrop-blur-md rounded-full px-3 py-1 border border-red-500/30">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                      <span className="text-red-400 text-sm font-bold">REC</span>
                    </div>
                  </div>
                  
                  {/* Corner focus indicators */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-400"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-400"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-400"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-400"></div>
                </div>
              </div>
              
              {/* Camera controls overlay */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-4 bg-black/50 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20">
                  <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Settings className="h-5 w-5 text-white" />
                  </button>
                  <button className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                  </button>
                  <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <RotateCcw className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="col-span-3 space-y-6">
            {/* Current gesture */}
            <div className="bg-black/20 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Current Gesture</h3>
                  <p className="text-white/60 text-sm">Real-time Detection</p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="text-6xl animate-bounce">👍</div>
                <div>
                  <h4 className="text-white text-xl font-bold">Thumbs Up</h4>
                  <p className="text-green-400 text-sm">94.2% Confidence</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Hand</span>
                    <span className="text-white">Right</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Time</span>
                    <span className="text-white">12:34:56</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-black/20 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Analytics</h3>
                  <p className="text-white/60 text-sm">Performance Metrics</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-white">127</div>
                    <div className="text-white/60 text-xs">Total Gestures</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">92.4%</div>
                    <div className="text-white/60 text-xs">Avg Accuracy</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Session Time</span>
                    <span className="text-white">15:42</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Most Common</span>
                    <span className="text-white">👍 Thumbs Up</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-300 text-sm font-medium">Achievement</span>
                  </div>
                  <p className="text-white text-sm">100 Gestures Detected!</p>
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-black/20 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-white font-bold text-sm">Recent Activity</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { emoji: '👍', name: 'Thumbs Up', time: '12:34', confidence: 94 },
                  { emoji: '✌️', name: 'Victory', time: '12:33', confidence: 89 },
                  { emoji: '👌', name: 'OK Sign', time: '12:32', confidence: 96 },
                ].map((gesture, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                    <span className="text-lg">{gesture.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs font-medium truncate">{gesture.name}</div>
                      <div className="text-white/60 text-xs">{gesture.time}</div>
                    </div>
                    <div className="text-green-400 text-xs font-bold">{gesture.confidence}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraMockup;