import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import EmergencyContactSection from '../EmergencyContactSection';

describe('EmergencyContactSection', () => {
  const mockRegister = vi.fn();
  const mockErrors = {};

  beforeEach(() => {
    mockRegister.mockReturnValue({});
  });

  it('renders all emergency contact fields', () => {
    render(
      <EmergencyContactSection
        register={mockRegister}
        errors={mockErrors}
      />
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/relationship/i)).toBeInTheDocument();
  });

  it('displays validation errors', () => {
    const errors = {
      emergencyContact: {
        name: { message: 'Name is required' },
        phone: { message: 'Phone is required' },
        relationship: { message: 'Relationship is required' }
      }
    };

    render(
      <EmergencyContactSection
        register={mockRegister}
        errors={errors}
      />
    );

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Phone is required')).toBeInTheDocument();
    expect(screen.getByText('Relationship is required')).toBeInTheDocument();
  });

  it('applies correct ARIA labels', () => {
    render(
      <EmergencyContactSection
        register={mockRegister}
        errors={mockErrors}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('aria-label');
    });
  });
});