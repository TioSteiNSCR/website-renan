import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BoasVindas from './components/BoasVindas';
import JogoMemoria from './components/JogoMemoria';
import JogoBaloes from './components/JogoBaloes';
import JogoAlimentar from './components/JogoAlimentar';
import Ranking from './components/Ranking';
import { UserProvider } from './contexts/UserContext';
import { ScoreProvider } from './contexts/ScoreContext';
import MusicPlayer from './components/common/MusicPlayer';
import './styles/globals.css';

function App() {
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Inicializa o áudio apenas após interação do usuário para cumprir políticas dos navegadores
  const initializeAudio = () => {
    if (!audioInitialized) {
      setAudioInitialized(true);
    }
  };

  // Adiciona event listener para inicializar áudio após interação do usuário
  useEffect(() => {
    document.addEventListener('click', initializeAudio, { once: true });
    document.addEventListener('touchstart', initializeAudio, { once: true });
    
    return () => {
      document.removeEventListener('click', initializeAudio);
      document.removeEventListener('touchstart', initializeAudio);
    };
  }, []);

  return (
    <Router>
      <UserProvider>
        <ScoreProvider>
          <div className="app-container font-nunito bg-blue-50 min-h-screen overflow-hidden relative">
            {/* Elementos decorativos de fundo */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
              <div className="absolute top-5 left-5 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-float"></div>
              <div className="absolute top-20 right-10 w-16 h-16 bg-red-400 rounded-full opacity-20 animate-float-delay"></div>
              <div className="absolute bottom-10 left-20 w-24 h-24 bg-blue-400 rounded-full opacity-20 animate-float-long"></div>
            </div>
            
            {/* Componente de música (controlado pelo estado audioInitialized) */}
            {audioInitialized && <MusicPlayer />}
            
            <div className="relative z-10">
              <Routes>
                <Route path="/" element={<BoasVindas />} />
                <Route path="/memoria" element={<JogoMemoria />} />
                <Route path="/baloes" element={<JogoBaloes />} />
                <Route path="/alimentar" element={<JogoAlimentar />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </ScoreProvider>
      </UserProvider>
    </Router>
  );
}

export default App;