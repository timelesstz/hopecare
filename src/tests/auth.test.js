import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../context/SupabaseAuthContext';
import { renderHook, act } from '@testing-library/react';

// Mock Supabase auth
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  }))
}));

describe('Supabase Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Functionality', () => {
    it('should successfully log in a user with valid credentials', async () => {
      // Mock successful login
      signInWithEmailAndPassword.mockResolvedValueOnce({
        user: { 
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User'
        }
      });

      const { result } = renderHook(() => useFirebaseAuth());
      
      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123'
        });
      });

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'password123'
      );
      expect(result.current.user).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User'
      });
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle login errors correctly', async () => {
      // Mock login error
      const mockError = new Error('Invalid credentials');
      mockError.code = 'auth/wrong-password';
      signInWithEmailAndPassword.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useFirebaseAuth());
      
      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      });

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'wrongpassword'
      );
      expect(result.current.error).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Registration Functionality', () => {
    it('should successfully register a new user', async () => {
      // Mock successful registration
      createUserWithEmailAndPassword.mockResolvedValueOnce({
        user: { 
          uid: 'new-user-uid',
          email: 'newuser@example.com'
        }
      });
      
      updateProfile.mockResolvedValueOnce({});

      const { result } = renderHook(() => useFirebaseAuth());
      
      await act(async () => {
        await result.current.register({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          role: 'DONOR'
        });
      });

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'newuser@example.com',
        'password123'
      );
      expect(updateProfile).toHaveBeenCalled();
    });

    it('should handle registration errors correctly', async () => {
      // Mock registration error
      const mockError = new Error('Email already in use');
      mockError.code = 'auth/email-already-in-use';
      createUserWithEmailAndPassword.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useFirebaseAuth());
      
      await act(async () => {
        await result.current.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User',
          role: 'DONOR'
        });
      });

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'existing@example.com',
        'password123'
      );
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Password Reset Functionality', () => {
    it('should send a password reset email', async () => {
      // Mock successful password reset
      sendPasswordResetEmail.mockResolvedValueOnce({});

      const { result } = renderHook(() => useFirebaseAuth());
      
      await act(async () => {
        await result.current.resetPassword('test@example.com');
      });

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        auth,
        'test@example.com'
      );
    });

    it('should handle password reset errors', async () => {
      // Mock password reset error
      const mockError = new Error('User not found');
      mockError.code = 'auth/user-not-found';
      sendPasswordResetEmail.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useFirebaseAuth());
      
      await act(async () => {
        await result.current.resetPassword('nonexistent@example.com');
      });

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        auth,
        'nonexistent@example.com'
      );
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Logout Functionality', () => {
    it('should successfully log out a user', async () => {
      // Mock successful logout
      signOut.mockResolvedValueOnce({});

      const { result } = renderHook(() => useFirebaseAuth());
      
      // Set initial state as logged in
      result.current.user = { uid: 'test-uid', email: 'test@example.com' };
      result.current.isAuthenticated = true;

      await act(async () => {
        await result.current.logout();
      });

      expect(signOut).toHaveBeenCalledWith(auth);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});