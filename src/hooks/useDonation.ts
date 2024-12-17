import { useState, useCallback } from 'react';
import { donationService } from '../services/donationService';

interface DonationState {
  amount: number;
  donationType: 'one-time' | 'monthly' | 'recurring';
  recurringInterval: 'weekly' | 'biweekly' | 'monthly';
  donorInfo: {
    name: string;
    email: string;
  } | null;
  paymentStatus: 'idle' | 'processing' | 'success' | 'error';
  error: string | null;
  transactionId: string | null;
}

export const useDonation = () => {
  const [state, setState] = useState<DonationState>({
    amount: 0,
    donationType: 'one-time',
    recurringInterval: 'monthly',
    donorInfo: null,
    paymentStatus: 'idle',
    error: null,
    transactionId: null,
  });

  const [donationStats, setDonationStats] = useState({
    totalDonors: 0,
    monthlyDonors: 0,
    totalRaised: 0,
    impactMetrics: {
      livesImpacted: 0,
      communitiesServed: 0,
      monthlyGrowth: 0,
    },
  });

  const [donorWall, setDonorWall] = useState({
    featuredDonors: [],
    recentDonors: [],
  });

  const setAmount = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, amount }));
  }, []);

  const setDonationType = useCallback(
    (donationType: 'one-time' | 'monthly' | 'recurring') => {
      setState((prev) => ({ ...prev, donationType }));
    },
    []
  );

  const setRecurringInterval = useCallback(
    (recurringInterval: 'weekly' | 'biweekly' | 'monthly') => {
      setState((prev) => ({ ...prev, recurringInterval }));
    },
    []
  );

  const setDonorInfo = useCallback(
    (donorInfo: { name: string; email: string }) => {
      setState((prev) => ({ ...prev, donorInfo }));
    },
    []
  );

  const processDonation = useCallback(
    async (paymentMethodId: string) => {
      if (!state.donorInfo) {
        setState((prev) => ({
          ...prev,
          error: 'Donor information is required',
          paymentStatus: 'error',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        paymentStatus: 'processing',
        error: null,
      }));

      try {
        const result = await donationService.processDonation({
          amount: state.amount,
          donationType: state.donationType,
          recurringInterval: state.recurringInterval,
          donorInfo: state.donorInfo,
          paymentMethodId,
        });

        setState((prev) => ({
          ...prev,
          paymentStatus: 'success',
          transactionId: result.transactionId,
        }));

        // Refresh stats after successful donation
        fetchDonationStats();
        fetchDonorWall();

        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          paymentStatus: 'error',
          error: error instanceof Error ? error.message : 'An error occurred',
        }));
        throw error;
      }
    },
    [state.amount, state.donationType, state.recurringInterval, state.donorInfo]
  );

  const fetchDonationStats = useCallback(async () => {
    try {
      const stats = await donationService.getDonationStats();
      setDonationStats(stats);
    } catch (error) {
      console.error('Error fetching donation stats:', error);
    }
  }, []);

  const fetchDonorWall = useCallback(async () => {
    try {
      const donors = await donationService.getDonorWall();
      setDonorWall(donors);
    } catch (error) {
      console.error('Error fetching donor wall:', error);
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      amount: 0,
      donationType: 'one-time',
      recurringInterval: 'monthly',
      donorInfo: null,
      paymentStatus: 'idle',
      error: null,
      transactionId: null,
    });
  }, []);

  return {
    state,
    donationStats,
    donorWall,
    setAmount,
    setDonationType,
    setRecurringInterval,
    setDonorInfo,
    processDonation,
    fetchDonationStats,
    fetchDonorWall,
    reset,
  };
};

export default useDonation;
