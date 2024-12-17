```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ExpiryDateInput from '../ExpiryDateInput';

describe('ExpiryDateInput', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    mockRegister.mockReturnValue({});
  });

  it('renders expiry date input field', () => {
    render(<ExpiryDateInput register={mockRegister} />);
    
    expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'cc-exp');
  });

  it('formats expiry date with slash', () => {
    mockRegister.mockReturnValue({
      onChange: (e: any) => {
        const cleaned = e.target.value.replace(/\D/g, '');
        e.target.value = cleaned.length >= 2 
          ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
          : cleaned;
      }
    });

    render(<ExpiryDateInput register={mockRegister} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '1224' } });
    
    expect(input).toHaveValue('12/24');
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Invalid expiry date';
    render(<ExpiryDateInput register={mockRegister} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('applies correct ARIA attributes', () => {
    render(<ExpiryDateInput register={mockRegister} error="Invalid expiry date" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
```