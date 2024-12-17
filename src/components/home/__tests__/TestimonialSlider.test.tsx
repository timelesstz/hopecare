import { render, screen, fireEvent, act } from '@testing-library/react';
import TestimonialSlider from '../TestimonialSlider';

describe('TestimonialSlider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders testimonials', () => {
    render(<TestimonialSlider />);
    
    expect(screen.getByText(/Sarah M./)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next testimonial/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous testimonial/i })).toBeInTheDocument();
  });

  it('navigates through testimonials', () => {
    render(<TestimonialSlider />);
    
    const nextButton = screen.getByRole('button', { name: /next testimonial/i });
    
    fireEvent.click(nextButton);
    
    expect(screen.getByText(/John D./)).toBeInTheDocument();
  });

  it('auto-advances testimonials', () => {
    render(<TestimonialSlider />);
    
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(screen.getByText(/John D./)).toBeInTheDocument();
  });
});