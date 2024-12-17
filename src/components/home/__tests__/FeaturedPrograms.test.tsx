import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FeaturedPrograms from '../FeaturedPrograms';

describe('FeaturedPrograms', () => {
  it('renders all program cards', () => {
    render(
      <BrowserRouter>
        <FeaturedPrograms />
      </BrowserRouter>
    );

    expect(screen.getByText(/Education Support/i)).toBeInTheDocument();
    expect(screen.getByText(/Health Initiatives/i)).toBeInTheDocument();
    expect(screen.getByText(/Environmental Action/i)).toBeInTheDocument();
  });

  it('contains correct program links', () => {
    render(
      <BrowserRouter>
        <FeaturedPrograms />
      </BrowserRouter>
    );

    const learnMoreLinks = screen.getAllByText(/Learn More/i);
    expect(learnMoreLinks).toHaveLength(3);
    
    learnMoreLinks.forEach(link => {
      expect(link.closest('a')).toHaveAttribute('href', expect.stringMatching(/^\/programs\//));
    });
  });
});