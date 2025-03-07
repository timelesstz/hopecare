import React, { createContext, useContext, useState, useEffect } from 'react';
// Supabase import removed - using Firebase instead;
// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
import { toast } from 'react-hot-toast';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  userDetails: any | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (data: any) => Promise<boolean>;
  clearError: () => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  userDetails: null,
  loading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  resetPassword: async () => false,
  updateProfile: async () => false,
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Check for existing session on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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

    // Initial session check
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await fetchUserDetails(session.user);
      } else {
        setState({
          ...initialState,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setState({
        ...initialState,
        loading: false,
        error: 'Failed to check authentication status',
      });
    }
  };

  const fetchUserDetails = async (user: User) => {
    try {
      // Get user role from user metadata
      const role = user.user_metadata?.role || 'user';
      
      // Fetch additional user details based on role
      let userDetails = null;
      
      if (role === 'donor') {
        const { data, error } = await supabase
          .from('donor_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        userDetails = data;
      } else if (role === 'volunteer') {
        const { data, error } = await supabase
          .from('volunteer_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        userDetails = data;
      }
      
      setState({
        isAuthenticated: true,
        user,
        userDetails,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      setState({
        isAuthenticated: true,
        user,
        userDetails: null,
        loading: false,
        error: 'Failed to load user details',
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to sign in',
      }));
      toast.error(error.message || 'Failed to sign in');
      return false;
    }
  };

  const register = async (email: string, password: string, userData: any): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile based on role
        if (userData.role === 'donor') {
          const { error: profileError } = await supabase
            .from('donor_profiles')
            .insert({
              id: data.user.id,
              first_name: userData.firstName,
              last_name: userData.lastName,
              email: userData.email,
              phone: userData.phone || null,
              status: 'active',
              preferences: userData.preferences || {},
            });
            
          if (profileError) throw profileError;
        } else if (userData.role === 'volunteer') {
          const { error: profileError } = await supabase
            .from('volunteer_profiles')
            .insert({
              id: data.user.id,
              first_name: userData.firstName,
              last_name: userData.lastName,
              email: userData.email,
              phone: userData.phone || null,
              status: 'active',
              volunteer_role: userData.volunteerRole || 'Event Volunteer',
              skills: userData.skills || [],
              languages: userData.languages || [],
              availability: userData.availability || {},
            });
            
          if (profileError) throw profileError;
        }
        
        toast.success('Account created successfully! Please check your email to verify your account.');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to create account',
      }));
      toast.error(error.message || 'Failed to create account');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await signOut(auth);
      // Auth state change listener will update the state
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

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
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

  const updateProfile = async (data: any): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!state.user) throw new Error('User not authenticated');
      
      // Update user metadata
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          first_name: data.firstName || state.user.user_metadata?.first_name,
          last_name: data.lastName || state.user.user_metadata?.last_name,
        },
      });
      
      if (userUpdateError) throw userUpdateError;
      
      // Update profile based on role
      const role = state.user.user_metadata?.role;
      
      if (role === 'donor') {
        const { error: profileError } = await supabase
          .from('donor_profiles')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            preferences: data.preferences,
          })
          .eq('id', state.user.id);
          
        if (profileError) throw profileError;
      } else if (role === 'volunteer') {
        const { error: profileError } = await supabase
          .from('volunteer_profiles')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            skills: data.skills,
            languages: data.languages,
            availability: data.availability,
          })
          .eq('id', state.user.id);
          
        if (profileError) throw profileError;
      }
      
      // Refresh user details
      await checkSession();
      
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

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
