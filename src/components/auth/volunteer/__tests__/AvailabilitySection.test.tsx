import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AvailabilitySection from '../AvailabilitySection';

describe('AvailabilitySection', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    mockRegister.mockReturnValue({});
  });

  it('renders all availability checkboxes', () => {
    render(<AvailabilitySection register={mockRegister} />);

    expect(screen.getByLabelText(/weekdays/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weekends/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/evenings/i)).toBeInTheDocument();
  });

  it('handles checkbox changes', () => {
    render(<AvailabilitySection register={mockRegister} />);
    
    const weekdaysCheckbox = screen.getByLabelText(/weekdays/i);
    fireEvent.click(weekdaysCheckbox);
    
    expect(weekdaysCheckbox).toBeChecked();
  });

  it('applies correct ARIA attributes', () => {
    render(<AvailabilitySection register={mockRegister} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAttribute('aria-checked');
    });
  });
});