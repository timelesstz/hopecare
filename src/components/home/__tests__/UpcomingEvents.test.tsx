import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UpcomingEvents from '../UpcomingEvents';

describe('UpcomingEvents', () => {
  it('renders event cards', () => {
    render(
      <BrowserRouter>
        <UpcomingEvents />
      </BrowserRouter>
    );

    expect(screen.getByText(/Community Health Workshop/i)).toBeInTheDocument();
    expect(screen.getByText(/Youth Education Program/i)).toBeInTheDocument();
  });

  it('displays event details', () => {
    render(
      <BrowserRouter>
        <UpcomingEvents />
      </BrowserRouter>
    );

    expect(screen.getByText('March 20, 2024')).toBeInTheDocument();
    expect(screen.getByText('9:00 AM - 2:00 PM')).toBeInTheDocument();
    expect(screen.getByText('Arusha Community Center')).toBeInTheDocument();
  });

  it('contains view all link', () => {
    render(
      <BrowserRouter>
        <UpcomingEvents />
      </BrowserRouter>
    );

    const viewAllLink = screen.getByText(/View All Events/i).closest('a');
    expect(viewAllLink).toHaveAttribute('href', '/events');
  });
});