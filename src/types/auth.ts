import { User as FirebaseUser } from 'firebase/auth';

export type UserRole = 'admin' | 'donor' | 'volunteer';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  photoURL: string | null;
  createdAt: Date;
  lastLogin: Date;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}
