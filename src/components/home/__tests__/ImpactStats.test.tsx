import { render, screen } from '@testing-library/react';
import ImpactStats from '../ImpactStats';

describe('ImpactStats', () => {
  it('renders all impact statistics', () => {
    render(<ImpactStats />);

    expect(screen.getByText(/Lives Impacted/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Programs/i)).toBeInTheDocument();
    expect(screen.getByText(/Students Supported/i)).toBeInTheDocument();
    expect(screen.getByText(/Economic Projects/i)).toBeInTheDocument();
  });

  it('displays correct descriptions', () => {
    render(<ImpactStats />);

    expect(screen.getByText(/Community members supported/i)).toBeInTheDocument();
    expect(screen.getByText(/Ongoing initiatives/i)).toBeInTheDocument();
    expect(screen.getByText(/Children receiving educational support/i)).toBeInTheDocument();
    expect(screen.getByText(/Small businesses and entrepreneurs/i)).toBeInTheDocument();
  });
});