import { screen } from '@testing-library/react';
import { render } from '../../../../../test/utils';
import PaymentSummary from '../PaymentSummary';

describe('PaymentSummary', () => {
  const defaultProps = {
    cardName: 'John Doe',
    cardNumber: '4111 1111 1111 1111',
    expiryDate: '12/25'
  };

  it('renders payment summary with correct card information', () => {
    render(<PaymentSummary {...defaultProps} />);

    expect(screen.getByText('visa')).toBeInTheDocument();
    expect(screen.getByText('•••• 1111')).toBeInTheDocument();
    expect(screen.getByText('12/25')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles different card types', () => {
    render(
      <PaymentSummary
        {...defaultProps}
        cardNumber="5425 2334 3010 9903"
      />
    );

    expect(screen.getByText('mastercard')).toBeInTheDocument();
  });

  it('displays masked card number correctly', () => {
    render(
      <PaymentSummary
        {...defaultProps}
        cardNumber="3714 4963 5398 431"
      />
    );

    expect(screen.getByText('•••• 8431')).toBeInTheDocument();
  });

  it('applies correct styling', () => {
    render(<PaymentSummary {...defaultProps} />);

    const container = screen.getByRole('region');
    expect(container).toHaveClass('bg-gray-50', 'rounded-lg');
  });

  it('has correct accessibility attributes', () => {
    render(<PaymentSummary {...defaultProps} />);

    const container = screen.getByRole('region');
    expect(container).toHaveAttribute('aria-label', 'Payment Summary');
  });
});