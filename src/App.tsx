// App.tsx
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { AlertCircle, Hand, Pause, Play, RotateCcw, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type {
  DetectedGesture,
  GestureHistory
} from './types/mediapipe';

// Mapeo de gestos a emojis
const GESTURE_EMOJIS: { [key: string]: string } = {
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
  'one': '1️⃣',
  'two': '2️⃣',
  'three': '3️⃣',
  'four': '4️⃣',
  'five': '5️⃣'
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
  const [stats, setStats] = useState({
    totalGestures: 0,
    averageConfidence: 0,
    mostCommonGesture: 'Ninguno'
  });

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

  // Calcular estadísticas
  useEffect(() => {
    if (gestureHistory.length > 0) {
      const totalGestures = gestureHistory.length;
      const averageConfidence = gestureHistory.reduce((sum, g) => sum + g.confidence, 0) / totalGestures;
      
      const gestureCounts = gestureHistory.reduce((acc, g) => {
        acc[g.gesture] = (acc[g.gesture] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      
      const mostCommonGesture = Object.entries(gestureCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Ninguno';

      setStats({
        totalGestures,
        averageConfidence,
        mostCommonGesture
      });
    }
  }, [gestureHistory]);

  // Dibujar landmarks en canvas
  const drawLandmarks = (landmarks: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 640;
    canvas.height = 480;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    landmarks.forEach((handLandmarks, handIndex) => {
      const color = HAND_COLORS[handIndex % HAND_COLORS.length];
      
      // Dibujar puntos
      ctx.fillStyle = color;
      handLandmarks.forEach((landmark: any) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      // Dibujar conexiones
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
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
    });
  };

  // Limpiar historial
  const clearHistory = () => {
    setGestureHistory([]);
    setStats({
      totalGestures: 0,
      averageConfidence: 0,
      mostCommonGesture: 'Ninguno'
    });
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

              {/* Overlay de gestos detectados en tiempo real */}
              {isRecording && detectedGestures.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black bg-opacity-70 rounded-lg p-4 text-white">
                    <div className="flex items-center gap-4 overflow-x-auto">
                      {detectedGestures.map((gesture, index) => (
                        <div key={index} className="flex items-center gap-2 min-w-max">
                          <span className="text-3xl">{GESTURE_EMOJIS[gesture.gesture] || '👋'}</span>
                          <div>
                            <p className="text-sm font-bold">Mano {gesture.hand}</p>
                            <p className="text-xs text-gray-300">{(gesture.confidence * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel de Gesto Actual - MÁS GRANDE Y VISUAL */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-2xl p-8 text-white text-center h-full flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-6">Gesto Actual</h2>
              
              {isRecording && detectedGestures.length > 0 ? (
                <div className="space-y-6">
                  {detectedGestures.map((gesture, index) => (
                    <div key={index} className="transform transition-all duration-300 hover:scale-105">
                      {/* Emoji gigante con animación */}
                      <div className="text-8xl mb-4 animate-bounce">
                        {GESTURE_EMOJIS[gesture.gesture] || '👋'}
                      </div>
                      
                      {/* Nombre del gesto */}
                      <h3 className="text-3xl font-bold mb-2 capitalize">
                        {gesture.gesture.replace('_', ' ')}
                      </h3>
                      
                      {/* Confianza con barra visual */}
                      <div className="bg-white bg-opacity-20 rounded-full p-1 mb-2">
                        <div 
                          className="bg-white rounded-full h-4 transition-all duration-300 flex items-center justify-center"
                          style={{ width: `${gesture.confidence * 100}%` }}
                        >
                          <span className="text-purple-600 text-xs font-bold">
                            {(gesture.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-lg opacity-80">Mano {gesture.hand}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-6xl opacity-50">
                    {isRecording ? '👀' : '⏸️'}
                  </div>
                  <h3 className="text-2xl font-bold">
                    {isRecording ? 'Esperando gesto...' : 'Presiona Iniciar'}
                  </h3>
                  <p className="opacity-80">
                    {isRecording ? 'Haz un gesto con tu mano' : 'Para comenzar la detección'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gestos Detectados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gestos Actuales */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Gestos Detectados
            </h2>
            
            {detectedGestures.length > 0 ? (
              <div className="space-y-3">
                {detectedGestures.map((gesture, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{GESTURE_EMOJIS[gesture.gesture] || '👋'}</span>
                      <div>
                        <p className="font-medium text-gray-800">
                          Mano {gesture.hand}: {gesture.gesture}
                        </p>
                        <p className="text-sm text-gray-600">
                          Confianza: {(gesture.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{gesture.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                {isRecording ? 'Esperando gestos...' : 'Presiona "Iniciar" para comenzar'}
              </p>
            )}
          </div>

          {/* Historial y Estadísticas */}
          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Estadísticas</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalGestures}</p>
                  <p className="text-sm text-gray-600">Total Gestos</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {(stats.averageConfidence * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Confianza Promedio</p>
                </div>
                <div className="col-span-2 text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-lg font-bold text-purple-600 flex items-center justify-center gap-2">
                    {GESTURE_EMOJIS[stats.mostCommonGesture] || '❓'}
                    {stats.mostCommonGesture}
                  </p>
                  <p className="text-sm text-gray-600">Gesto Más Común</p>
                </div>
              </div>
            </div>

            {/* Historial */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial Reciente</h2>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {gestureHistory.length > 0 ? (
                  gestureHistory.map((gesture) => (
                    <div key={gesture.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <span className="text-lg">{GESTURE_EMOJIS[gesture.gesture] || '👋'}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{gesture.gesture}</p>
                        <p className="text-xs text-gray-500">
                          {gesture.timestamp} - {(gesture.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay gestos en el historial</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestureDetectionApp;