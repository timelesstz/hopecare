import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LatestNews from '../LatestNews';

describe('LatestNews', () => {
  it('renders news articles', () => {
    render(
      <BrowserRouter>
        <LatestNews />
      </BrowserRouter>
    );

    expect(screen.getByText(/New Education Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Community Health Initiative/i)).toBeInTheDocument();
    expect(screen.getByText(/Volunteer Training Program/i)).toBeInTheDocument();
  });

  it('displays article metadata', () => {
    render(
      <BrowserRouter>
        <LatestNews />
      </BrowserRouter>
    );

    expect(screen.getByText('March 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getAllByText(/Read More/i)).toHaveLength(3);
  });

  it('contains view all link', () => {
    render(
      <BrowserRouter>
        <LatestNews />
      </BrowserRouter>
    );

    const viewAllLink = screen.getByText(/View All News/i).closest('a');
    expect(viewAllLink).toHaveAttribute('href', '/blog');
  });
});