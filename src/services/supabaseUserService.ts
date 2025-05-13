/**
 * Supabase User Service
 * 
 * This service handles user management operations using Supabase.
 * It replaces the Firebase-based UserService with Supabase equivalents.
 */

import { supabase } from '../lib/supabase';
import { generateToken } from '../utils/jwt';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { Database } from '../types/supabase';

// Create a simple email service stub until the real one is implemented
const emailService = {
  sendVerificationEmail: async (email: string, token: string) => {
    console.log(`Sending verification email to ${email} with token ${token}`);
    return { success: true };
  },
  sendTwoFactorEnabledEmail: async (userData: any) => {
    console.log(`Sending 2FA enabled email to ${userData.email}`);
    return { success: true };
  }
};

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

class SupabaseUserService {
  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    role: User['role'];
    first_name?: string;
    last_name?: string;
  }) {
    const { email, password, role, first_name, last_name } = userData;

    try {
      // Check if user exists in Supabase
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('User already exists');
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role.toLowerCase(),
            first_name: first_name || '',
            last_name: last_name || '',
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      const userId = authData.user.id;

      // Create user in users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          role: role.toLowerCase(),
          display_name: `${first_name || ''} ${last_name || ''}`.trim(),
          status: 'pending_verification',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (userError) {
        throw userError;
      }

      // Create role-specific profile
      if (role === 'DONOR') {
        const { error: donorError } = await supabase
          .from('donor_profiles')
          .insert({
            id: userId,
            first_name: first_name || '',
            last_name: last_name || '',
            email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (donorError) {
          throw donorError;
        }
      } else if (role === 'VOLUNTEER') {
        const { error: volunteerError } = await supabase
          .from('volunteer_profiles')
          .insert({
            id: userId,
            first_name: first_name || '',
            last_name: last_name || '',
            email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (volunteerError) {
          throw volunteerError;
        }
      } else if (role === 'ADMIN') {
        const { error: adminError } = await supabase
          .from('admin_profiles')
          .insert({
            id: userId,
            full_name: `${first_name || ''} ${last_name || ''}`.trim(),
            email,
            position: 'Staff',
            access_level: 'standard',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (adminError) {
          throw adminError;
        }
      }

      // Create verification token
      const verificationToken = generateToken();
      const { error: tokenError } = await supabase
        .from('email_verification_tokens')
        .insert({
          user_id: userId,
          token: verificationToken,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          created_at: new Date().toISOString(),
          used: false
        } as Database['public']['Tables']['email_verification_tokens']['Insert']);

      if (tokenError) {
        throw tokenError;
      }

      // Send verification email
      await emailService.sendVerificationEmail(email, verificationToken);

      return {
        success: true,
        userId,
        message: 'User registered successfully. Please verify your email.',
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  }

  /**
   * Log in a user
   */
  async login(email: string, password: string) {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Login failed');
      }

      const userId = authData.user.id;

      // Get user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        throw userError;
      }

      // Update last login timestamp
      await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      // Log activity
      await this.logActivity(userId, { action: 'login', entity_type: 'auth', entity_id: userId });

      // Check if two-factor authentication is enabled
      if (userData.two_factor_enabled) {
        return {
          success: true,
          requiresTwoFactor: true,
          userId,
          session: authData.session,
        };
      }

      return {
        success: true,
        user: userData,
        session: authData.session,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  /**
   * Log out a user
   */
  async logout(userId: string) {
    try {
      // Sign out from Supabase Auth
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Log activity
      await this.logActivity(userId, { action: 'logout', entity_type: 'auth', entity_id: userId });

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message || 'Logout failed',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: Partial<User & UserProfile>) {
    try {
      // Update user metadata in Supabase Auth
      if (profileData.first_name || profileData.last_name || profileData.phone) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            phone: profileData.phone,
          }
        });

        if (metadataError) {
          throw metadataError;
        }
      }

      // Update user in users table
      const userUpdateData: any = {};
      
      if (profileData.first_name || profileData.last_name) {
        userUpdateData.display_name = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
      }
      
      if (profileData.status) {
        userUpdateData.status = profileData.status.toLowerCase();
      }
      
      if (profileData.avatar_url) {
        userUpdateData.avatar_url = profileData.avatar_url;
      }
      
      if (Object.keys(userUpdateData).length > 0) {
        userUpdateData.updated_at = new Date().toISOString();
        
        const { error: userError } = await supabase
          .from('users')
          .update(userUpdateData)
          .eq('id', userId);

        if (userError) {
          throw userError;
        }
      }

      // Update role-specific profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError) {
        throw userError;
      }

      if (userData.role === 'donor') {
        const donorUpdateData: any = {};
        
        if (profileData.first_name) donorUpdateData.first_name = profileData.first_name;
        if (profileData.last_name) donorUpdateData.last_name = profileData.last_name;
        if (profileData.phone) donorUpdateData.phone = profileData.phone;
        if (profileData.bio) donorUpdateData.bio = profileData.bio;
        if (profileData.location) donorUpdateData.address = profileData.location;
        
        if (Object.keys(donorUpdateData).length > 0) {
          donorUpdateData.updated_at = new Date().toISOString();
          
          const { error: donorError } = await supabase
            .from('donor_profiles')
            .update(donorUpdateData)
            .eq('id', userId);

          if (donorError) {
            throw donorError;
          }
        }
      } else if (userData.role === 'volunteer') {
        const volunteerUpdateData: any = {};
        
        if (profileData.first_name) volunteerUpdateData.first_name = profileData.first_name;
        if (profileData.last_name) volunteerUpdateData.last_name = profileData.last_name;
        if (profileData.phone) volunteerUpdateData.phone = profileData.phone;
        if (profileData.bio) volunteerUpdateData.experience = profileData.bio;
        if (profileData.location) volunteerUpdateData.location = profileData.location;
        if (profileData.skills) volunteerUpdateData.skills = profileData.skills;
        
        if (Object.keys(volunteerUpdateData).length > 0) {
          volunteerUpdateData.updated_at = new Date().toISOString();
          
          const { error: volunteerError } = await supabase
            .from('volunteer_profiles')
            .update(volunteerUpdateData)
            .eq('id', userId);

          if (volunteerError) {
            throw volunteerError;
          }
        }
      }

      // Log activity
      await this.logActivity(userId, { action: 'profile_update', entity_type: 'user', entity_id: userId });

      return {
        success: true,
        message: 'Profile updated successfully',
      };
    } catch (error: any) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.message || 'Profile update failed',
      };
    }
  }

  /**
   * Get user with profile
   */
  async getUserWithProfile(userId: string) {
    try {
      // Get user from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        throw userError;
      }

      let profileData = null;

      // Get role-specific profile
      if (userData.role === 'donor') {
        const { data: donorData, error: donorError } = await supabase
          .from('donor_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (donorError && donorError.code !== 'PGRST116') { // Not found error
          throw donorError;
        }

        profileData = donorData;
      } else if (userData.role === 'volunteer') {
        const { data: volunteerData, error: volunteerError } = await supabase
          .from('volunteer_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (volunteerError && volunteerError.code !== 'PGRST116') { // Not found error
          throw volunteerError;
        }

        profileData = volunteerData;
      } else if (userData.role === 'admin') {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (adminError && adminError.code !== 'PGRST116') { // Not found error
          throw adminError;
        }

        profileData = adminData;
      }

      return {
        success: true,
        user: userData,
        profile: profileData,
      };
    } catch (error: any) {
      console.error('Get user error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get user',
      };
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    try {
      // Get user email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (userError) {
        throw userError;
      }

      // Verify old password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: oldPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Log activity
      await this.logActivity(userId, { action: 'password_change', entity_type: 'auth', entity_id: userId });

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error: any) {
      console.error('Password change error:', error);
      return {
        success: false,
        error: error.message || 'Password change failed',
      };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Password reset instructions sent to your email',
      };
    } catch (error: any) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        error: error.message || 'Password reset request failed',
      };
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string) {
    try {
      // Find token in database
      const { data: tokenData, error: tokenError } = await supabase
        .from('email_verification_tokens')
        .select('*')
        .eq('token', token)
        .single() as { 
          data: Database['public']['Tables']['email_verification_tokens']['Row'] | null, 
          error: any 
        };

      if (tokenError || !tokenData) {
        throw new Error('Invalid or expired verification token');
      }

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error('Verification token has expired');
      }

      // Update user status
      const { error: userError } = await supabase
        .from('users')
        .update({
          status: 'active',
          email_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tokenData.user_id);

      if (userError) {
        throw userError;
      }

      // Mark token as used
      await supabase
        .from('email_verification_tokens')
        .update({ used: true } as Database['public']['Tables']['email_verification_tokens']['Update'])
        .eq('token', token);

      // Log activity
      await this.logActivity(tokenData.user_id, { action: 'email_verified', entity_type: 'auth', entity_id: tokenData.user_id });

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error: any) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: error.message || 'Email verification failed',
      };
    }
  }

  /**
   * Log user activity
   */
  async logActivity(userId: string, log: ActivityLog) {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          action: log.action,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          metadata: log.metadata,
          created_at: new Date().toISOString(),
        } as Database['public']['Tables']['activity_logs']['Insert']);

      if (error) {
        throw error;
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Activity log error:', error);
      return {
        success: false,
        error: error.message || 'Failed to log activity',
      };
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string) {
    try {
      // Get user role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError) {
        throw userError;
      }

      // Get permissions for role
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('role_permissions')
        .select('permissions')
        .eq('role', userData.role) as {
          data: { permissions: { name: string }[] }[] | null,
          error: any
        };

      if (permissionsError) {
        throw permissionsError;
      }

      const permissions = permissionsData?.flatMap(p => 
        p.permissions && Array.isArray(p.permissions) 
          ? p.permissions.map((perm: { name: string }) => perm.name) 
          : []
      ) || [];

      return {
        success: true,
        permissions,
      };
    } catch (error: any) {
      console.error('Get permissions error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get permissions',
      };
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, status: User['status']) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          status: status.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Log activity
      await this.logActivity(userId, {
        action: 'status_update',
        metadata: { new_status: status },
      });

      return {
        success: true,
        message: 'User status updated successfully',
      };
    } catch (error: any) {
      console.error('Status update error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user status',
      };
    }
  }

  /**
   * Initialize two-factor authentication
   */
  async initializeTwoFactor(userId: string) {
    try {
      // Get user email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (userError) {
        throw userError;
      }

      const secret = authenticator.generateSecret();
      const otpauth = authenticator.keyuri(
        userData.email,
        'HopeCare',
        secret
      );

      // Store the secret temporarily until verification
      const { error: updateError } = await supabase
        .from('users')
        .update({
          two_factor_secret: secret,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Generate QR code
      const qrCode = await QRCode.toDataURL(otpauth);

      return {
        success: true,
        secret,
        qrCode,
      };
    } catch (error: any) {
      console.error('2FA initialization error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initialize two-factor authentication',
      };
    }
  }

  /**
   * Verify and enable two-factor authentication
   */
  async verifyAndEnableTwoFactor(userId: string, token: string) {
    try {
      // Get user with two-factor secret
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, two_factor_secret')
        .eq('id', userId)
        .single() as {
          data: { email: string, two_factor_secret: string | null } | null,
          error: any
        };

      if (userError || !userData) {
        throw userError || new Error('User not found');
      }

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

      // Enable two-factor authentication
      const { error: updateError } = await supabase
        .from('users')
        .update({
          two_factor_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Log activity
      await this.logActivity(userId, { action: 'two_factor_enabled' });
      
      // Send confirmation email
      await emailService.sendTwoFactorEnabledEmail(userData);

      return {
        success: true,
        message: 'Two-factor authentication enabled successfully',
      };
    } catch (error: any) {
      console.error('2FA verification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify and enable two-factor authentication',
      };
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(userId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Log activity
      await this.logActivity(userId, { action: 'two_factor_disabled' });

      return {
        success: true,
        message: 'Two-factor authentication disabled successfully',
      };
    } catch (error: any) {
      console.error('2FA disable error:', error);
      return {
        success: false,
        error: error.message || 'Failed to disable two-factor authentication',
      };
    }
  }

  /**
   * Verify two-factor token
   */
  async verifyTwoFactorToken(userId: string, token: string) {
    try {
      // Get user with two-factor secret
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('two_factor_secret')
        .eq('id', userId)
        .single() as {
          data: { two_factor_secret: string | null } | null,
          error: any
        };

      if (userError || !userData) {
        throw userError || new Error('User not found');
      }

      if (!userData.two_factor_secret) {
        throw new Error('Two-factor authentication not enabled');
      }

      const isValid = authenticator.verify({
        token,
        secret: userData.two_factor_secret,
      });

      return {
        success: isValid,
        message: isValid ? 'Token verified successfully' : 'Invalid token',
      };
    } catch (error: any) {
      console.error('2FA token verification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify two-factor token',
      };
    }
  }
}

export const supabaseUserService = new SupabaseUserService();
