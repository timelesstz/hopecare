import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { customRender } from '../../test/utils';
import Navbar from '../Navbar';

describe('Navbar Component', () => {
  beforeEach(() => {
    customRender(<Navbar />);
  });

  it('renders the HopeCare logo', () => {
    expect(screen.getByAltText('HopeCare Logo')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    expect(screen.getByText(/Programs/i)).toBeInTheDocument();
    expect(screen.getByText(/Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Donate/i)).toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger button is clicked', () => {
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(menuButton);
    
    // Check if mobile menu is visible
    const mobileMenu = screen.getByRole('navigation');
    expect(mobileMenu).toBeVisible();
  });

  it('shows login/register buttons when user is not authenticated', () => {
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
  });
});
