import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DonationProvider, useDonation } from '../DonationContext';
import { mockSupabase } from '../../test/utils';

vi.mock('../../lib/supabaseClient', () => ({
  supabase: mockSupabase,
}));

describe('DonationContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DonationProvider>{children}</DonationProvider>
  );

  it('provides initial donation state', () => {
    const { result } = renderHook(() => useDonation(), { wrapper });

    expect(result.current.donationData).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets donation data correctly', () => {
    const { result } = renderHook(() => useDonation(), { wrapper });

    const testDonation = {
      amount: 100,
      currency: 'USD',
      projectId: '123',
      donationType: 'one-time' as const,
    };

    act(() => {
      result.current.setDonationData(testDonation);
    });

    expect(result.current.donationData).toEqual(testDonation);
  });

  it('clears donation data', () => {
    const { result } = renderHook(() => useDonation(), { wrapper });

    act(() => {
      result.current.setDonationData({
        amount: 100,
        currency: 'USD',
        projectId: '123',
        donationType: 'one-time' as const,
      });
    });

    act(() => {
      result.current.clearDonationData();
    });

    expect(result.current.donationData).toBeNull();
  });

  it('handles donation submission', async () => {
    const mockDonation = {
      amount: 100,
      currency: 'USD',
      projectId: '123',
      donationType: 'one-time' as const,
    };

    mockSupabase.from().insert.mockResolvedValueOnce({
      data: { id: '456', ...mockDonation },
      error: null,
    });

    const { result } = renderHook(() => useDonation(), { wrapper });

    await act(async () => {
      await result.current.submitDonation(mockDonation);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('donations');
    expect(mockSupabase.from().insert).toHaveBeenCalledWith([mockDonation]);
  });

  it('handles donation submission error', async () => {
    const mockError = new Error('Submission failed');
    mockSupabase.from().insert.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useDonation(), { wrapper });

    await act(async () => {
      await result.current.submitDonation({
        amount: 100,
        currency: 'USD',
        projectId: '123',
        donationType: 'one-time',
      });
    });

    expect(result.current.error).toBe(mockError.message);
  });

  it('validates donation amount', () => {
    const { result } = renderHook(() => useDonation(), { wrapper });

    act(() => {
      result.current.setDonationData({
        amount: -100, // Invalid amount
        currency: 'USD',
        projectId: '123',
        donationType: 'one-time',
      });
    });

    expect(result.current.error).toBe('Invalid donation amount');
  });

  it('validates donation currency', () => {
    const { result } = renderHook(() => useDonation(), { wrapper });

    act(() => {
      result.current.setDonationData({
        amount: 100,
        currency: 'INVALID',
        projectId: '123',
        donationType: 'one-time',
      });
    });

    expect(result.current.error).toBe('Invalid currency');
  });
});
