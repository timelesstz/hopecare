```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PaymentStep from '../PaymentStep';
import { useDonorForm } from '../../../../store/donorForm';
import { useFormAnalytics } from '../../../../hooks/useFormAnalytics';

vi.mock('../../../../store/donorForm');
vi.mock('../../../../hooks/useFormAnalytics');

describe('PaymentStep', () => {
  const mockUpdateFormData = vi.fn();
  const mockSetStep = vi.fn();
  const mockResetForm = vi.fn();
  const mockTrackError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useDonorForm as any).mockReturnValue({
      formData: {},
      updateFormData: mockUpdateFormData,
      setStep: mockSetStep,
      resetForm: mockResetForm
    });

    (useFormAnalytics as any).mockReturnValue({
      trackError: mockTrackError
    });
  });

  it('renders all payment form fields', () => {
    render(<PaymentStep />);

    expect(screen.getByLabelText(/name on card/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<PaymentStep />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name on card/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/card number/i), {
      target: { value: '4111111111111111' }
    });
    fireEvent.change(screen.getByLabelText(/expiry date/i), {
      target: { value: '12/25' }
    });
    fireEvent.change(screen.getByLabelText(/cvv/i), {
      target: { value: '123' }
    });

    // Submit the form
    fireEvent.click(screen.getByText(/complete registration/i));

    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalled();
      expect(mockResetForm).toHaveBeenCalled();
    });
  });

  it('handles back button click', () => {
    render(<PaymentStep />);
    
    fireEvent.click(screen.getByText(/back/i));
    expect(mockSetStep).toHaveBeenCalledWith(2);
  });

  it('displays validation errors', async () => {
    render(<PaymentStep />);
    
    fireEvent.click(screen.getByText(/complete registration/i));

    await waitFor(() => {
      expect(screen.getByText(/name on card is required/i)).toBeInTheDocument();
      expect(mockTrackError).toHaveBeenCalled();
    });
  });

  it('disables buttons while processing', async () => {
    render(<PaymentStep />);

    // Fill out form and submit
    fireEvent.change(screen.getByLabelText(/name on card/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.click(screen.getByText(/complete registration/i));

    // Check that buttons are disabled during processing
    expect(screen.getByText(/back/i)).toBeDisabled();
    expect(screen.getByText(/processing/i)).toBeDisabled();
  });

  it('tracks form errors', async () => {
    render(<PaymentStep />);
    
    fireEvent.click(screen.getByText(/complete registration/i));

    await waitFor(() => {
      expect(mockTrackError).toHaveBeenCalledWith('cardName');
      expect(mockTrackError).toHaveBeenCalledWith('cardNumber');
      expect(mockTrackError).toHaveBeenCalledWith('expiryDate');
      expect(mockTrackError).toHaveBeenCalledWith('cvv');
    });
  });
});
```