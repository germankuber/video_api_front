import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { AlertCircle, Hand, Pause, Play, RotateCcw, Camera, Zap, Target, History, TrendingUp } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type {
  DetectedGesture,
  GestureHistory
} from './types/mediapipe';

// Mapeo de gestos a emojis - EXPANDIDO
const GESTURE_EMOJIS: { [key: string]: string } = {
  // Gestos básicos
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
  
  // Números
  'one': '1️⃣',
  'two': '2️⃣', 
  'three': '3️⃣',
  'four': '4️⃣',
  'five': '5️⃣',
  'six': '6️⃣',
  'seven': '7️⃣',
  'eight': '8️⃣',
  'nine': '9️⃣',
  'ten': '🔟',
  
  // Gestos adicionales que MediaPipe puede reconocer
  'None': '🚫',
  'Closed_Fist': '✊',
  'Open_Palm': '🖐️',
  'Pointing_Up': '☝️',
  'Thumb_Down': '👎',
  'Thumb_Up': '👍',
  'Victory': '✌️',
  'ILoveYou': '🤟'
};

// Colores para las manos
const HAND_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

const GestureDetectionApp: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedGestures, setDetectedGestures] = useState<DetectedGesture[]>([]);
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [gestureHistory, setGestureHistory] = useState<GestureHistory[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentGestureDisplay, setCurrentGestureDisplay] = useState<DetectedGesture | null>(null);

  // Inicializar MediaPipe
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

  // Inicializar cámara
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
      
      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream;
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
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

  // Detectar gestos
  useEffect(() => {
    if (!gestureRecognizer || !isRecording) return;

    const detectGestures = () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
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
            
            // Actualizar gesto principal para display
            const bestGesture = newGestures.reduce((best, current) => 
              current.confidence > best.confidence ? current : best
            );
            setCurrentGestureDisplay(bestGesture);
            
            // Agregar al historial
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

            if (canvasRef.current && results.landmarks) {
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

  // Dibujar landmarks en canvas
  const drawLandmarks = (landmarks: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const video = videoRef.current;
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

  // Calcular estadísticas
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
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Ninguno';
    
    return { total, avgConfidence, mostCommon };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white border-opacity-20 border-t-white mx-auto"></div>
            <Hand className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Inicializando MediaPipe</h2>
          <p className="text-xl opacity-80">Preparando el reconocimiento de gestos...</p>
          <div className="flex justify-center mt-6 space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-pink-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white bg-opacity-10 rounded-3xl backdrop-blur-lg border border-white border-opacity-20">
          <AlertCircle className="h-20 w-20 text-red-300 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold text-white mb-4">¡Oops! Algo salió mal</h2>
          <p className="text-red-200 mb-6 text-lg">{error}</p>
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
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-purple-800 via-pink-700 to-red-700 shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <Hand className="h-12 w-12 text-white animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tight">
                Detector de Gestos
              </h1>
              <Zap className="h-12 w-12 text-yellow-300 animate-bounce" />
            </div>
            <p className="text-xl text-purple-100 mb-6">
              Reconocimiento de gestos en tiempo real con IA
            </p>
            
            {/* Estado del sistema */}
            <div className="flex justify-center gap-6 text-sm">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${gestureRecognizer ? 'bg-green-500' : 'bg-yellow-500'} bg-opacity-20 border border-white border-opacity-30`}>
                <div className={`w-2 h-2 rounded-full ${gestureRecognizer ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
                <span className="text-white font-medium">
                  IA: {gestureRecognizer ? 'Lista' : 'Cargando...'}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${stream ? 'bg-green-500' : 'bg-red-500'} bg-opacity-20 border border-white border-opacity-30`}>
                <Camera className={`w-4 h-4 ${stream ? 'text-green-400' : 'text-red-400'}`} />
                <span className="text-white font-medium">
                  Cámara: {stream ? 'Conectada' : 'Desconectada'}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-500'} bg-opacity-20 border border-white border-opacity-30`}>
                <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-white font-medium">
                  {isRecording ? 'Detectando' : 'En pausa'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Controles principales */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setIsRecording(!isRecording)}
            disabled={!stream || !gestureRecognizer}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
              isRecording 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
            } ${(!stream || !gestureRecognizer) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}
          >
            {isRecording ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            {isRecording ? 'Pausar Detección' : 'Iniciar Detección'}
          </button>
          
          <button
            onClick={clearHistory}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-lg"
          >
            <RotateCcw className="h-6 w-6" />
            Limpiar Historial
          </button>

          <button
            onClick={async () => {
              stopCamera();
              setTimeout(async () => {
                await startCamera();
              }, 200);
            }}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-lg"
          >
            <Camera className="h-6 w-6" />
            Reiniciar Cámara
          </button>
        </div>

        {/* Layout principal mejorado */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Video principal */}
          <div className="xl:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Cámara en Vivo</h2>
                {isRecording && (
                  <div className="flex items-center gap-2 bg-red-500 bg-opacity-20 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-sm font-medium">EN VIVO</span>
                  </div>
                )}
              </div>
              
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="block w-full h-auto"
                  style={{ 
                    aspectRatio: '4/3',
                    objectFit: 'cover'
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 pointer-events-none w-full h-full"
                />
                
                {!stream && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-lg">Iniciando cámara...</p>
                    </div>
                  </div>
                )}

                {/* Overlay de gestos en tiempo real */}
                {isRecording && detectedGestures.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-gradient-to-r from-black via-gray-900 to-black bg-opacity-95 rounded-2xl p-4 backdrop-blur-md border border-white border-opacity-10">
                      <div className="flex items-center gap-4 overflow-x-auto">
                        {detectedGestures.map((gesture, index) => (
                          <div key={index} className="flex items-center gap-3 min-w-max bg-white bg-opacity-10 rounded-xl p-3">
                            <span className="text-3xl">{GESTURE_EMOJIS[gesture.gesture] || '👋'}</span>
                            <div>
                              <p className="text-sm font-bold text-white capitalize">
                                {gesture.gesture.replace(/_/g, ' ')}
                              </p>
                              <p className="text-xs text-gray-300">
                                Mano {gesture.hand} • {(gesture.confidence * 100).toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gesto actual destacado */}
          <div className="xl:col-span-1">
            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl p-6 shadow-2xl text-white h-full min-h-[500px] relative overflow-hidden">
              {/* Efectos de fondo */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-600 opacity-30 animate-pulse"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-xl animate-ping"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full blur-xl animate-pulse"></div>
              
              <div className="relative z-10 text-center h-full flex flex-col justify-center">
                <div className="flex items-center gap-2 justify-center mb-6">
                  <Target className="h-6 w-6" />
                  <h2 className="text-2xl font-black">GESTO ACTUAL</h2>
                </div>
                
                {currentGestureDisplay ? (
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="text-8xl mb-4 transform transition-all duration-500 hover:scale-110">
                        {GESTURE_EMOJIS[currentGestureDisplay.gesture] || '👋'}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-40 border-4 border-white border-opacity-20 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-black capitalize">
                      {currentGestureDisplay.gesture.replace(/_/g, ' ')}
                    </h3>
                    
                    <div className="bg-black bg-opacity-30 rounded-2xl p-4">
                      <p className="text-lg font-bold mb-2">
                        Mano {currentGestureDisplay.hand === 1 ? 'Izquierda' : 'Derecha'}
                      </p>
                      <div className="bg-black bg-opacity-50 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-yellow-400 transition-all duration-300"
                          style={{ width: `${currentGestureDisplay.confidence * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm mt-2">
                        Confianza: {(currentGestureDisplay.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    {isRecording ? (
                      <div>
                        <div className="text-6xl mb-6 opacity-60 animate-pulse">🔍</div>
                        <h3 className="text-2xl font-bold mb-4">Buscando gestos...</h3>
                        <p className="text-lg opacity-80">Mueve tu mano frente a la cámara</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-6xl mb-6 opacity-50">⏸️</div>
                        <h3 className="text-2xl font-bold mb-4">Detección pausada</h3>
                        <p className="text-lg opacity-80">Presiona "Iniciar" para comenzar</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel de estadísticas y historial */}
          <div className="xl:col-span-1">
            <div className="space-y-6">
              {/* Estadísticas */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Estadísticas</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-opacity-20 rounded-xl p-4 border border-blue-500 border-opacity-30">
                    <p className="text-blue-300 text-sm font-medium">Total de Gestos</p>
                    <p className="text-3xl font-black text-white">{stats.total}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 bg-opacity-20 rounded-xl p-4 border border-green-500 border-opacity-30">
                    <p className="text-green-300 text-sm font-medium">Confianza Promedio</p>
                    <p className="text-3xl font-black text-white">{(stats.avgConfidence * 100).toFixed(1)}%</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-20 rounded-xl p-4 border border-purple-500 border-opacity-30">
                    <p className="text-purple-300 text-sm font-medium">Gesto Más Común</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl">{GESTURE_EMOJIS[stats.mostCommon] || '🤷'}</span>
                      <p className="text-lg font-bold text-white capitalize">
                        {stats.mostCommon.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historial reciente */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <History className="h-6 w-6 text-yellow-400" />
                    <h2 className="text-xl font-bold text-white">Historial Reciente</h2>
                  </div>
                  <span className="bg-yellow-500 bg-opacity-20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
                    {gestureHistory.length}
                  </span>
                </div>
                
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {gestureHistory.slice(0, 10).map((gesture, index) => (
                    <div 
                      key={gesture.id}
                      className="flex items-center gap-3 p-3 bg-gray-700 bg-opacity-50 rounded-xl hover:bg-opacity-70 transition-all duration-200"
                    >
                      <span className="text-2xl">{GESTURE_EMOJIS[gesture.gesture] || '👋'}</span>
                      <div className="flex-1">
                        <p className="text-white font-medium capitalize text-sm">
                          {gesture.gesture.replace(/_/g, ' ')}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {gesture.timestamp} • {(gesture.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">Mano {gesture.hand}</span>
                      </div>
                    </div>
                  ))}
                  
                  {gestureHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No hay gestos registrados</p>
                      <p className="text-sm">Inicia la detección para ver el historial</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gestos disponibles */}
        <div className="mt-12">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <Hand className="h-8 w-8 text-purple-400" />
                Gestos Disponibles
              </h2>
              <p className="text-gray-300 text-lg">
                Estos son todos los gestos que puedes probar con la aplicación
              </p>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
              {Object.entries(GESTURE_EMOJIS).map(([gestureName, emoji]) => (
                <div 
                  key={gestureName}
                  className="bg-gradient-to-br from-purple-600 to-pink-600 bg-opacity-20 rounded-2xl p-4 text-center border border-purple-500 border-opacity-30 hover:border-opacity-60 hover:bg-opacity-30 transform hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className="text-4xl mb-2">{emoji}</div>
                  <p className="text-xs font-medium text-gray-300 capitalize leading-tight">
                    {gestureName.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <div className="bg-blue-500 bg-opacity-20 rounded-2xl p-4 border border-blue-500 border-opacity-30">
                <p className="text-blue-300 font-medium">
                  💡 <strong>Consejo:</strong> Mantén tu mano bien visible y centrada frente a la cámara para obtener la mejor detección
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestureDetectionApp;