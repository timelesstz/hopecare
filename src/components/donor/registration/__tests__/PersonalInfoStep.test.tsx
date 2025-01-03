```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import PersonalInfoStep from '../PersonalInfoStep';
import { useDonorForm } from '../../../../store/donorForm';

// Mock the donor form hook
vi.mock('../../../../store/donorForm', () => ({
  useDonorForm: vi.fn()
}));

describe('PersonalInfoStep', () => {
  const mockUpdateFormData = vi.fn();
  const mockSetStep = vi.fn();

  beforeEach(() => {
    (useDonorForm as any).mockReturnValue({
      formData: {},
      updateFormData: mockUpdateFormData,
      setStep: mockSetStep
    });
  });

  it('renders all form fields', () => {
    render(<PersonalInfoStep />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/birth date/i)).toBeInTheDocument();
  });

  it('displays validation errors', async () => {
    render(<PersonalInfoStep />);
    
    const submitButton = screen.getByText(/next step/i);
    fireEvent.click(submitButton);

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('advances to next step on valid submission', async () => {
    render(<PersonalInfoStep />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' }
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '1234567890' }
    });
    fireEvent.change(screen.getByLabelText(/birth date/i), {
      target: { value: '1990-01-01' }
    });

    // Submit the form
    fireEvent.click(screen.getByText(/next step/i));

    // Verify form data was updated and next step was triggered
    expect(mockUpdateFormData).toHaveBeenCalled();
    expect(mockSetStep).toHaveBeenCalledWith(1);
  });
});
```