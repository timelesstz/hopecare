```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CardNameInput from '../CardNameInput';

describe('CardNameInput', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    mockRegister.mockReturnValue({});
  });

  it('renders card name input field', () => {
    render(<CardNameInput register={mockRegister} />);
    
    expect(screen.getByLabelText(/name on card/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'cc-name');
  });

  it('displays description text', () => {
    render(<CardNameInput register={mockRegister} />);
    
    expect(screen.getByText(/enter the name exactly as it appears on your card/i)).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Name on card is required';
    render(<CardNameInput register={mockRegister} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('applies correct ARIA attributes', () => {
    render(<CardNameInput register={mockRegister} error="Name on card is required" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('handles user input correctly', () => {
    const mockOnChange = vi.fn();
    mockRegister.mockReturnValue({ onChange: mockOnChange });

    render(<CardNameInput register={mockRegister} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'John Doe' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });
});
```