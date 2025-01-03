import { DonationHistory, RecurringDonation } from '../types/donor';

export const calculateDonationStats = (donations: DonationHistory[]) => {
  const total = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const monthlyDonations = donations.filter(donation => {
    const donationDate = new Date(donation.date);
    const now = new Date();
    return donationDate.getMonth() === now.getMonth() &&
           donationDate.getFullYear() === now.getFullYear();
  });
  const monthlyTotal = monthlyDonations.reduce((sum, donation) => sum + donation.amount, 0);

  return {
    total,
    monthlyTotal,
    count: donations.length,
    monthlyCount: monthlyDonations.length,
    averageAmount: total / donations.length || 0
  };
};

export const calculateRecurringImpact = (donations: RecurringDonation[]) => {
  const activeRecurring = donations.filter(d => d.status === 'active');
  const monthlyTotal = activeRecurring.reduce((sum, donation) => {
    switch (donation.frequency) {
      case 'weekly':
        return sum + (donation.amount * 4);
      case 'monthly':
        return sum + donation.amount;
      case 'quarterly':
        return sum + (donation.amount / 3);
      case 'annually':
        return sum + (donation.amount / 12);
      default:
        return sum;
    }
  }, 0);

  return {
    activeCount: activeRecurring.length,
    monthlyTotal,
    yearlyProjection: monthlyTotal * 12
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const calculateImpactScore = (
  donations: DonationHistory[],
  recurringDonations: RecurringDonation[]
): number => {
  const donationScore = donations.length * 10;
  const amountScore = donations.reduce((sum, d) => sum + (d.amount / 100), 0);
  const recurringScore = recurringDonations.filter(d => d.status === 'active').length * 50;
  
  return Math.round(donationScore + amountScore + recurringScore);
};