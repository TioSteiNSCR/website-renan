import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useScore } from '../contexts/ScoreContext';
import Button from './common/Button';
import { Trophy, Heart, ExternalLink, RefreshCw } from 'lucide-react';

const Ranking: React.FC = () => {
  const navigate = useNavigate();
  const { userName } = useUser();
  const { scores, totalScore, ranking, resetScores } = useScore();
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  const isTopThree = ranking.findIndex(entry => entry.name === userName) < 3;

  useEffect(() => {
    if (isTopThree) {
      setShowConfetti(true);
      
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isTopThree]);

  const createConfetti = () => {
    const confetti = [];
    const colors = ['#FF5757', '#FFD600', '#4A7CFF', '#4CD964', '#FF9500', '#AF52DE'];
    
    for (let i = 0; i < 50; i++) {
      const left = Math.random() * 100;
      const width = Math.random() * 10 + 5;
      const height = Math.random() * 5 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 5;
      
      confetti.push(
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${left}%`,
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: color,
            borderRadius: '2px',
            animationDelay: `${delay}s`
          }}
        />
      );
    }
    
    return confetti;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePlayAgain = () => {
    resetScores();
    navigate('/');
  };

  return (
    <div className="section-container relative overflow-hidden">
      {showConfetti && createConfetti()}
      
      <div className="game-container max-w-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <Trophy className="w-16 h-16 text-[#FFD600]" />
          </div>
          
          <h1 className="title">
            Ranking Final
          </h1>
          
          <p className="text-gray-700 mb-4">
            Obrigado por participar, {userName}!
          </p>
          
          <div className="bg-blue-100 rounded-lg p-4 mb-6">
            <h2 className="subtitle mb-2">Sua Pontuação</h2>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white rounded-lg p-2 shadow">
                <div className="text-sm text-gray-600">Memória</div>
                <div className="text-xl font-bold text-[#4A7CFF]">{scores.memoria}</div>
              </div>
              
              <div className="bg-white rounded-lg p-2 shadow">
                <div className="text-sm text-gray-600">Balões</div>
                <div className="text-xl font-bold text-[#4A7CFF]">{scores.baloes}</div>
              </div>
              
              <div className="bg-white rounded-lg p-2 shadow">
                <div className="text-sm text-gray-600">Alimentar</div>
                <div className="text-xl font-bold text-[#4A7CFF]">{scores.alimentar}</div>
              </div>
            </div>
            
            <div className="text-xl font-bold">
              Total: <span className="text-[#FF5757]">{totalScore}</span> pontos
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="subtitle mb-4">Top Jogadores</h2>
          
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <table className="w-full">
              <thead>
                <tr className="bg-[#4A7CFF] text-white">
                  <th className="py-2 px-4 text-left">#</th>
                  <th className="py-2 px-4 text-left">Nome</th>
                  <th className="py-2 px-4 text-center">Pontos</th>
                  <th className="py-2 px-4 text-right hidden sm:table-cell">Data</th>
                </tr>
              </thead>
              <tbody>
                {ranking.length > 0 ? (
                  ranking.map((entry, index) => (
                    <tr 
                      key={`${entry.name}-${entry.timestamp}`}
                      className={`
                        border-b border-gray-200 hover:bg-blue-50 transition-colors
                        ${entry.name === userName ? 'bg-yellow-50' : ''}
                        ${index < 3 ? 'font-bold' : ''}
                      `}
                    >
                      <td className="py-2 px-4">
                        {index === 0 && <span className="text-[#FFD600]">🥇</span>}
                        {index === 1 && <span className="text-gray-400">🥈</span>}
                        {index === 2 && <span className="text-amber-600">🥉</span>}
                        {index > 2 && index + 1}
                      </td>
                      <td className="py-2 px-4">{entry.name}</td>
                      <td className="py-2 px-4 text-center">{entry.totalScore}</td>
                      <td className="py-2 px-4 text-right text-gray-500 text-sm hidden sm:table-cell">
                        {formatDate(entry.timestamp)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      Sem jogadores no ranking ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <button 
            onClick={handlePlayAgain}
            className="inline-flex items-center btn-primary"
          >
            Jogar Novamente <RefreshCw className="ml-2 w-5 h-5" />
          </button>
          
          <div>
            <a 
              href="https://bolt.new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center btn-secondary"
            >
              Seguir para o convite <ExternalLink className="ml-2 w-5 h-5" />
            </a>
          </div>
          
          <div className="mt-8 text-sm text-gray-600 flex justify-center items-center">
            <Heart className="w-4 h-4 text-[#FF5757] mr-2" />
            Criado com amor para o nosso príncipe 💙
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking;