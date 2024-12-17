import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from '../HeroSection';

describe('HeroSection', () => {
  it('renders hero content correctly', () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );

    expect(screen.getByText(/Making a Difference in Tanzania/i)).toBeInTheDocument();
    expect(screen.getByText(/Empowering Communities/i)).toBeInTheDocument();
    expect(screen.getByText(/Support Our Cause/i)).toBeInTheDocument();
    expect(screen.getByText(/Become a Volunteer/i)).toBeInTheDocument();
  });

  it('contains correct navigation links', () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );

    const donateLink = screen.getByText(/Support Our Cause/i).closest('a');
    const volunteerLink = screen.getByText(/Become a Volunteer/i).closest('a');

    expect(donateLink).toHaveAttribute('href', '/donate');
    expect(volunteerLink).toHaveAttribute('href', '/volunteer');
  });
});