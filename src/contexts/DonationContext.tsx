import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DonationContextType {
  amount: number;
  setAmount: (amount: number) => void;
  frequency: 'one-time' | 'monthly';
  setFrequency: (frequency: 'one-time' | 'monthly') => void;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

export const useDonationContext = () => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonationContext must be used within a DonationProvider');
  }
  return context;
};

interface DonationProviderProps {
  children: ReactNode;
}

export const DonationProvider: React.FC<DonationProviderProps> = ({ children }) => {
  const [amount, setAmount] = useState(0);
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');

  return (
    <DonationContext.Provider
      value={{
        amount,
        setAmount,
        frequency,
        setFrequency,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};
