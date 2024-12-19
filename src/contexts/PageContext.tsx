import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PageContextType {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within a PageProvider');
  }
  return context;
};

interface PageProviderProps {
  children: ReactNode;
}

export const PageProvider: React.FC<PageProviderProps> = ({ children }) => {
  const [title, setTitle] = useState('HopeCare');
  const [description, setDescription] = useState('Making a difference in communities');

  return (
    <PageContext.Provider
      value={{
        title,
        setTitle,
        description,
        setDescription,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
