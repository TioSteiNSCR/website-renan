import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useUser } from './UserContext';

interface GameScores {
  memoria: number;
  baloes: number;
  alimentar: number;
}

interface RankingEntry {
  name: string;
  totalScore: number;
  timestamp: number;
}

interface ScoreContextProps {
  scores: GameScores;
  setMemoriaScore: (score: number) => void;
  setBaloesScore: (score: number) => void;
  setAlimentarScore: (score: number) => void;
  totalScore: number;
  ranking: RankingEntry[];
  saveToRanking: () => void;
  resetScores: () => void;
}

const ScoreContext = createContext<ScoreContextProps | undefined>(undefined);

export const ScoreProvider = ({ children }: { children: ReactNode }) => {
  const { userName } = useUser();
  
  const [scores, setScores] = useState<GameScores>({
    memoria: 0,
    baloes: 0,
    alimentar: 0
  });

  const [ranking, setRanking] = useState<RankingEntry[]>(() => {
    try {
      const savedRanking = localStorage.getItem('gameRanking');
      return savedRanking ? JSON.parse(savedRanking) : [];
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      return [];
    }
  });

  // Calcula o score total somando todos os jogos
  const totalScore = scores.memoria + scores.baloes + scores.alimentar;

  // Atualiza o localStorage sempre que o ranking mudar
  useEffect(() => {
    localStorage.setItem('gameRanking', JSON.stringify(ranking));
  }, [ranking]);

  useEffect(() => {
    if (scores.alimentar > 0) {
      saveToRanking();
    }
  }, [scores.alimentar]);
  


  // Funções para atualizar scores individuais
  const setMemoriaScore = (score: number) => {
    setScores(prev => ({ ...prev, memoria: score }));
  };

  const setBaloesScore = (score: number) => {
    setScores(prev => ({ ...prev, baloes: score }));
  };

  const setAlimentarScore = (score: number) => {
    setScores(prev => ({ ...prev, alimentar: score }));
  };

  // Adiciona a pontuação atual ao ranking
  const saveToRanking = () => {
    if (!userName) return;
  
    // Calcula o score total garantindo que inclui todos os jogos
    const currentTotalScore = scores.memoria + scores.baloes + scores.alimentar;
  
    // Log para depuração
    console.log('Pontuação individual dos jogos:', scores); // Verifica as pontuações de cada jogo
    console.log('Pontuação total calculada:', currentTotalScore); // Verifica o total calculado
  
    // Procura se já existe uma pontuação para este usuário
    const existingEntry = ranking.find(entry => entry.name === userName);
  
    // Só atualiza se não existir entrada ou se a nova pontuação for maior
    if (!existingEntry || currentTotalScore > existingEntry.totalScore) {
      const newEntry: RankingEntry = {
        name: userName,
        totalScore: currentTotalScore,
        timestamp: Date.now()
      };
  
      // Log para depuração
      console.log('Nova entrada no ranking:', newEntry); // Verifica a nova entrada antes de adicionar ao ranking
  
      // Remove a entrada anterior do mesmo usuário (se existir) e adiciona a nova
      const updatedRanking = [
        ...ranking.filter(entry => entry.name !== userName),
        newEntry
      ]
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 10); // Mantém apenas os top 10
  
      setRanking(updatedRanking);
    }
  };
  

  // Reseta todos os scores
  const resetScores = () => {
    setScores({
      memoria: 0,
      baloes: 0,
      alimentar: 0
    });
  };

  return (
    <ScoreContext.Provider value={{
      scores,
      setMemoriaScore,
      setBaloesScore,
      setAlimentarScore,
      totalScore,
      ranking,
      saveToRanking,
      resetScores
    }}>
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = (): ScoreContextProps => {
  const context = useContext(ScoreContext);
  if (context === undefined) {
    throw new Error('useScore must be used within a ScoreProvider');
  }
  return context;
};