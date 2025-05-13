import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import Button from './common/Button';
import { Sparkles, Cake, Moon as Balloon } from 'lucide-react';
import backgroundImage from '../img/background.png'; // Importando a imagem

const BoasVindas: React.FC = () => {
  const navigate = useNavigate();
  const { userName, setUserName } = useUser();
  const [inputValue, setInputValue] = useState<string>(userName);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [animateItems, setAnimateItems] = useState<boolean>(false);

  // Anima os elementos ao montar o componente
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateItems(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      // Previne múltiplos cliques
      setIsButtonDisabled(true);
      
      // Salva o nome do usuário
      setUserName(inputValue.trim());
      
      // Navega para a próxima tela após breve delay
      setTimeout(() => {
        navigate('/memoria');
      }, 300);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && !isButtonDisabled) {
      handleSubmit();
    }
  };

  return (
    <div 
      className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center" 
      style={{ backgroundImage: `url(${backgroundImage})` }} // Usando a imagem importada
    >
      <div className={`card max-w-lg w-full ${animateItems ? 'animate-scale-in' : 'opacity-0 scale-90'}`}>
        {/* Elementos decorativos */}
        <div className="absolute -top-10 -left-8 w-16 h-16">
          <Balloon className="w-16 h-16 text-red-500 animate-float" />
        </div>
        <div className="absolute -top-12 right-10 w-16 h-16">
          <Balloon className="w-16 h-16 text-blue-500 animate-float-delay" />
        </div>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Cake className="w-16 h-16 text-[#FF5757] animate-bounce-custom" />
              <Sparkles className="w-8 h-8 text-[#FFD600] absolute -top-3 -right-3" />
            </div>
          </div>
          
          <h1 className="title">
            Circo do Renan
          </h1>
          
          <div className="subtitle">
            1º Aniversário
          </div>
          
          <p className="mt-4 text-gray-700">
          Bem-vindo(a) à diversão do primeiro aninho do nosso pequeno Renan! Prepare-se para muitos jogos e brincadeiras!
          </p>

          <p className="mt-4 text-gray-700">
          Jogue até o fim para ter acesso ao convite.
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="nome" className="block mb-2 font-medium text-gray-700">
            Qual é o seu nome?
          </label>
          <input
            id="nome"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite seu nome aqui"
            autoFocus
            className="w-full px-4 py-3 border-2 border-[#4A7CFF] rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-[#4A7CFF] focus:border-transparent
              transition-all duration-300"
          />
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isButtonDisabled}
          >
            Começar a Aventura
          </Button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Divirta-se com nossos 3 mini-jogos e veja sua pontuação no ranking final!
        </div>
      </div>
    </div>
  );
};

export default BoasVindas;
