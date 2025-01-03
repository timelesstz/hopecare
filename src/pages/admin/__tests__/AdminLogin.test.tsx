import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, fireEvent, waitFor } from '../../../test/utils';
import AdminLogin from '../AdminLogin';
import { mockSupabase } from '../../../test/utils';
import { supabase } from '../../../lib/supabaseClient';

vi.mock('../../../lib/supabaseClient', () => ({
  supabase: mockSupabase,
}));

describe('AdminLogin', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate,
    }));
  });

  it('renders login form correctly', () => {
    render(<AdminLogin />);
    
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles successful login for admin user', async () => {
    const mockUser = { id: '123', email: 'admin@hopecare.org' };
    const mockUserData = { role: 'admin' };

    (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as any)().select().eq().single.mockResolvedValueOnce({
      data: mockUserData,
      error: null,
    });

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@hopecare.org' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('shows error for non-admin user', async () => {
    const mockUser = { id: '123', email: 'user@hopecare.org' };
    const mockUserData = { role: 'user' };

    (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as any)().select().eq().single.mockResolvedValueOnce({
      data: mockUserData,
      error: null,
    });

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@hopecare.org' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/unauthorized access/i)).toBeInTheDocument();
    });
  });

  it('handles login error', async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid credentials'),
    });

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@email.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('disables submit button during login attempt', async () => {
    (supabase.auth.signInWithPassword as any).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<AdminLogin />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/signing in/i);
  });
});
