import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import InterestsSection from '../InterestsSection';

describe('InterestsSection', () => {
  const mockRegister = vi.fn();
  const mockErrors = {};

  beforeEach(() => {
    mockRegister.mockReturnValue({});
  });

  it('renders all interest checkboxes', () => {
    render(
      <InterestsSection
        register={mockRegister}
        errors={mockErrors}
      />
    );

    expect(screen.getByText('Education Programs')).toBeInTheDocument();
    expect(screen.getByText('Health Initiatives')).toBeInTheDocument();
    expect(screen.getByText('Youth Programs')).toBeInTheDocument();
  });

  it('displays validation errors', () => {
    const errors = {
      interests: { message: 'Select at least one interest' }
    };

    render(
      <InterestsSection
        register={mockRegister}
        errors={errors}
      />
    );

    expect(screen.getByText('Select at least one interest')).toBeInTheDocument();
  });

  it('handles checkbox interactions', () => {
    render(
      <InterestsSection
        register={mockRegister}
        errors={mockErrors}
      />
    );

    const checkbox = screen.getByLabelText('Education Programs');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('applies correct ARIA attributes', () => {
    render(
      <InterestsSection
        register={mockRegister}
        errors={mockErrors}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAttribute('aria-label');
    });
  });
});