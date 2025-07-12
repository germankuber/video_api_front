import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { DetectedGesture, GestureHistory } from './types/mediapipe';
import CameraMockup from './pages/CameraMockup';

// Components
import Header from './components/Header';
import VideoFeed from './components/VideoFeed';
import CurrentGesture from './components/CurrentGesture';
import Statistics from './components/Statistics';
import GestureHistory from './components/GestureHistory';
import ControlPanel from './components/ControlPanel';
import GestureGallery from './components/GestureGallery';
import { AlertCircle, Loader2 } from 'lucide-react';

// Hand colors for landmarks
const HAND_COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'];

const GestureDetectionApp: React.FC = () => {
  const [showMockup, setShowMockup] = useState(false);
  const videoFeedRef = useRef<{
    video: HTMLVideoElement | null;
    canvas: HTMLCanvasElement | null;
  }>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedGestures, setDetectedGestures] = useState<DetectedGesture[]>([]);
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [gestureHistory, setGestureHistory] = useState<GestureHistory[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentGestureDisplay, setCurrentGestureDisplay] = useState<DetectedGesture | null>(null);

  // Initialize MediaPipe
  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        setGestureRecognizer(recognizer);
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing MediaPipe:', err);
        setError('Failed to load AI engine. Please check your internet connection.');
        setIsLoading(false);
      }
    };

    initializeMediaPipe();
  }, []);

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not available in this browser');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      if (videoFeedRef.current?.video && mediaStream) {
        videoFeedRef.current.video.srcObject = mediaStream;
        
        videoFeedRef.current.video.onloadedmetadata = () => {
          if (videoFeedRef.current?.video) {
            videoFeedRef.current.video.play()
              .then(() => console.log('Video playing successfully'))
              .catch(error => console.error('Error playing video:', error));
          }
        };
        
        setStream(mediaStream);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Failed to access camera.';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera access and reload the page.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is being used by another application. Please close other apps using the camera.';
        } else {
          errorMessage = `Camera error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoFeedRef.current?.video) {
      videoFeedRef.current.video.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    let isMounted = true;
    
    const initCamera = async () => {
      if (isMounted) {
        await startCamera();
      }
    };
    
    initCamera();
    
    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Detect gestures
  useEffect(() => {
    if (!gestureRecognizer || !isRecording) return;

    const detectGestures = () => {
      if (videoFeedRef.current?.video && videoFeedRef.current.video.readyState === 4) {
        const video = videoFeedRef.current.video;
        const timestamp = Date.now();

        try {
          const results = gestureRecognizer.recognizeForVideo(video, timestamp);
          
          if (results.gestures && results.gestures.length > 0) {
            const newGestures: DetectedGesture[] = results.gestures.map((gesture: any[], index: number) => ({
              hand: index + 1,
              gesture: gesture[0].categoryName,
              confidence: gesture[0].score,
              timestamp: new Date().toLocaleTimeString()
            }));

            setDetectedGestures(newGestures);
            
            // Update main gesture for display
            const bestGesture = newGestures.reduce((best, current) => 
              current.confidence > best.confidence ? current : best
            );
            setCurrentGestureDisplay(bestGesture);
            
            // Add to history
            newGestures.forEach(g => {
              if (g.confidence > 0.7) {
                const historyItem: GestureHistory = {
                  ...g,
                  id: `${Date.now()}-${Math.random()}`
                };
                
                setGestureHistory(prev => {
                  const newHistory = [historyItem, ...prev].slice(0, 50);
                  return newHistory;
                });
              }
            });

            if (videoFeedRef.current?.canvas && results.landmarks) {
              drawLandmarks(results.landmarks);
            }
          } else {
            setDetectedGestures([]);
            setCurrentGestureDisplay(null);
          }
        } catch (err) {
          console.error('Error detecting gestures:', err);
        }
      }
    };

    const interval = setInterval(detectGestures, 100);
    return () => clearInterval(interval);
  }, [gestureRecognizer, isRecording]);

  // Draw landmarks on canvas
  const drawLandmarks = (landmarks: any[]) => {
    const canvas = videoFeedRef.current?.canvas;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const video = videoFeedRef.current?.video;
    if (!video) return;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    landmarks.forEach((handLandmarks, handIndex) => {
      const color = HAND_COLORS[handIndex % HAND_COLORS.length];
      
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      
      handLandmarks.forEach((landmark: any) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 5;
      
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
      ];
      
      connections.forEach(([start, end]) => {
        const startPoint = handLandmarks[start];
        const endPoint = handLandmarks[end];
        ctx.beginPath();
        ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
        ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
        ctx.stroke();
      });
      
      ctx.shadowBlur = 0;
    });
  };

  const clearHistory = () => {
    setGestureHistory([]);
  };

  const restartApp = () => {
    setIsRecording(false);
    clearHistory();
    setDetectedGestures([]);
    setCurrentGestureDisplay(null);
    setError(null);
  };

  // Toggle between main app and mockup
  if (showMockup) {
    return <CameraMockup />;
  }

  const restartCamera = async () => {
    stopCamera();
    setTimeout(async () => {
      await startCamera();
    }, 200);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-white/10 border-t-violet-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Initializing GestureAI
          </h2>
          <p className="text-xl text-slate-300 mb-6">Loading AI engine and camera systems...</p>
          <div className="flex justify-center mt-6 space-x-2">
            <div className="w-3 h-3 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-black/50 backdrop-blur-xl rounded-3xl border border-white/10">
          <AlertCircle className="h-20 w-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">System Error</h2>
          <p className="text-red-300 mb-6 text-lg">{error}</p>
          <button 
            onClick={restartApp}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Retry System
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black">
      {/* Header */}
      <Header 
        isAiReady={!!gestureRecognizer}
        isCameraConnected={!!stream}
        isRecording={isRecording}
      />

      {/* Toggle button for mockup */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowMockup(!showMockup)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform"
        >
          View Mockup
        </button>
      </div>

      <div className="container mx-auto px-8 py-12">
        {/* Control Panel */}
        <ControlPanel
          isRecording={isRecording}
          isReady={!!stream && !!gestureRecognizer}
          onToggleRecording={() => setIsRecording(!isRecording)}
          onClearHistory={clearHistory}
          onRestartCamera={restartCamera}
        />

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
          {/* Video Feed */}
          <div className="xl:col-span-7">
            <VideoFeed
              ref={videoFeedRef}
              stream={stream}
              error={error}
              isRecording={isRecording}
              detectedGestures={detectedGestures}
            />
          </div>

          {/* Right Panel */}
          <div className="xl:col-span-5 space-y-8">
            {/* Current Gesture */}
            <CurrentGesture
              gesture={currentGestureDisplay}
              isRecording={isRecording}
            />

            {/* Statistics */}
            <Statistics gestureHistory={gestureHistory} />
          </div>
        </div>

        {/* History */}
        <div className="mb-12">
          <GestureHistory
            gestureHistory={gestureHistory}
            onClearHistory={clearHistory}
          />
        </div>

        {/* Gesture Gallery */}
        <GestureGallery />
      </div>
    </div>
  );
};

export default GestureDetectionApp;