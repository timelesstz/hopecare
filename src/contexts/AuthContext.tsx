import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

// Define the structure of our authentication state
interface AuthState {
  isAuthenticated: boolean;
  user: SupabaseUser | null;
  userDetails: AppUser | null;
  loading: boolean;
  error: string | null;
  session: Session | null;
}

// Our custom user type that includes Supabase user data plus our custom fields
export interface AppUser {
  id: string;
  email: string;
  role?: string;
  display_name?: string;
}

// Define the authentication context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (data: any) => Promise<boolean>;
  clearError: () => void;
  getUserData: () => AppUser | null;
}

// Initial state for the auth context
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  userDetails: null,
  loading: true,
  error: null,
  session: null,
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  resetPassword: async () => false,
  updateProfile: async () => false,
  clearError: () => {},
  getUserData: () => null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Check for existing session on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        await fetchUserDetails(session.user);
      } else {
        setState({
          ...initialState,
          loading: false,
        });
      }
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (session) {
          await fetchUserDetails(session.user);
        } else {
          setState({
            ...initialState,
            loading: false,
          });
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user details from Supabase
  const fetchUserDetails = async (user: SupabaseUser) => {
    try {
      // Use user metadata from the auth session to avoid RLS permission issues
      // Extract role from user metadata or default to 'admin'
      const role = user.user_metadata?.role || 'admin'; // Default to admin for existing users
      const displayName = user.user_metadata?.name || user.email?.split('@')[0] || '';
      
      // Create basic user details from auth data
      const userDetails: AppUser = {
        id: user.id,
        email: user.email || '',
        role: role.toLowerCase(), // Ensure role is lowercase for consistency
        display_name: displayName
      };
      
      console.log('User details from auth metadata:', userDetails);
      
      // Store user details in localStorage for components that might need it
      try {
        localStorage.setItem('userData', JSON.stringify(userDetails));
        localStorage.setItem('userRole', userDetails.role || 'admin');
      } catch (error) {
        console.error('Error storing user data in localStorage:', error);
      }
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      setState({
        isAuthenticated: true,
        user,
        userDetails,
        loading: false,
        error: null,
        session,
      });
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      setState({
        ...initialState,
        loading: false,
        error: 'Failed to fetch user details: ' + error.message,
      });
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Store role in localStorage for immediate access
      if (data.user) {
        const role = data.user.user_metadata?.role || 'admin';
        try {
          localStorage.setItem('userRole', role.toLowerCase());
        } catch (err) {
          console.error('Error storing role in localStorage:', err);
        }
      }
      
      // User will be automatically detected by the onAuthStateChange listener
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to sign in';
      
      // Handle specific Supabase auth errors
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.message.includes('disabled')) {
        errorMessage = 'This account has been disabled. Please contact support.';
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      toast.error(errorMessage);
      return false;
    }
  };

  // Register a new user
  const register = async (email: string, password: string, userData: any): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name || '',
            role: (userData.role || 'user').toLowerCase(),
          }
        }
      });
      
      if (error) throw error;
      
      if (!data.user) {
        throw new Error('Failed to create user account');
      }
      
      toast.success('Registration successful! Please check your email to confirm your account.');
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to register',
      }));
      toast.error(error.message || 'Failed to register');
      return false;
    }
  };

  // Logout the current user
  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user data from localStorage
      try {
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
      } catch (error) {
        console.error('Error clearing user data from localStorage:', error);
      }
      
      setState({
        ...initialState,
        loading: false,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to sign out',
      }));
      toast.error(error.message || 'Failed to sign out');
    }
  };

  // Send password reset email
  const resetPassword = async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setState(prev => ({ ...prev, loading: false }));
      toast.success('Password reset instructions sent to your email');
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to send password reset email',
      }));
      toast.error(error.message || 'Failed to send password reset email');
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (data: any) => {
    if (!state.user) return false;

    setState(prev => ({ ...prev, loading: true }));
    try {
      // Get user role from local storage or state to avoid querying the users table
      const userData = getUserData();
      if (!userData) throw new Error('User data not available');
      
      const role = userData.role || 'user';
      const now = new Date().toISOString();

      // Update Supabase auth user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          name: data.display_name || userData.display_name,
          role: role
        }
      });
      
      if (metadataError) throw metadataError;
      
      // Update user details in state and localStorage
      const updatedUserDetails: AppUser = {
        ...userData,
        display_name: data.display_name || userData.display_name,
      };
      
      try {
        localStorage.setItem('userData', JSON.stringify(updatedUserDetails));
      } catch (error) {
        console.error('Error updating user data in localStorage:', error);
      }
      
      setState(prev => ({
        ...prev,
        userDetails: updatedUserDetails,
        loading: false,
      }));
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error: any) {
      console.error('Profile update error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update profile',
      }));
      toast.error(error.message || 'Failed to update profile');
      return false;
    }
  };

  // Clear any error messages
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Get user data from state or localStorage
  const getUserData = () => {
    if (!state.userDetails) {
      // If userDetails is not available in state, try to get from localStorage as fallback
      try {
        const cachedData = localStorage.getItem('userData');
        if (cachedData) {
          return JSON.parse(cachedData) as AppUser;
        }
        
        // If no cached user data but we have a role, create a minimal user object
        const userRole = localStorage.getItem('userRole');
        if (userRole && state.user) {
          const minimalUser: AppUser = {
            id: state.user.id,
            email: state.user.email || '',
            role: userRole,
            display_name: state.user.user_metadata?.name || state.user.email?.split('@')[0] || ''
          };
          return minimalUser;
        }
      } catch (error) {
        console.error('Error retrieving user data from localStorage:', error);
      }
      return null;
    }
    
    return state.userDetails;
  };

  // Provide the auth context to children components
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
        getUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
