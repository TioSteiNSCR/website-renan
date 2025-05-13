import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useScore } from '../contexts/ScoreContext';
import Button from './common/Button';
import Modal from './common/Modal';
import Timer from './common/Timer';
import { ArrowRight, Brain } from 'lucide-react';

interface Card {
  id: number;
  imageIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const characterEmojis = ['🐭', '🦆', '🐶', '🐱', '🐰', '🐮'];
const characterNames = ['Mickey', 'Pato Donald', 'Pluto', 'Minnie', 'Pateta', 'Clarabela'];

const JogoMemoria: React.FC = () => {
  const navigate = useNavigate();
  const { userName } = useUser();
  const { setMemoriaScore } = useScore();
  
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  
  const totalCards = 12;
  const previewDuration = 4;
  const gameDuration = 30; // Changed from 60 to 30 seconds
  
  const initializeGame = useCallback(() => {
    const cardPairs: Card[] = [];
    
    for (let i = 0; i < totalCards / 2; i++) {
      cardPairs.push({
        id: i * 2,
        imageIndex: i,
        isFlipped: false,
        isMatched: false
      });
      
      cardPairs.push({
        id: i * 2 + 1,
        imageIndex: i,
        isFlipped: false,
        isMatched: false
      });
    }
    
    const shuffledCards = [...cardPairs]
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setScore(0);
    setGameOver(false);
  }, []);
  
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  const startPreview = () => {
    setShowPreview(true);
    setShowRulesModal(false);
    
    setCards(prevCards => 
      prevCards.map(card => ({ ...card, isFlipped: true }))
    );
    
    setTimeout(() => {
      setCards(prevCards => 
        prevCards.map(card => ({ ...card, isFlipped: false }))
      );
      setShowPreview(false);
      setIsGameActive(true);
    }, previewDuration * 1000);
  };
  
  const handleCardClick = (id: number) => {
    if (
      !isGameActive ||
      isProcessing ||
      flippedCards.length >= 2 ||
      flippedCards.includes(id) ||
      cards.find(card => card.id === id)?.isMatched
    ) {
      return;
    }
    
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );
    
    setFlippedCards(prev => [...prev, id]);
  };
  
  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsProcessing(true);
      
      const [firstId, secondId] = flippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);
      
      if (firstCard && secondCard && firstCard.imageIndex === secondCard.imageIndex) {
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === firstId || card.id === secondId
                ? { ...card, isMatched: true }
                : card
            )
          );
          
          setMatchedPairs(prev => prev + 1);
          setScore(prev => prev + 10);
          setFlippedCards([]);
          setIsProcessing(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === firstId || card.id === secondId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);
  
  useEffect(() => {
    if (matchedPairs === totalCards / 2 && isGameActive) {
      handleGameOver();
    }
  }, [matchedPairs, isGameActive, totalCards]);
  
  const handleGameOver = () => {
    setIsGameActive(false);
    setGameOver(true);
    
    setMemoriaScore(score);
    
    setTimeout(() => {
      navigate('/baloes');
    }, 3000);
  };
  
  const handleTimeUp = () => {
    if (isGameActive) {
      handleGameOver();
    }
  };
  
  return (
    <div className="section-container">
      <div className="game-container">
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">
            <h1 className="subtitle">Jogo da Memória</h1>
            <p className="text-gray-600 text-sm">Olá, {userName}! Encontre todos os pares.</p>
          </div>
          
          <div className="flex items-center">
            <div className="bg-[#4A7CFF] text-white font-bold py-1 px-3 rounded-full flex items-center">
              <Brain className="w-4 h-4 mr-1" />
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
        
        <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
          {cards.map(card => (
            <div
              key={card.id}
              className={`memory-card ${card.isFlipped ? 'flipped' : ''} ${
                card.isMatched ? 'opacity-60' : ''
              }`}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="memory-card-front">
                <span className="text-4xl">?</span>
              </div>
              <div className="memory-card-back">
                <div className="flex flex-col items-center">
                  <span className="text-4xl">{characterEmojis[card.imageIndex]}</span>
                  <span className="text-xs mt-1">{characterNames[card.imageIndex]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {!isGameActive && !showPreview && !gameOver && !showRulesModal && (
          <div className="mt-6 flex justify-center">
            <Button onClick={startPreview}>
              Iniciar Jogo
            </Button>
          </div>
        )}
        
        {showPreview && (
          <div className="mt-4 text-center font-bold text-[#FF5757]">
            Memorize as cartas! Elas serão viradas em {previewDuration} segundos.
          </div>
        )}
        
        {gameOver && (
          <div className="mt-6 text-center animate-scale-in">
            <p className="text-xl font-bold text-[#4A7CFF] mb-2">
              {matchedPairs === totalCards / 2 ? 'Parabéns!' : 'Tempo esgotado!'}
            </p>
            <p className="mb-4">
              Você fez {score} pontos no jogo da memória!
            </p>
            <div className="flex justify-center items-center">
              <ArrowRight className="w-5 h-5 text-[#FF5757] animate-bounce-custom" />
              <span className="ml-2">Preparando próximo jogo...</span>
            </div>
          </div>
        )}
        
        <Modal
          isOpen={showRulesModal}
          onClose={() => setShowRulesModal(false)}
          title="Regras do Jogo da Memória"
        >
          <div className="text-gray-700">
            <p className="mb-3">Olá, {userName}! Bem-vindo ao primeiro jogo da festa!</p>
            
            <p className="mb-3">
              <strong>Como jogar:</strong>
            </p>
            
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Você terá 4 segundos para memorizar a posição de todas as cartas.</li>
              <li>Depois, elas serão viradas e você precisará encontrar os pares iguais.</li>
              <li>A cada par encontrado, você ganha 10 pontos!</li>
              <li>Você tem 30 segundos para encontrar todos os pares!</li>
            </ul>
            
            <p>Preparado para testar sua memória?</p>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button onClick={startPreview}>
              Vamos Jogar!
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default JogoMemoria;