```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import PaymentButtons from '../PaymentButtons';

describe('PaymentButtons', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders back and submit buttons', () => {
    render(<PaymentButtons onBack={mockOnBack} isProcessing={false} />);
    
    expect(screen.getByText(/back/i)).toBeInTheDocument();
    expect(screen.getByText(/complete registration/i)).toBeInTheDocument();
  });

  it('handles back button click', () => {
    render(<PaymentButtons onBack={mockOnBack} isProcessing={false} />);
    
    fireEvent.click(screen.getByText(/back/i));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('disables buttons while processing', () => {
    render(<PaymentButtons onBack={mockOnBack} isProcessing={true} />);
    
    expect(screen.getByText(/back/i)).toBeDisabled();
    expect(screen.getByText(/processing/i)).toBeDisabled();
  });

  it('shows processing state', () => {
    render(<PaymentButtons onBack={mockOnBack} isProcessing={true} />);
    
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
    expect(screen.queryByText(/complete registration/i)).not.toBeInTheDocument();
  });

  it('applies correct button styles', () => {
    render(<PaymentButtons onBack={mockOnBack} isProcessing={false} />);
    
    const submitButton = screen.getByText(/complete registration/i);
    expect(submitButton).toHaveClass('bg-rose-600', 'text-white');
  });
});
```