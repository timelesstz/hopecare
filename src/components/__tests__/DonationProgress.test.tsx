import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { customRender } from '../../test/utils';
import DonationProgress from '../DonationProgress';

const mockDonationData = {
  currentAmount: 5000,
  targetAmount: 10000,
  donorCount: 25,
  recentDonors: [
    { name: 'John Doe', amount: 100 },
    { name: 'Jane Smith', amount: 200 }
  ],
  campaignEndDate: new Date('2024-12-31')
};

describe('DonationProgress Component', () => {
  beforeEach(() => {
    customRender(<DonationProgress {...mockDonationData} />);
  });

  it('displays current donation amount', () => {
    expect(screen.getByText(/\$5,000/)).toBeInTheDocument();
  });

  it('displays target amount', () => {
    expect(screen.getByText(/\$10,000/)).toBeInTheDocument();
  });

  it('shows correct progress percentage', () => {
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('displays donor count', () => {
    expect(screen.getByText(/25 donors/i)).toBeInTheDocument();
  });

  it('shows recent donors', () => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays campaign end date', () => {
    expect(screen.getByText(/December 31, 2024/)).toBeInTheDocument();
  });
});
