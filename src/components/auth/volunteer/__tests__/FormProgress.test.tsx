import { render, screen } from '@testing-library/react';
import FormProgress from '../FormProgress';

describe('FormProgress', () => {
  const steps = ['Personal Info', 'Skills', 'Availability', 'Interests', 'Emergency Contact'];

  it('renders all steps', () => {
    render(<FormProgress currentStep={0} steps={steps} />);

    steps.forEach(step => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });

  it('highlights current step', () => {
    render(<FormProgress currentStep={2} steps={steps} />);

    const stepElements = screen.getAllByText(/\d/);
    expect(stepElements[2]).toHaveClass('bg-rose-600');
  });

  it('shows check marks for completed steps', () => {
    render(<FormProgress currentStep={3} steps={steps} />);

    const checkMarks = screen.getAllByTestId('check-icon');
    expect(checkMarks).toHaveLength(3);
  });

  it('applies correct ARIA labels', () => {
    render(<FormProgress currentStep={1} steps={steps} />);

    steps.forEach((step, index) => {
      const stepElement = screen.getByText(step);
      expect(stepElement).toHaveAttribute('aria-current', index === 1 ? 'step' : undefined);
    });
  });
});