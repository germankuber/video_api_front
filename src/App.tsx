import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { DetectedGesture, GestureHistory } from './types/mediapipe';

// Components
import Header from './components/Header';
import VideoFeed from './components/VideoFeed';
import CurrentGesture from './components/CurrentGesture';
import Statistics from './components/Statistics';
import GestureHistory from './components/GestureHistory';
import ControlPanel from './components/ControlPanel';
import GestureGallery from './components/GestureGallery';
import { AlertCircle } from 'lucide-react';

// Hand colors for landmarks
const HAND_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

const GestureDetectionApp: React.FC = () => {
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
        console.error('Error inicializando MediaPipe:', err);
        setError('Error al cargar MediaPipe. Verifica tu conexión a internet.');
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
        throw new Error('getUserMedia no está disponible en este navegador');
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
              .then(() => console.log('Video reproduciendo correctamente'))
              .catch(error => console.error('Error al reproducir video:', error));
          }
        };
        
        setStream(mediaStream);
        setError(null);
      }
    } catch (err) {
      console.error('Error accediendo a la cámara:', err);
      let errorMessage = 'Error al acceder a la cámara.';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara y recarga la página.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No se encontró ninguna cámara. Verifica que tu dispositivo tenga una cámara conectada.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'La cámara está siendo usada por otra aplicación. Cierra otras apps que puedan estar usando la cámara.';
        } else {
          errorMessage = `Error de cámara: ${err.message}`;
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
          console.error('Error detectando gestos:', err);
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

  const restartCamera = async () => {
    stopCamera();
    setTimeout(async () => {
      await startCamera();
    }, 200);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-white/20 border-t-purple-400 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Inicializando GestureAI
          </h2>
          <p className="text-xl text-slate-300 mb-6">Preparando el reconocimiento de gestos...</p>
          <div className="flex justify-center mt-6 space-x-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10">
          <AlertCircle className="h-20 w-20 text-red-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold text-white mb-4">¡Oops! Algo salió mal</h2>
          <p className="text-red-300 mb-6 text-lg">{error}</p>
          <button 
            onClick={restartApp}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <Header 
        isAiReady={!!gestureRecognizer}
        isCameraConnected={!!stream}
        isRecording={isRecording}
      />

      <div className="container mx-auto px-6 py-8">
        {/* Control Panel */}
        <ControlPanel
          isRecording={isRecording}
          isReady={!!stream && !!gestureRecognizer}
          onToggleRecording={() => setIsRecording(!isRecording)}
          onClearHistory={clearHistory}
          onRestartCamera={restartCamera}
        />

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
          {/* Video Feed */}
          <div className="xl:col-span-6">
            <VideoFeed
              ref={videoFeedRef}
              stream={stream}
              error={error}
              isRecording={isRecording}
              detectedGestures={detectedGestures}
            />
          </div>

          {/* Current Gesture */}
          <div className="xl:col-span-3">
            <CurrentGesture
              gesture={currentGestureDisplay}
              isRecording={isRecording}
            />
          </div>

          {/* Statistics */}
          <div className="xl:col-span-3">
            <Statistics gestureHistory={gestureHistory} />
          </div>
        </div>

        {/* History */}
        <div className="mb-8">
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