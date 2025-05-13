import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useScore } from '../contexts/ScoreContext';
import Timer from './common/Timer';
import Modal from './common/Modal';
import { Apple, ArrowLeft, ArrowRight, Pizza } from 'lucide-react';

interface FoodItem {
  id: number;
  x: number;
  y: number;
  type: string;
  collected: boolean;
  isBad?: boolean;
}

const foodTypes = [
  { emoji: '🍔', name: 'hambúrguer', isBad: false },
  { emoji: '🍎', name: 'maçã', isBad: false },
  { emoji: '🍕', name: 'pizza', isBad: false },
  { emoji: '🍦', name: 'sorvete', isBad: false },
  { emoji: '🍩', name: 'rosquinha', isBad: false },
  { emoji: '🍿', name: 'pipoca', isBad: false },
  { emoji: '🥦', name: 'brócolis', isBad: true },
  { emoji: '🍋', name: 'limão', isBad: true }
];

const JogoAlimentar: React.FC = () => {
  const navigate = useNavigate();
  const { userName } = useUser();
  const { setAlimentarScore, saveToRanking } = useScore();
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const [charPosition, setCharPosition] = useState<number>(50);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(true);
  const [gameAreaHeight, setGameAreaHeight] = useState<number>(0);
  const [gameAreaWidth, setGameAreaWidth] = useState<number>(0);
  const [isCollisionProcessing, setIsCollisionProcessing] = useState<Record<number, boolean>>({});
  
  const keysPressed = useRef<Record<string, boolean>>({});

  const gameDuration = 30;
  const foodInterval = 1000;
  const minSpeed = 3;
  const maxSpeed = 6;
  const characterWidth = 60;
  const characterSpeed = 5;
  const foodSize = 40;
  const characterHitboxHeight = 70;

  useEffect(() => {
    const updateGameAreaDimensions = () => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        setGameAreaHeight(rect.height);
        setGameAreaWidth(rect.width);
      }
    };

    updateGameAreaDimensions();
    window.addEventListener('resize', updateGameAreaDimensions);
    
    return () => window.removeEventListener('resize', updateGameAreaDimensions);
  }, []);

  const createFood = useCallback(() => {
    if (!isGameActive) return;

    const id = Date.now();
    const x = Math.floor(Math.random() * 80) + 10;
    const foodIndex = Math.floor(Math.random() * foodTypes.length);
    const isBad = foodTypes[foodIndex].isBad;

    const newFood: FoodItem = {
      id,
      x,
      y: -foodSize,
      type: foodTypes[foodIndex].emoji,
      isBad,
      collected: false
    };

    setFoods(prev => [...prev, newFood]);
  }, [isGameActive]);

  const startGame = () => {
    setFoods([]);
    setCharPosition(50);
    setScore(0);
    setIsGameActive(true);
    setGameOver(false);
    setShowRulesModal(false);
    keysPressed.current = {};
  };

  const moveCharacter = useCallback(() => {
    if (!isGameActive) return;

    let newPosition = charPosition;

    if (keysPressed.current.ArrowLeft || keysPressed.current.a) {
      newPosition = Math.max(10, charPosition - characterSpeed);
    }
    if (keysPressed.current.ArrowRight || keysPressed.current.d) {
      newPosition = Math.min(90, charPosition + characterSpeed);
    }

    setCharPosition(newPosition);
  }, [isGameActive, charPosition]);

  const moveFoods = useCallback(() => {
    if (!isGameActive || !gameAreaHeight) return;

    const characterHitbox = {
      left: (charPosition - (characterWidth / 2) / gameAreaWidth * 100) / 100 * gameAreaWidth,
      right: (charPosition + (characterWidth / 2) / gameAreaWidth * 100) / 100 * gameAreaWidth,
      top: gameAreaHeight - characterHitboxHeight,
      bottom: gameAreaHeight
    };

    setFoods(prev => 
      prev
        .map(food => {
          if (food.collected) return food;
          
          const speed = food.y < 0 ? minSpeed : 
                       Math.min(maxSpeed, minSpeed + (food.y / gameAreaHeight) * (maxSpeed - minSpeed));
          
          const newY = food.y + speed;
          
          const foodHitbox = {
            left: (food.x - (foodSize / 2) / gameAreaWidth * 100) / 100 * gameAreaWidth,
            right: (food.x + (foodSize / 2) / gameAreaWidth * 100) / 100 * gameAreaWidth,
            top: newY,
            bottom: newY + foodSize
          };
          
          const isColliding = 
            foodHitbox.left < characterHitbox.right &&
            foodHitbox.right > characterHitbox.left &&
            foodHitbox.bottom > characterHitbox.top &&
            foodHitbox.top < characterHitbox.bottom;
          
          if (isColliding && !isCollisionProcessing[food.id]) {
            setIsCollisionProcessing(prev => ({ ...prev, [food.id]: true }));
            
            if (!food.isBad) {
              setScore(prev => prev + 1);
            } else {
              setScore(prev => Math.max(0, prev - 1));
            }
            
            return { ...food, collected: true };
          }
          
          return { ...food, y: newY };
        })
        .filter(food => {
          if (food.collected) {
            const collectTime = parseInt(food.id.toString());
            return Date.now() - collectTime < 500;
          }
          return food.y < gameAreaHeight + foodSize;
        })
    );
  }, [isGameActive, charPosition, gameAreaHeight, gameAreaWidth, isCollisionProcessing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleLeftButtonPress = () => {
    keysPressed.current.ArrowLeft = true;
  };
  
  const handleRightButtonPress = () => {
    keysPressed.current.ArrowRight = true;
  };
  
  const handleButtonRelease = () => {
    keysPressed.current.ArrowLeft = false;
    keysPressed.current.ArrowRight = false;
  };

  useEffect(() => {
    let foodTimer: NodeJS.Timeout;
    
    if (isGameActive) {
      foodTimer = setInterval(createFood, foodInterval);
    }
    
    return () => {
      if (foodTimer) clearInterval(foodTimer);
    };
  }, [isGameActive, createFood]);

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    const frameInterval = 1000 / 60;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastTime;

      if (elapsed >= frameInterval) {
        moveCharacter();
        moveFoods();
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
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isGameActive, moveCharacter, moveFoods]);

  const handleTimeUp = () => {
    if (isGameActive) {
      setIsGameActive(false);
      setGameOver(true);
      setAlimentarScore(score);
      saveToRanking();
      
      setTimeout(() => {
        navigate('/ranking');
      }, 3000);
    }
  };

  return (
    <div className="section-container">
      <div className="game-container h-[80vh] flex flex-col">
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">
            <h1 className="subtitle">Alimente o Mickey</h1>
            <p className="text-gray-600 text-sm">Olá, {userName}! Pegue as comidas que caem.</p>
          </div>
          
          <div className="flex items-center">
            <div className="bg-[#4A7CFF] text-white font-bold py-1 px-3 rounded-full flex items-center">
              <Pizza className="w-4 h-4 mr-1" />
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
          className="game-area w-full flex-grow relative mt-4 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100"
        >
          {foods.map(food => (
            <div
              key={food.id}
              className={`food-item absolute ${food.collected ? 'animate-scale-in opacity-0' : ''}`}
              style={{
                left: `${food.x}%`,
                top: `${food.y}px`,
                width: `${foodSize}px`,
                height: `${foodSize}px`,
                fontSize: `${foodSize}px`,
                transform: 'translate(-50%, 0)',
                transition: 'all 0.1s linear'
              }}
            >
              {food.type}
            </div>
          ))}
          
          <div
            className="character absolute bottom-0"
            style={{
              left: `${charPosition}%`,
              width: `${characterWidth}px`,
              height: `${characterHitboxHeight}px`,
              transform: 'translate(-50%, 0)',
              fontSize: '60px',
              textAlign: 'center',
              lineHeight: '1',
              zIndex: 10
            }}
          >
            🐭
          </div>
          
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
                  Você coletou <span className="font-bold">{score}</span> comidas!
                </p>
                <div className="flex justify-center items-center">
                  <ArrowRight className="w-5 h-5 text-[#FF5757] animate-bounce-custom" />
                  <span className="ml-2">Finalizando, veja o ranking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {isGameActive && (
          <div className="game-controls mt-4">
            <button
              className="control-btn"
              onTouchStart={handleLeftButtonPress}
              onMouseDown={handleLeftButtonPress}
              onTouchEnd={handleButtonRelease}
              onMouseUp={handleButtonRelease}
              onMouseLeave={handleButtonRelease}
            >
              <ArrowLeft size={24} />
            </button>
            
            <button
              className="control-btn"
              onTouchStart={handleRightButtonPress}
              onMouseDown={handleRightButtonPress}
              onTouchEnd={handleButtonRelease}
              onMouseUp={handleButtonRelease}
              onMouseLeave={handleButtonRelease}
            >
              <ArrowRight size={24} />
            </button>
          </div>
        )}
      </div>
      
      <Modal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        title="Alimente o Mickey"
      >
        <div className="text-gray-700">
          <p className="mb-3">Último desafio, {userName}! Ajude a alimentar o Mickey!</p>
          
          <p className="mb-3">
            <strong>Como jogar:</strong>
          </p>
          
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Use as setas do teclado (←→) ou os botões na tela para mover o Mickey.</li>
            <li>Pegue os alimentos que caem do topo da tela.</li>
            <li>Comidas boas valem +1 ponto (🍔, 🍎, 🍕, 🍦, 🍩, 🍿).</li>
            <li>Cuidado com comidas ruins (🥦, 🍋) que valem -1 ponto!</li>
            <li>Você tem 30 segundos para coletar o máximo de comidas possível!</li>
          </ul>
          
          <p>Preparado para o último desafio?</p>
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

export default JogoAlimentar;