import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import PersonalInfoSection from '../PersonalInfoSection';

describe('PersonalInfoSection', () => {
  const mockRegister = vi.fn();
  const mockErrors = {};
  const mockPassword = '';

  beforeEach(() => {
    mockRegister.mockReturnValue({});
  });

  it('renders all form fields', () => {
    render(
      <PersonalInfoSection
        register={mockRegister}
        errors={mockErrors}
        password={mockPassword}
      />
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/birth date/i)).toBeInTheDocument();
  });

  it('displays validation errors', () => {
    const errors = {
      firstName: { message: 'First name is required' },
      email: { message: 'Invalid email' }
    };

    render(
      <PersonalInfoSection
        register={mockRegister}
        errors={errors}
        password={mockPassword}
      />
    );

    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('calls register for each input field', () => {
    render(
      <PersonalInfoSection
        register={mockRegister}
        errors={mockErrors}
        password={mockPassword}
      />
    );

    expect(mockRegister).toHaveBeenCalledWith('firstName');
    expect(mockRegister).toHaveBeenCalledWith('lastName');
    expect(mockRegister).toHaveBeenCalledWith('email');
    expect(mockRegister).toHaveBeenCalledWith('password');
    expect(mockRegister).toHaveBeenCalledWith('phone');
    expect(mockRegister).toHaveBeenCalledWith('birthDate');
  });
});