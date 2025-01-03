import { supabase } from '../lib/supabase';

export interface AuthError {
  message: string;
}

export interface User {
  id: string;
  email: string;
  role?: string;
}

export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: { message: error.message } };
    }

    if (!data.user) {
      return { user: null, error: { message: 'No user found' } };
    }

    // Get user's role from the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user role:', profileError);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        role: profileData?.role || 'USER',
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: { message: 'An unexpected error occurred' },
    };
  }
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: { message: error.message } };
    }
    return { error: null };
  } catch (error) {
    return { error: { message: 'An unexpected error occurred' } };
  }
};

export const getCurrentUser = async (): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, error: null };
    }

    // Get user's role from the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user role:', profileError);
    }

    return {
      user: {
        id: user.id,
        email: user.email!,
        role: profileData?.role || 'USER',
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: { message: 'An unexpected error occurred' },
    };
  }
};
