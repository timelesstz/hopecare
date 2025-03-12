import React, { createContext, useContext, useState } from 'react';

interface DonationData {
  amount: number;
  currency: string;
  date: string;
  project?: string;
  paymentMethod?: string;
  donationType?: 'one-time' | 'monthly' | 'recurring';
  metadata?: Record<string, any>;
  donorName?: string;
  donorEmail?: string;
  isGuest?: boolean;
}

interface DonationContextType {
  donationData: DonationData | null;
  setDonationData: (data: Partial<DonationData>) => void;
  clearDonation: () => void;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

export const DonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [donationData, setDonationDataState] = useState<DonationData | null>(null);

  const setDonationData = (data: Partial<DonationData>) => {
    if (donationData) {
      setDonationDataState({
        ...donationData,
        ...data
      });
    } else {
      setDonationDataState(data as DonationData);
    }
  };

  const clearDonation = () => {
    setDonationDataState(null);
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
