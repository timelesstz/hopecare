import { describe, it, expect, vi } from 'vitest';
import { screen, render, waitFor } from '../../test/utils';
import AdminRoute from '../AdminRoute';
import { useAuth } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth');

const MockComponent = () => <div>Protected Content</div>;

describe('AdminRoute', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate,
    }));
  });

  it('renders children when user is admin', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '123', email: 'admin@hopecare.org' },
      isAdmin: true,
      loading: false,
    });

    render(
      <AdminRoute>
        <MockComponent />
      </AdminRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('redirects to login when user is not authenticated', async () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isAdmin: false,
      loading: false,
    });

    render(
      <AdminRoute>
        <MockComponent />
      </AdminRoute>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
    });
  });

  it('redirects to home when user is authenticated but not admin', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '123', email: 'user@hopecare.org' },
      isAdmin: false,
      loading: false,
    });

    render(
      <AdminRoute>
        <MockComponent />
      </AdminRoute>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows loading state while checking authentication', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isAdmin: false,
      loading: true,
    });

    render(
      <AdminRoute>
        <MockComponent />
      </AdminRoute>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles error state in authentication check', async () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isAdmin: false,
      loading: false,
      error: 'Authentication error',
    });

    render(
      <AdminRoute>
        <MockComponent />
      </AdminRoute>
    );

    await waitFor(() => {
      expect(screen.getByText(/authentication error/i)).toBeInTheDocument();
    });
  });
});
