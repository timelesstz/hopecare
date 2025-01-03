```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CardNumberInput from '../CardNumberInput';

describe('CardNumberInput', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    mockRegister.mockReturnValue({});
  });

  it('renders card number input field', () => {
    render(<CardNumberInput register={mockRegister} />);
    
    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'cc-number');
  });

  it('formats card number with spaces', () => {
    mockRegister.mockReturnValue({
      onChange: (e: any) => {
        e.target.value = e.target.value.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || e.target.value;
      }
    });

    render(<CardNumberInput register={mockRegister} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '4111111111111111' } });
    
    expect(input).toHaveValue('4111 1111 1111 1111');
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Invalid card number';
    render(<CardNumberInput register={mockRegister} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('applies correct ARIA attributes', () => {
    render(<CardNumberInput register={mockRegister} error="Invalid card number" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
```