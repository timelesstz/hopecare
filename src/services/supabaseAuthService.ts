import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
  status?: number | undefined;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  avatarUrl?: string;
}

/**
 * Sign in with email and password
 * @param email User email
 * @param password User password
 * @returns User object or error
 */
export async function signInWithEmailAndPassword(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error: { message: error.message } };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    console.error('Sign in error:', err);
    return { user: null, session: null, error: { message: err.message || 'An error occurred during sign in' } };
  }
}

/**
 * Sign up with email and password
 * This function handles the two-step process required by Supabase:
 * 1. Create user in auth.users
 * 2. Create user profile in public.users
 * 
 * @param email User email
 * @param password User password
 * @param displayName User display name
 * @param role User role (default: USER)
 * @returns User object or error
 */
export async function signUpWithEmailAndPassword(
  email: string,
  password: string,
  displayName: string,
  role: string = 'USER'
): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> {
  try {
    // Step 1: Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (authError) {
      return { user: null, session: null, error: { message: authError.message } };
    }

    if (!authData.user) {
      return { user: null, session: null, error: { message: 'User creation failed' } };
    }

    // Step 2: Create user profile in public.users
    // Use service role client for this operation to bypass RLS
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: email,
      display_name: displayName,
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      
      // If profile creation fails, we should ideally delete the auth user
      // But Supabase doesn't provide a client-side method for this
      // This would need to be handled by a server function or Edge Function
      
      return { 
        user: null, 
        session: null, 
        error: { 
          message: `User created but profile setup failed: ${profileError.message}`,
          status: typeof profileError.code === 'string' ? parseInt(profileError.code, 10) || undefined : profileError.code
        } 
      };
    }

    return { user: authData.user, session: authData.session, error: null };
  } catch (err: any) {
    console.error('Sign up error:', err);
    return { user: null, session: null, error: { message: err.message || 'An error occurred during sign up' } };
  }
}

/**
 * Sign out the current user
 * @returns Success or error
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: { message: error.message } };
    }
    
    return { error: null };
  } catch (err: any) {
    console.error('Sign out error:', err);
    return { error: { message: err.message || 'An error occurred during sign out' } };
  }
}

/**
 * Send password reset email
 * @param email User email
 * @returns Success or error
 */
export async function sendPasswordReset(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) {
      return { error: { message: error.message } };
    }
    
    return { error: null };
  } catch (err: any) {
    console.error('Password reset error:', err);
    return { error: { message: err.message || 'An error occurred during password reset' } };
  }
}

/**
 * Update user profile
 * @param userId User ID
 * @param data Profile data to update
 * @returns Success or error
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<{ error: AuthError | null }> {
  try {
    // Update auth user if email or password is included
    if (data.email) {
      const { error: authError } = await supabase.auth.updateUser({
        email: data.email,
      });
      
      if (authError) {
        return { error: { message: authError.message } };
      }
    }
    
    // Update user profile in public.users
    const updateData: any = {};
    if (data.displayName) updateData.display_name = data.displayName;
    if (data.role) updateData.role = data.role;
    if (data.avatarUrl) updateData.avatar_url = data.avatarUrl;
    updateData.updated_at = new Date().toISOString();
    
    const { error: profileError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);
    
    if (profileError) {
      return { error: { message: profileError.message } };
    }
    
    return { error: null };
  } catch (err: any) {
    console.error('Profile update error:', err);
    return { error: { message: err.message || 'An error occurred during profile update' } };
  }
}

/**
 * Get current user session
 * @returns User session or null
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

/**
 * Get current user
 * @returns User object or null
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Get user profile from public.users table
 * @param userId User ID
 * @returns User profile or null
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, role, avatar_url')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error('Get user profile error:', error);
      return null;
    }
    
    return {
      id: data.id,
      email: data.email,
      displayName: data.display_name || undefined,
      role: data.role,
      avatarUrl: data.avatar_url || undefined
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
}

/**
 * Create admin user (requires service role)
 * IMPORTANT: This function should only be used server-side with a proper service role key.
 * Client-side usage will fail due to permission issues.
 * @param email Admin email
 * @param password Admin password
 * @param displayName Admin display name
 * @returns Success or error
 */
export async function createAdminUser(
  email: string,
  password: string,
  displayName: string
): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    // IMPORTANT: This function requires a service role key and should only be called from a secure server environment
    // The regular supabase client does not have admin privileges
    // For client-side, admin user creation should be done through a secure API endpoint
    
    // This is a placeholder implementation that will fail in client-side contexts
    // In a real implementation, this would use a properly configured service role client
    
    // Step 1: Create user in auth.users (this will fail without proper service role key)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    
    if (authError || !authData.user) {
      return { 
        user: null, 
        error: { 
          message: authError?.message || 'Admin user creation failed',
          status: authError?.status
        } 
      };
    }
    
    // Step 2: Create user profile in public.users with ADMIN role
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        display_name: displayName,
        role: 'ADMIN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      return { 
        user: null, 
        error: { 
          message: `Admin user created but profile setup failed: ${profileError.message}`,
          status: typeof profileError.code === 'string' ? parseInt(profileError.code, 10) || undefined : profileError.code
        } 
      };
    }
    
    return { user: authData.user, error: null };
  } catch (err: any) {
    console.error('Admin user creation error:', err);
    return { 
      user: null, 
      error: { 
        message: err.message || 'An error occurred during admin user creation'
      } 
    };
  }
}

/**
 * Check if current user has admin role
 * @returns Boolean indicating if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getCurrentSession();
    if (!session) return false;
    
    const profile = await getUserProfile(session.user.id);
    return profile?.role === 'ADMIN';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

export default {
  signInWithEmailAndPassword,
  signUpWithEmailAndPassword,
  signOut,
  sendPasswordReset,
  updateUserProfile,
  getCurrentSession,
  getCurrentUser,
  getUserProfile,
  createAdminUser,
  isAdmin
};
