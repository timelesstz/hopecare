```typescript
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import CVVInput from '../CVVInput';

describe('CVVInput', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    mockRegister.mockReturnValue({});
  });

  it('renders CVV input field', () => {
    render(<CVVInput register={mockRegister} />);
    
    expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cvv/i)).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText(/cvv/i)).toHaveAttribute('autocomplete', 'cc-csc');
  });

  it('displays description text', () => {
    render(<CVVInput register={mockRegister} />);
    
    expect(screen.getByText(/3 or 4 digit security code/i)).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Invalid CVV';
    render(<CVVInput register={mockRegister} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('applies correct ARIA attributes', () => {
    render(<CVVInput register={mockRegister} error="Invalid CVV" />);
    
    const input = screen.getByLabelText(/cvv/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
```