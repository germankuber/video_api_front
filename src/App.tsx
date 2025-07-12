// App.tsx
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { AlertCircle, Hand, Pause, Play, RotateCcw } from 'lucide-react';
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

  // Inicializar MediaPipe
  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        // Usar FilesetResolver para inicializar MediaPipe
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        // Crear el reconocedor de gestos
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
      console.log('Solicitando acceso a la cámara...');
      
      // Detener stream existente si lo hay
      if (stream) {
        console.log('Deteniendo stream existente...');
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      // Verificar si getUserMedia está disponible
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
      
      console.log('Cámara obtenida exitosamente:', mediaStream);
      console.log('Tracks de video:', mediaStream.getVideoTracks());
      
      if (videoRef.current && mediaStream) {
        console.log('Asignando stream al elemento video...');
        videoRef.current.srcObject = mediaStream;
        
        // Asegurar que el video se reproduzca
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata cargada, iniciando reproducción...');
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => console.log('Video reproduciendo correctamente'))
              .catch(error => console.error('Error al reproducir video:', error));
          }
        };
        
        setStream(mediaStream);
        setError(null); // Limpiar cualquier error previo
        console.log('Stream asignado correctamente al estado');
      } else {
        console.error('videoRef.current no está disponible o mediaStream es null');
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

  // Parar cámara
  const stopCamera = useCallback(() => {
    if (stream) {
      console.log('Deteniendo stream de cámara...');
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Inicializar cámara solo una vez al montar el componente
  useEffect(() => {
    let isMounted = true;
    
    const initCamera = async () => {
      if (isMounted) {
        await startCamera();
      }
    };
    
    initCamera();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (stream) {
        console.log('Limpiando stream al desmontar...');
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Sin dependencias para que solo se ejecute una vez

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
            
            // Agregar al historial
            newGestures.forEach(g => {
              if (g.confidence > 0.7) {
                const historyItem: GestureHistory = {
                  ...g,
                  id: `${Date.now()}-${Math.random()}`
                };
                
                setGestureHistory(prev => {
                  const newHistory = [historyItem, ...prev].slice(0, 20);
                  return newHistory;
                });
              }
            });

            // Dibujar landmarks
            if (canvasRef.current && results.landmarks) {
              drawLandmarks(results.landmarks);
            }
          } else {
            setDetectedGestures([]);
          }
        } catch (err) {
          console.error('Error detectando gestos:', err);
        }
      }
    };

    const interval = setInterval(detectGestures, 100);
    return () => clearInterval(interval);
  }, [gestureRecognizer, isRecording]);

  // Calcular estadísticas (simplificado)
  useEffect(() => {
    // Solo mantenemos el historial actualizado, sin estadísticas complejas
    if (gestureHistory.length > 20) {
      setGestureHistory(prev => prev.slice(0, 20));
    }
  }, [gestureHistory]);

  // Dibujar landmarks en canvas
  const drawLandmarks = (landmarks: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Obtener las dimensiones del video
    const video = videoRef.current;
    if (!video) return;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    landmarks.forEach((handLandmarks, handIndex) => {
      const color = HAND_COLORS[handIndex % HAND_COLORS.length];
      
      // Dibujar puntos con efecto de brillo
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
      
      // Dibujar conexiones con gradiente
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 5;
      
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Pulgar
        [0, 5], [5, 6], [6, 7], [7, 8], // Índice
        [0, 9], [9, 10], [10, 11], [11, 12], // Medio
        [0, 13], [13, 14], [14, 15], [15, 16], // Anular
        [0, 17], [17, 18], [18, 19], [19, 20], // Meñique
      ];
      
      connections.forEach(([start, end]) => {
        const startPoint = handLandmarks[start];
        const endPoint = handLandmarks[end];
        ctx.beginPath();
        ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
        ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
        ctx.stroke();
      });
      
      // Resetear sombras
      ctx.shadowBlur = 0;
    });
  };

  // Limpiar historial
  const clearHistory = () => {
    setGestureHistory([]);
  };

  // Reiniciar aplicación
  const restartApp = () => {
    setIsRecording(false);
    clearHistory();
    setDetectedGestures([]);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Cargando MediaPipe...</p>
          <p className="text-sm text-gray-500 mt-2">Esto puede tardar unos segundos</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={restartApp}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Hand className="h-10 w-10 text-purple-600" />
            Detector de Gestos
          </h1>
          <p className="text-gray-600">Detecta gestos de manos en tiempo real con MediaPipe</p>
          
          {/* Información de estado */}
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span className={`px-3 py-1 rounded-full ${gestureRecognizer ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              MediaPipe: {gestureRecognizer ? 'Cargado' : 'Cargando...'}
            </span>
            <span className={`px-3 py-1 rounded-full ${stream ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              Cámara: {stream ? 'Conectada' : 'Desconectada'}
            </span>
          </div>
        </div>

        {/* Controles */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setIsRecording(!isRecording)}
            disabled={!stream || !gestureRecognizer}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            } ${(!stream || !gestureRecognizer) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {isRecording ? 'Pausar' : 'Iniciar'}
          </button>
          
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            Limpiar
          </button>

          <button
            onClick={async () => {
              console.log('Reiniciando cámara desde botón...');
              stopCamera();
              setTimeout(async () => {
                await startCamera();
              }, 200);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            Reiniciar Cámara
          </button>
        </div>

        {/* Área principal con video y gesto actual */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Video */}
          <div className="lg:col-span-2">
            <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
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
                onLoadedData={() => console.log('Video data loaded')}
                onCanPlay={() => console.log('Video can play')}
                onError={(e) => console.error('Video error:', e)}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 pointer-events-none w-full h-full"
              />
              
              {/* Indicador de estado de la cámara */}
              {!stream && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 text-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Iniciando cámara...</p>
                  </div>
                </div>
              )}
              
              {/* Indicador de grabación */}
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  GRABANDO
                </div>
              )}

              {/* Overlay de gestos detectados en tiempo real - MEJORADO */}
              {isRecording && detectedGestures.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-gradient-to-r from-black via-gray-900 to-black bg-opacity-90 rounded-2xl p-4 text-white backdrop-blur-sm border border-white border-opacity-20">
                    <div className="flex items-center gap-4 overflow-x-auto">
                      {detectedGestures.map((gesture, index) => (
                        <div key={index} className="flex items-center gap-3 min-w-max bg-white bg-opacity-10 rounded-xl p-3 transform transition-all duration-300 hover:scale-105">
                          <span className="text-4xl animate-pulse">{GESTURE_EMOJIS[gesture.gesture] || GESTURE_EMOJIS[gesture.gesture.toLowerCase()] || '👋'}</span>
                          <div>
                            <p className="text-sm font-bold capitalize">{gesture.gesture.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-gray-300">Mano {gesture.hand} • {(gesture.confidence * 100).toFixed(0)}%</p>
                            <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden mt-1">
                              <div 
                                className="h-full bg-gradient-to-r from-green-400 to-yellow-400 transition-all duration-300"
                                style={{ width: `${gesture.confidence * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel de Gesto Actual - ULTRA MEJORADO Y SÚPER ATRACTIVO */}
          <div className="lg:col-span-1">
            <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 rounded-3xl shadow-2xl p-8 text-white text-center h-full flex flex-col justify-center min-h-[600px] border-4 border-white border-opacity-30 overflow-hidden">
              {/* Efectos de fondo animados */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-600 opacity-80 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-xl animate-ping" style={{ animationDelay: '0s' }}></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full blur-xl animate-ping" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white bg-opacity-5 rounded-full blur-2xl animate-pulse"></div>
              
              {/* Contenido principal */}
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-8 text-shadow-lg tracking-wider">
                  🎯 GESTO ACTUAL
                </h2>
                
                {isRecording && detectedGestures.length > 0 ? (
                  <div className="space-y-8">
                    {detectedGestures.map((gesture, index) => (
                      <div key={index} className="transform transition-all duration-700 hover:scale-110">
                        {/* Emoji gigante con efectos espectaculares */}
                        <div className="relative mb-8">
                          {/* Anillos animados alrededor del emoji */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-48 border-4 border-white border-opacity-30 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                            <div className="absolute w-56 h-56 border-2 border-yellow-300 border-opacity-50 rounded-full animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}></div>
                            <div className="absolute w-64 h-64 border border-pink-300 border-opacity-30 rounded-full animate-pulse"></div>
                          </div>
                          
                          {/* Glow effect */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-40 h-40 bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 rounded-full opacity-30 blur-3xl animate-pulse"></div>
                          </div>
                          
                          {/* Emoji principal */}
                          <div className="relative text-[120px] leading-none drop-shadow-2xl transform transition-all duration-500 hover:rotate-12">
                            <span className="inline-block animate-bounce" style={{ textShadow: '0 0 30px rgba(255,255,255,0.5)' }}>
                              {GESTURE_EMOJIS[gesture.gesture] || GESTURE_EMOJIS[gesture.gesture.toLowerCase()] || '👋'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Nombre del gesto con efectos */}
                        <div className="mb-6">
                          <h3 className="text-5xl font-black mb-2 capitalize tracking-wide transform transition-all duration-500 hover:scale-105" 
                              style={{ 
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.3)',
                                background: 'linear-gradient(45deg, #FFD700, #FF69B4, #00BFFF)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundSize: '200% 200%',
                                animation: 'gradient 3s ease infinite'
                              }}>
                            {gesture.gesture.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}
                          </h3>
                        </div>
                        
                        {/* Información de mano mejorada */}
                        <div className="bg-black bg-opacity-30 rounded-2xl p-4 mb-6 backdrop-blur-md border border-white border-opacity-20">
                          <p className="text-2xl font-black flex items-center justify-center gap-3">
                            <span className="animate-pulse">
                              {gesture.hand === 1 ? '👈' : '👉'}
                            </span>
                            <span>
                              {gesture.hand === 1 ? 'MANO IZQUIERDA' : 'MANO DERECHA'}
                            </span>
                          </p>
                        </div>
                        
                        {/* Barra de confianza súper mejorada */}
                        <div className="bg-black bg-opacity-30 rounded-2xl p-6 backdrop-blur-md border border-white border-opacity-20">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-black">CONFIANZA</span>
                            <span className="text-3xl font-black bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
                              {(gesture.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          
                          {/* Barra animada espectacular */}
                          <div className="relative bg-black bg-opacity-50 rounded-full h-8 overflow-hidden border-2 border-white border-opacity-20">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full transition-all duration-1000 flex items-center justify-end pr-3 relative overflow-hidden"
                              style={{ width: `${gesture.confidence * 100}%` }}
                            >
                              {/* Efecto de brillo que se mueve */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-pulse"></div>
                              
                              <span className="text-lg font-black text-white drop-shadow-lg z-10">
                                {gesture.confidence > 0.8 ? '🔥' : gesture.confidence > 0.6 ? '✨' : gesture.confidence > 0.4 ? '👌' : '📊'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Indicadores de calidad */}
                          <div className="flex justify-center mt-3">
                            <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                              gesture.confidence > 0.8 ? 'bg-green-500 text-white animate-pulse' :
                              gesture.confidence > 0.6 ? 'bg-yellow-500 text-black' :
                              'bg-orange-500 text-white'
                            }`}>
                              {gesture.confidence > 0.8 ? '🎯 EXCELENTE' :
                               gesture.confidence > 0.6 ? '✅ BUENO' :
                               '⚠️ REGULAR'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Timestamp con mejor estilo */}
                        <div className="mt-6">
                          <p className="text-lg bg-black bg-opacity-30 rounded-full px-6 py-2 inline-block backdrop-blur-md border border-white border-opacity-20 font-bold">
                            <span className="animate-pulse">⏰</span> {gesture.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12">
                    {isRecording ? (
                      <div className="animate-pulse">
                        {/* Ícono de búsqueda animado */}
                        <div className="relative mb-8">
                          <div className="text-[100px] mb-6 opacity-60 transform transition-all duration-1000 hover:scale-110">
                            <span className="inline-block animate-spin">🔍</span>
                          </div>
                          {/* Ondas de radar */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-32 h-32 border-4 border-white border-opacity-20 rounded-full animate-ping"></div>
                            <div className="absolute top-4 left-4 w-24 h-24 border-2 border-white border-opacity-30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                            <div className="absolute top-8 left-8 w-16 h-16 border border-white border-opacity-40 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                          </div>
                        </div>
                        
                        <h3 className="text-3xl font-black mb-6 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                          BUSCANDO GESTOS...
                        </h3>
                        <p className="text-xl opacity-80 mb-8">Mueve tu mano frente a la cámara</p>
                        
                        {/* Indicadores de carga animados */}
                        <div className="flex justify-center space-x-3">
                          <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                          <div className="w-4 h-4 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-4 h-4 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[100px] mb-8 opacity-50 transform transition-all duration-1000 hover:scale-110">
                          <span className="inline-block hover:rotate-12">⏸️</span>
                        </div>
                        <h3 className="text-3xl font-black mb-6 bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">
                          DETECCIÓN PAUSADA
                        </h3>
                        <p className="text-xl opacity-80">Presiona "Iniciar" para comenzar</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>



        {/* Nueva sección: Gestos disponibles */}
        <div className="mt-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-3">
              <Hand className="h-8 w-8 text-purple-600" />
              Gestos Disponibles
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Estos son todos los gestos que la aplicación puede reconocer. ¡Pruébalos!
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Object.entries(GESTURE_EMOJIS).map(([gestureName, emoji]) => (
                <div 
                  key={gestureName}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <div className="text-4xl mb-2">{emoji}</div>
                  <p className="text-xs font-medium text-gray-700 capitalize leading-tight">
                    {gestureName.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                💡 <strong>Tip:</strong> Mantén tu mano bien visible frente a la cámara para obtener mejor detección
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestureDetectionApp;