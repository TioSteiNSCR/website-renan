import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useScore } from '../contexts/ScoreContext';
import Timer from './common/Timer';
import Modal from './common/Modal';
import { Target, ArrowRight } from 'lucide-react';

interface Balloon {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  popped: boolean;
}

const balloonColors = [
  '#FF5757',
  '#FFD600',
  '#4A7CFF',
  '#4CD964',
  '#FF9500',
  '#AF52DE'
];

const JogoBaloes: React.FC = () => {
  const navigate = useNavigate();
  const { userName } = useUser();
  const { setBaloesScore } = useScore();
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(true);
  const [isProcessingPop, setIsProcessingPop] = useState<Record<number, boolean>>({});
  const [gameAreaHeight, setGameAreaHeight] = useState<number>(0);

  const gameDuration = 20; // Changed from 30 to 20 seconds
  const balloonInterval = 500;
  const minSpeed = 4;
  const maxSpeed = 8;

  useEffect(() => {
    if (gameAreaRef.current) {
      setGameAreaHeight(gameAreaRef.current.clientHeight);
    }

    const handleResize = () => {
      if (gameAreaRef.current) {
        setGameAreaHeight(gameAreaRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const createBalloon = useCallback(() => {
    if (!isGameActive) return;

    const id = Date.now();
    const size = Math.floor(Math.random() * 30) + 50;
    const x = Math.floor(Math.random() * 80) + 10;
    const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

    const newBalloon: Balloon = {
      id,
      x,
      y: gameAreaHeight,
      size,
      color,
      speed,
      popped: false
    };

    setBalloons(prev => [...prev, newBalloon]);
  }, [isGameActive, gameAreaHeight]);

  const startGame = () => {
    setBalloons([]);
    setScore(0);
    setIsGameActive(true);
    setGameOver(false);
    setShowRulesModal(false);
  };

  const moveBalloons = useCallback(() => {
    if (!isGameActive) return;

    setBalloons(prev => 
      prev
        .map(balloon => {
          if (balloon.popped) return balloon;
          
          const newY = balloon.y - balloon.speed;
          return {
            ...balloon,
            y: newY
          };
        })
        .filter(balloon => {
          if (balloon.popped) {
            const popTime = parseInt(balloon.id.toString());
            return Date.now() - popTime < 500;
          }
          return balloon.y + balloon.size > 0;
        })
    );
  }, [isGameActive]);

  useEffect(() => {
    let balloonTimer: NodeJS.Timeout;
    
    if (isGameActive) {
      balloonTimer = setInterval(createBalloon, balloonInterval);
    }
    
    return () => {
      if (balloonTimer) clearInterval(balloonTimer);
    };
  }, [isGameActive, createBalloon]);

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    const frameInterval = 1000 / 60;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastTime;

      if (elapsed >= frameInterval) {
        moveBalloons();
        lastTime = timestamp;
      }

      if (isGameActive) {
        animationId = requestAnimationFrame(animate);
      }
    };

    if (isGameActive) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isGameActive, moveBalloons]);

  const handleTimeUp = () => {
    if (isGameActive) {
      setIsGameActive(false);
      setGameOver(true);
      setBaloesScore(score);
      
      setTimeout(() => {
        navigate('/alimentar');
      }, 3000);
    }
  };

  const popBalloon = (id: number) => {
    if (isProcessingPop[id] || !isGameActive) return;
    
    setIsProcessingPop(prev => ({ ...prev, [id]: true }));
    
    setBalloons(prev => 
      prev.map(balloon => 
        balloon.id === id ? { ...balloon, popped: true } : balloon
      )
    );
    
    setScore(prev => prev + 1);
    
    setTimeout(() => {
      setIsProcessingPop(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }, 500);
  };

  return (
    <div className="section-container">
      <div className="game-container h-[80vh]">
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">
            <h1 className="subtitle">Estoure os Balões</h1>
            <p className="text-gray-600 text-sm">Olá, {userName}! Clique nos balões para estourar.</p>
          </div>
          
          <div className="flex items-center">
            <div className="bg-[#4A7CFF] text-white font-bold py-1 px-3 rounded-full flex items-center">
              <Target className="w-4 h-4 mr-1" />
              <span>{score} pts</span>
            </div>
          </div>
        </div>
        
        {(isGameActive || gameOver) && (
          <Timer 
            duration={gameDuration} 
            onComplete={handleTimeUp} 
            isActive={isGameActive}
          />
        )}
        
        <div 
          ref={gameAreaRef}
          className="w-full h-[calc(100%-100px)] relative mt-4 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100"
        >
          {balloons.map(balloon => (
            <div
              key={balloon.id}
              className={`balloon ${balloon.popped ? 'animate-scale-in opacity-0' : ''}`}
              style={{
                left: `${balloon.x}%`,
                top: `${balloon.y}px`,
                width: `${balloon.size}px`,
                height: `${balloon.size * 1.2}px`,
                backgroundColor: balloon.color,
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.1s linear'
              }}
              onClick={() => popBalloon(balloon.id)}
            />
          ))}
          
          {!isGameActive && !gameOver && !showRulesModal && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={startGame}
                className="btn-primary animate-bounce-custom"
              >
                Começar
              </button>
            </div>
          )}
          
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 animate-fade-in">
              <div className="text-center p-6 rounded-xl">
                <p className="text-2xl font-bold text-[#4A7CFF] mb-2">
                  Tempo Esgotado!
                </p>
                <p className="text-xl mb-4">
                  Você estourou <span className="font-bold">{score}</span> balões!
                </p>
                <div className="flex justify-center items-center">
                  <ArrowRight className="w-5 h-5 text-[#FF5757] animate-bounce-custom" />
                  <span className="ml-2">Preparando próximo jogo...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Modal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        title="Estoure os Balões"
      >
        <div className="text-gray-700">
          <p className="mb-3">Agora é hora de estourar balões, {userName}!</p>
          
          <p className="mb-3">
            <strong>Como jogar:</strong>
          </p>
          
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Balões coloridos irão subir pela tela.</li>
            <li>Toque ou clique neles para estourá-los.</li>
            <li>Cada balão estourado vale 1 ponto!</li>
            <li>Você tem 20 segundos para estourar quantos balões conseguir!</li>
          </ul>
          
          <p>Preparado para a diversão?</p>
        </div>
        
        <div className="mt-6 flex justify-center">
          <button onClick={startGame} className="btn-primary">
            Vamos Jogar!
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default JogoBaloes;