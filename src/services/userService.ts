// Supabase client import removed - using Firebase instead
import { supabase } from '../lib/supabase';
import {
  createClient,
  SupabaseClient,
  User
} from '@supabase/supabase-js';
import { generateToken, verifyToken } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/password';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { emailService } from './emailService';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'DONOR' | 'VOLUNTEER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  last_login?: string;
}

export interface UserProfile {
  bio?: string;
  location?: string;
  interests?: string[];
  skills?: string[];
  social_links?: Record<string, string>;
  preferences?: Record<string, any>;
}

export interface ActivityLog {
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
}

class UserService {
  async register(userData: {
    email: string;
    password: string;
    role: User['role'];
    first_name?: string;
    last_name?: string;
  }) {
    const { email, password, role, first_name, last_name } = userData;

    try {
      // Check if user exists
      const usersCollection = collection(db, 'users');
      const userQuery = query(usersCollection, where('email', '==', email));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        throw new Error('User already exists');
      }

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name if provided
      if (first_name || last_name) {
        const displayName = `${first_name || ''} ${last_name || ''}`.trim();
        await updateProfile(firebaseUser, { displayName });
      }
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
      
      // Create user in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        id: firebaseUser.uid,
        email,
        role,
        first_name: first_name || null,
        last_name: last_name || null,
        status: 'PENDING_VERIFICATION',
        email_verified: false,
        two_factor_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Create verification token
      const verificationTokensCollection = collection(db, 'email_verification_tokens');
      await addDoc(verificationTokensCollection, {
        user_id: firebaseUser.uid,
        token: generateToken(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        created_at: new Date().toISOString(),
      });

      // Create role-specific profile
      if (role === 'DONOR') {
        const donorProfilesCollection = collection(db, 'donor_profiles');
        await addDoc(donorProfilesCollection, { 
          user_id: firebaseUser.uid,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else if (role === 'VOLUNTEER') {
        const volunteerProfilesCollection = collection(db, 'volunteer_profiles');
        await addDoc(volunteerProfilesCollection, { 
          user_id: firebaseUser.uid,
          background_check_status: 'pending',
          total_hours: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Create user profile
      const userProfilesCollection = collection(db, 'user_profiles');
      await addDoc(userProfilesCollection, { 
        user_id: firebaseUser.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return {
        id: firebaseUser.uid,
        email,
        role,
        first_name,
        last_name,
        status: 'PENDING_VERIFICATION',
        email_verified: false,
        two_factor_enabled: false,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data() as User;
      
      if (userData.status === 'SUSPENDED') {
        throw new Error('Account suspended');
      }

      if (userData.status === 'INACTIVE') {
        throw new Error('Account inactive');
      }

      // Create session record
      const userSessionsCollection = collection(db, 'user_sessions');
      await addDoc(userSessionsCollection, {
        user_id: firebaseUser.uid,
        token: generateToken(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        created_at: new Date().toISOString(),
        ip_address: null, // Would be set in an API context
        user_agent: null, // Would be set in an API context
      });

      // Update last login
      await updateDoc(userDocRef, { 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Log activity
      await this.logActivity(firebaseUser.uid, {
        action: 'user_login',
        metadata: { method: 'email' },
      });

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(userId: string, sessionToken: string) {
    try {
      // Sign out from Firebase Authentication
      await signOut(auth);
      
      // Delete the session
      const userSessionsCollection = collection(db, 'user_sessions');
      const sessionQuery = query(
        userSessionsCollection, 
        where('user_id', '==', userId),
        where('token', '==', sessionToken)
      );
      const sessionSnapshot = await getDocs(sessionQuery);
      
      if (!sessionSnapshot.empty) {
        const sessionDoc = sessionSnapshot.docs[0];
        const sessionRef = doc(db, 'user_sessions', sessionDoc.id);
        await updateDoc(sessionRef, { 
          revoked: true,
          revoked_at: new Date().toISOString(),
        });
      }

      await this.logActivity(userId, { action: 'user_logout' });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, profileData: Partial<User & UserProfile>) {
    try {
      // Update user document
      const userFields = ['first_name', 'last_name', 'phone', 'avatar_url'];
      const userUpdate = Object.keys(profileData)
        .filter(key => userFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: profileData[key] }), {});

      if (Object.keys(userUpdate).length > 0) {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
          ...userUpdate,
          updated_at: new Date().toISOString(),
        });
        
        // Update display name in Firebase Auth if name was updated
        if (profileData.first_name || profileData.last_name) {
          const currentUser = auth.currentUser;
          if (currentUser && currentUser.uid === userId) {
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data();
            const firstName = profileData.first_name || userData?.first_name || '';
            const lastName = profileData.last_name || userData?.last_name || '';
            const displayName = `${firstName} ${lastName}`.trim();
            
            await updateProfile(currentUser, { displayName });
          }
        }
      }

      // Update profile document
      const profileFields = ['bio', 'location', 'interests', 'skills', 'social_links', 'preferences'];
      const profileUpdate = Object.keys(profileData)
        .filter(key => profileFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: profileData[key] }), {});

      if (Object.keys(profileUpdate).length > 0) {
        const userProfilesCollection = collection(db, 'user_profiles');
        const profileQuery = query(userProfilesCollection, where('user_id', '==', userId));
        const profileSnapshot = await getDocs(profileQuery);
        
        if (!profileSnapshot.empty) {
          const profileDoc = profileSnapshot.docs[0];
          const profileRef = doc(db, 'user_profiles', profileDoc.id);
          
          await updateDoc(profileRef, {
            ...profileUpdate,
            updated_at: new Date().toISOString(),
          });
        }
      }

      await this.logActivity(userId, {
        action: 'profile_update',
        metadata: { updated_fields: [...Object.keys(userUpdate), ...Object.keys(profileUpdate)] },
      });

      return this.getUserWithProfile(userId);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  async getUserWithProfile(userId: string) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data() as User;

      if (userData.role === 'DONOR') {
        const donorProfilesCollection = collection(db, 'donor_profiles');
        const donorProfileDoc = await getDoc(doc(donorProfilesCollection, userId));
        const donorProfileData = donorProfileDoc.data() as UserProfile;
        return { ...userData, donor_profile: donorProfileData };
      }

      if (userData.role === 'VOLUNTEER') {
        const volunteerProfilesCollection = collection(db, 'volunteer_profiles');
        const volunteerProfileDoc = await getDoc(doc(volunteerProfilesCollection, userId));
        const volunteerProfileData = volunteerProfileDoc.data() as UserProfile;
        return { ...userData, volunteer_profile: volunteerProfileData };
      }

      return userData;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data() as User;

      const isValidPassword = await verifyPassword(oldPassword, userData.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid current password');
      }

      const password_hash = await hashPassword(newPassword);

      await updateDoc(userDocRef, { password_hash });

      await this.logActivity(userId, { action: 'password_change' });
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string) {
    try {
      const userDocRef = doc(db, 'users', email);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Don't reveal if user exists
        return;
      }

      const userData = userDoc.data() as User;

      const token = generateToken();
      await setDoc(userDocRef, {
        password_reset_token: token,
        password_reset_token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      // TODO: Send email with reset token
      await this.logActivity(userData.id, { action: 'password_reset_requested' });
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  async verifyEmail(token: string) {
    try {
      const verificationTokensCollection = collection(db, 'email_verification_tokens');
      const verificationQuery = query(verificationTokensCollection, where('token', '==', token));
      const verificationSnapshot = await getDocs(verificationQuery);
      
      if (verificationSnapshot.empty) {
        throw new Error('Invalid verification token');
      }
      
      const verificationDoc = verificationSnapshot.docs[0];
      const verificationData = verificationDoc.data() as { user_id: string; used: boolean; expires_at: string };

      if (new Date(verificationData.expires_at) < new Date()) {
        throw new Error('Verification token expired');
      }

      if (verificationData.used) {
        throw new Error('Verification token already used');
      }

      const userDocRef = doc(db, 'users', verificationData.user_id);
      await updateDoc(userDocRef, {
        email_verified: true,
        status: 'ACTIVE',
      });

      await updateDoc(verificationDoc, { used: true });

      await this.logActivity(verificationData.user_id, { action: 'email_verified' });
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  async logActivity(userId: string, log: ActivityLog) {
    try {
      const activityLogsCollection = collection(db, 'activity_logs');
      await addDoc(activityLogsCollection, {
        user_id: userId,
        ...log,
        created_at: serverTimestamp(),
      });
    } catch (error) {
      console.error('Activity log error:', error);
      // Don't throw error for logging failures
    }
  }

  async getUserPermissions(userId: string) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data() as User;

      const rolePermissionsCollection = collection(db, 'role_permissions');
      const permissionsQuery = query(rolePermissionsCollection, where('role', '==', userData.role));
      const permissionsSnapshot = await getDocs(permissionsQuery);
      
      const permissions = permissionsSnapshot.docs.map(doc => doc.data() as { permissions: { name: string } });
      return permissions.map(p => p.permissions.name);
    } catch (error) {
      console.error('Get permissions error:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: User['status']) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { status });

      await this.logActivity(userId, {
        action: 'status_update',
        metadata: { new_status: status },
      });
    } catch (error) {
      console.error('Status update error:', error);
      throw error;
    }
  }

  async initializeTwoFactor(userId: string) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data() as User;

      const secret = authenticator.generateSecret();
      const otpauth = authenticator.keyuri(
        userData.email,
        'HopeCare',
        secret
      );

      // Store the secret temporarily until verification
      await updateDoc(userDocRef, { two_factor_secret: secret });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(otpauth);

      return { secret, qrCode };
    } catch (error) {
      console.error('2FA initialization error:', error);
      throw error;
    }
  }

  async verifyAndEnableTwoFactor(userId: string, token: string) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data() as User;

      if (!userData.two_factor_secret) {
        throw new Error('Two-factor authentication not initialized');
      }

      const isValid = authenticator.verify({
        token,
        secret: userData.two_factor_secret,
      });

      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      await updateDoc(userDocRef, {
        two_factor_enabled: true,
      });

      await this.logActivity(userId, { action: 'two_factor_enabled' });
      await emailService.sendTwoFactorEnabledEmail(userData);

      return true;
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  }

  async disableTwoFactor(userId: string) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        two_factor_enabled: false,
        two_factor_secret: null,
      });

      await this.logActivity(userId, { action: 'two_factor_disabled' });

      return true;
    } catch (error) {
      console.error('2FA disable error:', error);
      throw error;
    }
  }

  async verifyTwoFactorToken(userId: string, token: string) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data() as User;

      if (!userData.two_factor_secret) {
        throw new Error('Two-factor authentication not enabled');
      }

      return authenticator.verify({
        token,
        secret: userData.two_factor_secret,
      });
    } catch (error) {
      console.error('2FA token verification error:', error);
      throw error;
    }
  }
}

export const userService = new UserService();