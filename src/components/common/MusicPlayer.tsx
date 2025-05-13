import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const MusicPlayer: React.FC = () => {
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Placeholder para URL de música de circo/festa infantil
  const musicUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  useEffect(() => {
    // Cria o elemento de áudio
    audioRef.current = new Audio(musicUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    return () => {
      // Limpa o timeout e o audio quando o componente for desmontado
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Controla o estado de mute do áudio
    if (!isMuted) {
      if (audio.paused) {
        audio.play().catch(error => {
          console.error('Erro ao reproduzir áudio:', error);
          setIsMuted(true);
        });
      }
    } else {
      // Adiciona um pequeno delay antes de pausar para evitar interrupções
      if (!audio.paused) {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
          if (audio && !audio.paused) {
            audio.pause();
          }
        }, 100);
      }
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <button 
      onClick={toggleMute}
      className="fixed top-4 right-4 z-50 bg-white rounded-full p-3 shadow-md
        hover:bg-gray-50 transition-all duration-300 focus:outline-none
        transform hover:scale-110 active:scale-95"
      aria-label={isMuted ? "Ativar música" : "Desativar música"}
    >
      {isMuted ? (
        <VolumeX className="w-6 h-6 text-[#FF5757]" />
      ) : (
        <Volume2 className="w-6 h-6 text-[#4A7CFF]" />
      )}
    </button>
  );
};

export default MusicPlayer;