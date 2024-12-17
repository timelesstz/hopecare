import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useFormAnalytics } from '../useFormAnalytics';
import { analyticsTracker } from '../../utils/analytics';

vi.mock('../../utils/analytics', () => ({
  analyticsTracker: {
    startFormTracking: vi.fn(),
    completeFormTracking: vi.fn(),
    trackStepCompletion: vi.fn(),
    trackError: vi.fn()
  }
}));

describe('useFormAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts tracking on mount', () => {
    const formId = 'test-form';
    renderHook(() => useFormAnalytics(formId));

    expect(analyticsTracker.startFormTracking).toHaveBeenCalledWith(formId);
  });

  it('completes tracking on unmount', () => {
    const formId = 'test-form';
    const { unmount } = renderHook(() => useFormAnalytics(formId));

    unmount();
    expect(analyticsTracker.completeFormTracking).toHaveBeenCalledWith(formId);
  });

  it('provides tracking methods', () => {
    const formId = 'test-form';
    const { result } = renderHook(() => useFormAnalytics(formId));

    result.current.trackStep(1);
    result.current.trackError('email');

    expect(analyticsTracker.trackStepCompletion).toHaveBeenCalledWith(formId, 1);
    expect(analyticsTracker.trackError).toHaveBeenCalledWith(formId, 'email');
  });
});