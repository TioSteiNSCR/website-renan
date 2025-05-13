import React, { useEffect, useRef } from 'react';
import Button from './Button';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  showCloseButton = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Fecha o modal quando clica fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Impede o scroll do body quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#4A7CFF] font-baloo">{title}</h2>
          {showCloseButton && (
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          )}
        </div>
        
        <div className="mb-6">
          {children}
        </div>
        
        {showCloseButton && (
          <div className="flex justify-center">
            <Button onClick={onClose} type="secondary">
              Fechar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;