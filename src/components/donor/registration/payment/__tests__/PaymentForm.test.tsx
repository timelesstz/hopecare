import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PaymentForm from '../PaymentForm';
import { useFormAnalytics } from '../../../../../hooks/useFormAnalytics';

vi.mock('../../../../../hooks/useFormAnalytics');

describe('PaymentForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnBack = vi.fn();
  const mockTrackError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useFormAnalytics as any).mockReturnValue({
      trackError: mockTrackError
    });
  });

  it('renders all payment form fields', () => {
    render(
      <PaymentForm
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
        isProcessing={false}
      />
    );

    expect(screen.getByLabelText(/name on card/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(
      <PaymentForm
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
        isProcessing={false}
      />
    );

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
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('shows payment summary when fields are filled', async () => {
    render(
      <PaymentForm
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
        isProcessing={false}
      />
    );

    fireEvent.change(screen.getByLabelText(/name on card/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/card number/i), {
      target: { value: '4111111111111111' }
    });
    fireEvent.change(screen.getByLabelText(/expiry date/i), {
      target: { value: '12/25' }
    });

    await waitFor(() => {
      expect(screen.getByText('Payment Summary')).toBeInTheDocument();
    });
  });

  it('tracks form errors', async () => {
    render(
      <PaymentForm
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
        isProcessing={false}
      />
    );
    
    fireEvent.click(screen.getByText(/complete registration/i));

    await waitFor(() => {
      expect(mockTrackError).toHaveBeenCalledWith('cardName');
      expect(mockTrackError).toHaveBeenCalledWith('cardNumber');
      expect(mockTrackError).toHaveBeenCalledWith('expiryDate');
      expect(mockTrackError).toHaveBeenCalledWith('cvv');
    });
  });
});