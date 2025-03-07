import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminLogin from '../AdminLogin';
import { mockAuth, mockFirestore } from '../../../test/mockFirebase';
import { auth, db } from '../../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { vi } from 'vitest';

// Mock Firebase modules
vi.mock('../../../lib/firebase', () => ({
  auth: mockAuth,
  db: mockFirestore,
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

describe('AdminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders login form', () => {
    render(<AdminLogin />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('handles successful login for admin', async () => {
    // Mock successful Firebase auth
    (signInWithEmailAndPassword as any).mockResolvedValueOnce({
      user: { uid: 'test-uid', email: 'admin@example.com' }
    });

    // Mock Firestore query for admin user
    const mockQuerySnapshot = {
      empty: false,
      docs: [{
        data: () => ({ role: 'admin' }),
      }]
    };
    (collection as any).mockReturnValueOnce('users-collection');
    (query as any).mockReturnValueOnce('users-query');
    (where as any).mockReturnValueOnce('users-where');
    (getDocs as any).mockResolvedValueOnce(mockQuerySnapshot);

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'admin@example.com',
        'password123'
      );
      expect(collection).toHaveBeenCalledWith(db, 'users');
      expect(where).toHaveBeenCalledWith('uid', '==', 'test-uid');
    });
  });

  test('handles successful login for non-admin', async () => {
    // Mock successful Firebase auth
    (signInWithEmailAndPassword as any).mockResolvedValueOnce({
      user: { uid: 'test-uid', email: 'user@example.com' }
    });

    // Mock Firestore query for non-admin user
    const mockQuerySnapshot = {
      empty: false,
      docs: [{
        data: () => ({ role: 'user' }),
      }]
    };
    (collection as any).mockReturnValueOnce('users-collection');
    (query as any).mockReturnValueOnce('users-query');
    (where as any).mockReturnValueOnce('users-where');
    (getDocs as any).mockResolvedValueOnce(mockQuerySnapshot);

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });
  });

  test('handles login error', async () => {
    // Mock Firebase auth error
    (signInWithEmailAndPassword as any).mockImplementationOnce(() =>
      Promise.reject(new Error('Invalid login credentials'))
    );

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
    });
  });
});
