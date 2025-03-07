// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
import { userService } from './userService';
import { emailService } from './emailService';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

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
    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    if (!firebaseUser) {
      return { user: null, error: { message: 'No user found' } };
    }

    // Get user's role from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return { user: null, error: { message: 'User profile not found' } };
    }

    const userData = userDoc.data();

    // Update last login time
    await updateDoc(doc(db, 'users', firebaseUser.uid), {
      last_login: new Date().toISOString()
    });

    return {
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        role: userData.role || 'USER',
      },
      error: null,
    };
  } catch (error: any) {
    return { 
      user: null, 
      error: { 
        message: error.message || 'Failed to sign in' 
      } 
    };
  }
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message || 'Failed to sign out' } };
  }
};

export const getCurrentUser = async (): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser) {
      return { user: null, error: null };
    }
    
    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return { user: null, error: { message: 'User profile not found' } };
    }
    
    const userData = userDoc.data();
    
    return {
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        role: userData.role || 'USER',
      },
      error: null,
    };
  } catch (error: any) {
    return { 
      user: null, 
      error: { 
        message: error.message || 'Failed to get current user' 
      } 
    };
  }
};

interface LoginResponse {
  success: boolean;
  requires2FA?: boolean;
  userId?: string;
  error?: string;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser) {
        return { success: false, error: 'Authentication failed' };
      }

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        return { success: false, error: 'User profile not found' };
      }

      // Update last login time
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        last_login: new Date().toISOString()
      });

      // Log the login activity
      await setDoc(doc(db, 'audit_logs', `${firebaseUser.uid}_${Date.now()}`), {
        user_id: firebaseUser.uid,
        action: 'LOGIN',
        details: {
          email: email,
          timestamp: new Date().toISOString(),
          ip: await this.getClientIP(),
          location: await this.getLocation()
        },
        created_at: serverTimestamp()
      });

      return { success: true, userId: firebaseUser.uid };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Authentication failed' 
      };
    }
  }

  private async completeLogin(userId: string) {
    try {
      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      // Update last login time
      await updateDoc(doc(db, 'users', userId), {
        last_login: new Date().toISOString()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Complete login error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to complete login' 
      };
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting client IP:', error);
      return 'unknown';
    }
  }

  private async getLocation(): Promise<string | undefined> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return `${data.city}, ${data.region}, ${data.country_name}`;
    } catch (error) {
      console.error('Error getting location:', error);
      return undefined;
    }
  }

  async logout(userId: string) {
    try {
      await firebaseSignOut(auth);
      
      // Log the logout activity
      await setDoc(doc(db, 'audit_logs', `${userId}_${Date.now()}`), {
        user_id: userId,
        action: 'LOGOUT',
        details: {
          timestamp: new Date().toISOString()
        },
        created_at: serverTimestamp()
      });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to logout' };
    }
  }

  async requestPasswordReset(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      
      // Log the password reset request
      await setDoc(doc(db, 'audit_logs', `${email}_${Date.now()}`), {
        email,
        action: 'PASSWORD_RESET_REQUEST',
        details: {
          timestamp: new Date().toISOString(),
          ip: await this.getClientIP()
        },
        created_at: serverTimestamp()
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Password reset request error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to request password reset' 
      };
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Firebase handles password reset through a separate flow
      // This method would typically not be used with Firebase
      // as Firebase handles the reset through a direct link
      return { 
        success: false, 
        error: 'Password reset should be handled through Firebase reset email' 
      };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to reset password' 
      };
    }
  }
}

export const authService = new AuthService();
