import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mockFirestore } from '../../test/mockFirebase';
import { DonationProvider, useDonation } from '../DonationContext';
import { collection, addDoc } from 'firebase/firestore';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: mockFirestore,
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
}));

// Test component that uses the donation context
const TestComponent = () => {
  const { donations, addDonation, loading, error } = useDonation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDonation({
      name: 'Test Donor',
      email: 'test@example.com',
      amount: 100,
      message: 'Test donation',
      date: new Date().toISOString(),
    });
  };
  
  return (
    <div>
      <h1>Donation Test</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <p>Total Donations: {donations.length}</p>
      <form onSubmit={handleSubmit}>
        <button type="submit">Add Donation</button>
      </form>
    </div>
  );
};

describe('DonationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('provides donation context to children', () => {
    render(
      <DonationProvider>
        <TestComponent />
      </DonationProvider>
    );
    
    expect(screen.getByText('Donation Test')).toBeInTheDocument();
    expect(screen.getByText('Total Donations: 0')).toBeInTheDocument();
  });
  
  test('adds a donation successfully', async () => {
    // Mock successful Firestore addDoc
    (collection as any).mockReturnValueOnce('donations-collection');
    (addDoc as any).mockResolvedValueOnce({ id: 'new-donation-id' });
    
    render(
      <DonationProvider>
        <TestComponent />
      </DonationProvider>
    );
    
    fireEvent.click(screen.getByText('Add Donation'));
    
    await waitFor(() => {
      expect(collection).toHaveBeenCalledWith(mockFirestore, 'donations');
      expect(addDoc).toHaveBeenCalledWith('donations-collection', expect.objectContaining({
        name: 'Test Donor',
        email: 'test@example.com',
        amount: 100,
      }));
    });
  });
  
  test('handles donation error', async () => {
    const mockError = new Error('Failed to add donation');
    
    // Mock Firestore error
    (collection as any).mockReturnValueOnce('donations-collection');
    (addDoc as any).mockRejectedValueOnce(mockError);
    
    render(
      <DonationProvider>
        <TestComponent />
      </DonationProvider>
    );
    
    fireEvent.click(screen.getByText('Add Donation'));
    
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to add donation')).toBeInTheDocument();
    });
  });
});
