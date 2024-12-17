import { useState, useEffect } from 'react';
import { Donor, DonationHistory, RecurringDonation } from '../types/donor';

export const useDonor = (donorId: string) => {
  const [donor, setDonor] = useState<Donor | null>(null);
  const [donations, setDonations] = useState<DonationHistory[]>([]);
  const [recurringDonations, setRecurringDonations] = useState<RecurringDonation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        // In a real app, these would be API calls
        // For now, we'll use mock data
        const mockDonor: Donor = {
          id: donorId,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "(555) 123-4567",
          address: "123 Main St, Anytown, ST 12345",
          birthDate: "1980-01-01",
          joinDate: "2024-01-15",
          preferredCommunication: "email",
          interests: ["Education", "Health", "Environment"],
          donationTotal: 2450,
          monthlyAverage: 245,
          impactScore: 850,
          status: "active",
          lastLogin: new Date().toISOString()
        };

        const mockDonations: DonationHistory[] = [
          {
            id: "1",
            amount: 100,
            date: "2024-03-15",
            campaign: "Education Fund",
            status: "completed",
            paymentMethod: "**** 4242",
            receipt: "receipt-1.pdf"
          },
          {
            id: "2",
            amount: 50,
            date: "2024-03-01",
            campaign: "Community Garden",
            status: "completed",
            paymentMethod: "**** 4242",
            receipt: "receipt-2.pdf"
          }
        ];

        const mockRecurring: RecurringDonation[] = [
          {
            id: "1",
            amount: 25,
            frequency: "monthly",
            campaign: "General Fund",
            nextDate: "2024-04-01",
            paymentMethod: "**** 4242",
            status: "active",
            startDate: "2024-01-01"
          }
        ];

        setDonor(mockDonor);
        setDonations(mockDonations);
        setRecurringDonations(mockRecurring);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch donor data'));
        setIsLoading(false);
      }
    };

    fetchDonorData();
  }, [donorId]);

  const updateDonorProfile = async (updates: Partial<Donor>) => {
    try {
      // In a real app, this would be an API call
      setDonor(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      return false;
    }
  };

  const cancelRecurringDonation = async (donationId: string) => {
    try {
      // In a real app, this would be an API call
      setRecurringDonations(prev =>
        prev.map(donation =>
          donation.id === donationId
            ? { ...donation, status: 'cancelled', endDate: new Date().toISOString() }
            : donation
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to cancel donation'));
      return false;
    }
  };

  return {
    donor,
    donations,
    recurringDonations,
    isLoading,
    error,
    updateDonorProfile,
    cancelRecurringDonation
  };
};

export default useDonor;