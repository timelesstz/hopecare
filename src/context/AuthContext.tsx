import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { securityManager } from '../middleware/security';

export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['ADMIN', 'DONOR', 'VOLUNTEER']),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  last_login: z.string().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type UserData = z.infer<typeof userSchema>;

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  error: string | null;
  lastActivity: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  error: string | null;
  lastActivity: number;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (data: Omit<UserData, 'id' | 'last_login' | 'created_at' | 'updated_at'>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
  clearError: () => void;
  socialAuth: (provider: 'google' | 'microsoft', role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'user_auth';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
    lastActivity: Date.now()
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) throw userError;

          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: userData,
            loading: false,
            lastActivity: Date.now()
          }));
        } else {
          setState(prev => ({
            ...prev,
            loading: false
          }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize authentication',
          loading: false
        }));
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) throw userError;

          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: userData,
            loading: false,
            error: null,
            lastActivity: Date.now()
          }));
        } catch (error) {
          console.error('Error fetching user data:', error);
          setState(prev => ({
            ...prev,
            error: 'Failed to fetch user data',
            loading: false
          }));
        }
      } else if (event === 'SIGNED_OUT') {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          loading: false
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkActivity = () => {
      if (state.isAuthenticated && Date.now() - state.lastActivity > INACTIVITY_TIMEOUT) {
        logout();
      }
    };

    const interval = setInterval(checkActivity, 60000);
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.lastActivity]);

  useEffect(() => {
    const updateActivity = () => {
      if (state.isAuthenticated) {
        setState(prev => ({ ...prev, lastActivity: Date.now() }));
      }
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
    };
  }, [state.isAuthenticated]);

  const login = async (email: string, password: string, role?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Temporary local admin authentication for development
      if (email === 'admin@hopecare.org' && password === 'admin123' && role === 'ADMIN') {
        const tempAdminUser: UserData = {
          id: 'temp-admin-id',
          email: 'admin@hopecare.org',
          name: 'Admin User',
          role: 'ADMIN',
          status: 'ACTIVE',
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: tempAdminUser,
          loading: false,
          error: null,
          lastActivity: Date.now()
        }));

        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          user: tempAdminUser,
          lastActivity: Date.now()
        }));

        return;
      }

      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!user) throw new Error('No user returned from authentication');

      // Fetch user profile from our users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('User profile not found');

      // Verify role if specified
      if (role && profile.role !== role) {
        throw new Error(`Invalid credentials for ${role.toLowerCase()} login`);
      }

      const userData = userSchema.parse(profile);
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: userData,
        loading: false,
        error: null,
        lastActivity: Date.now()
      }));

      // Store session data
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user: userData,
        lastActivity: Date.now()
      }));

    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred during login'
      }));
      throw error;
    }
  };

  const register = async (data: Omit<UserData, 'id' | 'last_login' | 'created_at' | 'updated_at'>) => {
    try {
      // Create auth user with email verification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
          },
          emailRedirectTo: `${window.location.origin}/admin/verify-email`
        }
      });

      if (authError) throw authError;

      // Create user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user?.id,
          email: data.email,
          name: data.name,
          role: data.role,
          status: 'INACTIVE', // Will be activated after email verification
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (profileError) throw profileError;

      // Log registration attempt
      await supabase
        .from('audit_logs')
        .insert([{
          user_id: authData.user?.id,
          action: 'REGISTER',
          details: {
            email: data.email,
            role: data.role,
            timestamp: new Date().toISOString()
          }
        }]);

      setState(prev => ({
        ...prev,
        error: null,
        loading: false
      }));

    } catch (error) {
      console.error('Registration error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Registration failed',
        loading: false
      }));
      throw error;
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        lastActivity: Date.now()
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Logout failed'
      }));
    }
  };

  const resetPassword = async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Password reset failed'
      }));
    }
  };

  const updateProfile = async (data: Partial<UserData>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      if (!state.user?.id) throw new Error('No user logged in');

      const { error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...data } : null,
        loading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Profile update failed'
      }));
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const socialAuth = async (provider: 'google' | 'microsoft', role: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/admin/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          data: {
            role,
          }
        }
      });

      if (error) throw error;

      // Create or update user profile after successful OAuth
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata.full_name,
            role,
            status: 'ACTIVE',
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (profileError) throw profileError;
      }

      setState(prev => ({
        ...prev,
        error: null,
        loading: false
      }));

    } catch (error) {
      console.error('Social auth error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Social authentication failed',
        loading: false
      }));
      throw error;
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        clearError,
        socialAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}