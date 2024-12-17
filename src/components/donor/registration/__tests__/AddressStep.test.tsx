```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AddressStep from '../AddressStep';
import { useDonorForm } from '../../../../store/donorForm';

vi.mock('../../../../store/donorForm', () => ({
  useDonorForm: vi.fn()
}));

describe('AddressStep', () => {
  const mockUpdateFormData = vi.fn();
  const mockSetStep = vi.fn();

  beforeEach(() => {
    (useDonorForm as any).mockReturnValue({
      formData: {},
      updateFormData: mockUpdateFormData,
      setStep: mockSetStep
    });
  });

  it('renders all address fields', () => {
    render(<AddressStep />);

    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state\/province/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
  });

  it('displays validation errors', async () => {
    render(<AddressStep />);
    
    const submitButton = screen.getByText(/next step/i);
    fireEvent.click(submitButton);

    expect(await screen.findByText(/street address is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/city is required/i)).toBeInTheDocument();
  });

  it('handles back button click', () => {
    render(<AddressStep />);
    
    const backButton = screen.getByText(/back/i);
    fireEvent.click(backButton);

    expect(mockSetStep).toHaveBeenCalledWith(0);
  });

  it('advances to next step on valid submission', async () => {
    render(<AddressStep />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/street address/i), {
      target: { value: '123 Main St' }
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: 'Arusha' }
    });
    fireEvent.change(screen.getByLabelText(/state\/province/i), {
      target: { value: 'Arusha Region' }
    });
    fireEvent.change(screen.getByLabelText(/postal code/i), {
      target: { value: '12345' }
    });
    fireEvent.change(screen.getByLabelText(/country/i), {
      target: { value: 'TZ' }
    });

    // Submit the form
    fireEvent.click(screen.getByText(/next step/i));

    // Verify form data was updated and next step was triggered
    expect(mockUpdateFormData).toHaveBeenCalled();
    expect(mockSetStep).toHaveBeenCalledWith(2);
  });

  it('applies correct ARIA attributes', () => {
    render(<AddressStep />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });
});
```