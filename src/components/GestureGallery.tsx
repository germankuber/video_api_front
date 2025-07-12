import React from 'react';
import { Hand, Sparkles } from 'lucide-react';

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
  'five': '5️⃣',
  'six': '6️⃣',
  'seven': '7️⃣',
  'eight': '8️⃣',
  'nine': '9️⃣',
  'ten': '🔟',
  'None': '🚫',
  'Closed_Fist': '✊',
  'Open_Palm': '🖐️',
  'Pointing_Up': '☝️',
  'Thumb_Down': '👎',
  'Thumb_Up': '👍',
  'Victory': '✌️',
  'ILoveYou': '🤟'
};

const GestureGallery: React.FC = () => {
  return (
    <div className="mt-12">
      <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Hand className="h-10 w-10 text-purple-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Galería de Gestos
            </h2>
            <Sparkles className="h-10 w-10 text-yellow-400 animate-bounce" />
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Explora todos los gestos que puedes realizar con la aplicación. 
            Cada gesto es detectado en tiempo real con inteligencia artificial.
          </p>
        </div>
        
        {/* Gesture grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 mb-8">
          {Object.entries(GESTURE_EMOJIS).map(([gestureName, emoji], index) => (
            <GestureCard 
              key={gestureName}
              emoji={emoji}
              name={gestureName}
              index={index}
            />
          ))}
        </div>
        
        {/* Tips section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TipCard
            icon="💡"
            title="Iluminación"
            description="Asegúrate de tener buena iluminación para una mejor detección"
            color="from-yellow-500/20 to-orange-500/20"
            borderColor="border-yellow-500/30"
          />
          
          <TipCard
            icon="📏"
            title="Distancia"
            description="Mantén tu mano a una distancia de 30-60cm de la cámara"
            color="from-blue-500/20 to-cyan-500/20"
            borderColor="border-blue-500/30"
          />
          
          <TipCard
            icon="🎯"
            title="Precisión"
            description="Realiza gestos claros y mantén la mano centrada en el frame"
            color="from-green-500/20 to-emerald-500/20"
            borderColor="border-green-500/30"
          />
        </div>
      </div>
    </div>
  );
};

interface GestureCardProps {
  emoji: string;
  name: string;
  index: number;
}

const GestureCard: React.FC<GestureCardProps> = ({ emoji, name, index }) => {
  return (
    <div 
      className="group relative backdrop-blur-md bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-2xl p-4 border border-white/10 hover:border-white/30 hover:bg-gradient-to-br hover:from-purple-500/20 hover:via-pink-500/20 hover:to-red-500/20 transform hover:scale-105 transition-all duration-300 cursor-pointer animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <div className="text-4xl mb-3 group-hover:animate-bounce transition-transform duration-200">
          {emoji}
        </div>
        <p className="text-xs font-medium text-slate-300 group-hover:text-white capitalize leading-tight transition-colors duration-200">
          {name.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}
        </p>
      </div>
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
    </div>
  );
};

interface TipCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  borderColor: string;
}

const TipCard: React.FC<TipCardProps> = ({ icon, title, description, color, borderColor }) => {
  return (
    <div className={`backdrop-blur-md bg-gradient-to-br ${color} rounded-2xl p-6 border ${borderColor} hover:scale-105 transition-all duration-300`}>
      <div className="text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default GestureGallery;