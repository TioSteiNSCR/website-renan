import React from 'react';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  type?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  disabled = false, 
  className = '', 
  children,
  type = 'primary'
}) => {
  // Implementa debounce para evitar múltiplos cliques
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  const baseClass = type === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;