import { auth, db } from '../firebase/config';
import { 
  signInWithEmailAndPassword as firebaseSignIn, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile
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
  displayName?: string;
}

export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    // Sign in with Firebase
    const userCredential = await firebaseSignIn(auth, email, password);
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
      last_login: serverTimestamp()
    });

    return { 
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: userData.role,
        displayName: userData.displayName || firebaseUser.displayName || ''
      }, 
      error: null 
    };
  } catch (error: any) {
    return { user: null, error: { message: error.message || 'Failed to sign in' } };
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
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return { user: null, error: null }; // Not an error, just no user logged in
    }

    // Get user's role from Firestore
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

    if (!userDoc.exists()) {
      return { user: null, error: { message: 'User profile not found' } };
    }

    const userData = userDoc.data();

    return { 
      user: {
        id: currentUser.uid,
        email: currentUser.email || '',
        role: userData.role,
        displayName: userData.displayName || currentUser.displayName || ''
      }, 
      error: null 
    };
  } catch (error: any) {
    return { user: null, error: { message: error.message || 'Failed to get current user' } };
  }
};

export class AuthService {
  static async login(email: string, password: string): Promise<{ user: any; error: any }> {
    try {
      const userCredential = await firebaseSignIn(auth, email, password);
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
        last_login: serverTimestamp()
      });
      
      return { 
        user: {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: userData.role,
          displayName: userData.displayName || firebaseUser.displayName || ''
        }, 
        error: null 
      };
    } catch (error: any) {
      return { user: null, error: { message: error.message || 'Failed to sign in' } };
    }
  }

  static async register(email: string, password: string, userData: any): Promise<{ user: any; error: any }> {
    try {
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser) {
        return { user: null, error: { message: 'Failed to create user' } };
      }

      // Update profile display name if provided
      if (userData.name) {
        await firebaseUpdateProfile(firebaseUser, {
          displayName: userData.name
        });
      }

      // Create a general user entry in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: email,
        role: userData.role || 'user',
        displayName: userData.name || '',
        createdAt: serverTimestamp(),
        last_login: serverTimestamp()
      });

      // Create profile based on role
      if (userData.role === 'donor') {
        await setDoc(doc(db, 'donor_profiles', firebaseUser.uid), {
          name: userData.name || '',
          ...userData,
          createdAt: serverTimestamp()
        });
      } else if (userData.role === 'volunteer') {
        await setDoc(doc(db, 'volunteer_profiles', firebaseUser.uid), {
          name: userData.name || '',
          ...userData,
          createdAt: serverTimestamp()
        });
      }

      return { 
        user: {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: userData.role || 'user',
          displayName: userData.name || ''
        }, 
        error: null 
      };
    } catch (error: any) {
      return { user: null, error: { message: error.message || 'Failed to register' } };
    }
  }

  static async logout(): Promise<{ error: any }> {
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to sign out' } };
    }
  }

  static async resetPassword(email: string): Promise<{ error: any }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to send reset email' } };
    }
  }

  static async updatePassword(newPassword: string): Promise<{ error: any }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { error: { message: 'No user is currently signed in' } };
      }
      
      // Firebase has a separate API for this, but we're not using it here
      // as it requires reauthentication
      return { error: { message: 'Password update requires reauthentication' } };
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to update password' } };
    }
  }
}

export const authService = new AuthService();
