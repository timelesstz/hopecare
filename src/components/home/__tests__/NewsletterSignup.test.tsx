import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewsletterSignup from '../NewsletterSignup';

describe('NewsletterSignup', () => {
  it('renders newsletter form', () => {
    render(<NewsletterSignup />);
    
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<NewsletterSignup />);
    
    const input = screen.getByPlaceholderText(/enter your email/i);
    const button = screen.getByRole('button', { name: /subscribe/i });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.getByText(/thank you for subscribing/i)).toBeInTheDocument();
    });
  });
});