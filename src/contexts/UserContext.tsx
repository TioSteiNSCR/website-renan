import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UserContextProps {
  userName: string;
  setUserName: (name: string) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userName, setUserName] = useState<string>(() => {
    // Tenta recuperar o nome do localStorage
    const savedName = localStorage.getItem('userName');
    return savedName || '';
  });

  // Salva o nome no localStorage sempre que ele for atualizado
  const handleSetUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('userName', name);
  };

  return (
    <UserContext.Provider value={{ userName, setUserName: handleSetUserName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};