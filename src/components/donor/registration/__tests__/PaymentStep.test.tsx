```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PaymentStep from '../PaymentStep';
import { useDonorForm } from '../../../../store/donorForm';
import { useFormAnalytics } from '../../../../hooks/useFormAnalytics';

vi.mock('../../../../store/donorForm', () => ({
  useDonorForm: vi.fn()
}));

vi.mock('../../../../hooks/useFormAnalytics', () => ({
  useFormAnalytics: vi.fn()
}));

describe('PaymentStep', () => {
  const mockUpdateFormData = vi.fn();
  const mockSetStep = vi.fn();
  const mockResetForm = vi.fn();
  const mockTrackError = vi.fn();

  beforeEach(() => {
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

  it('renders all payment fields', () => {
    render(<PaymentStep />);

    expect(screen.getByLabelText(/name on card/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();
  });

  it('formats card number with spaces', async () => {
    render(<PaymentStep />);
    
    const cardInput = screen.getByLabelText(/card number/i);
    fireEvent.change(cardInput, { target: { value: '4111111111111111' } });
    
    expect(cardInput).toHaveValue('4111 1111 1111 1111');
  });

  it('formats expiry date with slash', async () => {
    render(<PaymentStep />);
    
    const expiryInput = screen.getByLabelText(/expiry date/i);
    fireEvent.change(expiryInput, { target: { value: '1224' } });
    
    expect(expiryInput).toHaveValue('12/24');
  });

  it('displays validation errors', async () => {
    render(<PaymentStep />);
    
    fireEvent.click(screen.getByText(/complete registration/i));

    await waitFor(() => {
      expect(screen.getByText(/name on card is required/i)).toBeInTheDocument();
      expect(mockTrackError).toHaveBeenCalled();
    });
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
      target: { value: '12/24' }
    });
    fireEvent.change(screen.getByLabelText(/cvv/i), {
      target: { value: '123' }
    });

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

  it('disables buttons while processing', async () => {
    render(<PaymentStep />);

    // Submit the form
    fireEvent.click(screen.getByText(/complete registration/i));

    // Check that buttons are disabled
    expect(screen.getByText(/back/i)).toBeDisabled();
    expect(screen.getByText(/processing/i)).toBeDisabled();
  });

  it('applies correct ARIA attributes', () => {
    render(<PaymentStep />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });
});
```