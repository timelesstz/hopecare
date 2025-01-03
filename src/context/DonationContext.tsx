import React, { createContext, useContext, useState } from 'react';

interface DonationData {
  amount: number;
  currency: string;
  paymentMethod?: string;
  projectId?: string;
  projectName?: string;
  donationType: 'one-time' | 'monthly';
  metadata?: Record<string, any>;
}

interface DonationContextType {
  donationData: DonationData | null;
  setDonationData: (data: DonationData | null) => void;
  clearDonation: () => void;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

export const DonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [donationData, setDonationData] = useState<DonationData | null>(null);

  const clearDonation = () => {
    setDonationData(null);
  };

  return (
    <DonationContext.Provider
      value={{
        donationData,
        setDonationData,
        clearDonation,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};

export const useDonation = () => {
  const context = useContext(DonationContext);
  if (context === undefined) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
};
