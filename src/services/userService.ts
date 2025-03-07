// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
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
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const password_hash = await hashPassword(password);

      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password_hash,
            role,
            first_name,
            last_name,
            status: 'PENDING_VERIFICATION',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Create verification token
      const { error: tokenError } = await supabase
        .from('email_verification_tokens')
        .insert([
          {
            user_id: user.id,
            token: generateToken(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        ]);

      if (tokenError) throw tokenError;

      // Create role-specific profile
      if (role === 'DONOR') {
        await supabase.from('donor_profiles').insert([{ user_id: user.id }]);
      } else if (role === 'VOLUNTEER') {
        await supabase.from('volunteer_profiles').insert([{ user_id: user.id }]);
      }

      // Create user profile
      await supabase.from('user_profiles').insert([{ user_id: user.id }]);

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      if (user.status === 'SUSPENDED') {
        throw new Error('Account suspended');
      }

      if (user.status === 'INACTIVE') {
        throw new Error('Account inactive');
      }

      // Create session
      const { error: sessionError } = await supabase
        .from('user_sessions')
        .insert([
          {
            user_id: user.id,
            token: generateToken(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        ]);

      if (sessionError) throw sessionError;

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Log activity
      await this.logActivity(user.id, {
        action: 'user_login',
        metadata: { method: 'email' },
      });

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(userId: string, sessionToken: string) {
    try {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId)
        .eq('token', sessionToken);

      await this.logActivity(userId, { action: 'user_logout' });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, profileData: Partial<User & UserProfile>) {
    try {
      // Update user table
      const userFields = ['first_name', 'last_name', 'phone', 'avatar_url'];
      const userUpdate = Object.keys(profileData)
        .filter(key => userFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: profileData[key] }), {});

      if (Object.keys(userUpdate).length > 0) {
        const { error: userError } = await supabase
          .from('users')
          .update(userUpdate)
          .eq('id', userId);

        if (userError) throw userError;
      }

      // Update profile table
      const profileFields = ['bio', 'location', 'interests', 'skills', 'social_links', 'preferences'];
      const profileUpdate = Object.keys(profileData)
        .filter(key => profileFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: profileData[key] }), {});

      if (Object.keys(profileUpdate).length > 0) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update(profileUpdate)
          .eq('user_id', userId);

        if (profileError) throw profileError;
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
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*, user_profiles(*)')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (user.role === 'DONOR') {
        const { data: donorProfile } = await supabase
          .from('donor_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        return { ...user, donor_profile: donorProfile };
      }

      if (user.role === 'VOLUNTEER') {
        const { data: volunteerProfile } = await supabase
          .from('volunteer_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        return { ...user, volunteer_profile: volunteerProfile };
      }

      return user;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (error || !user) throw new Error('User not found');

      const isValidPassword = await verifyPassword(oldPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid current password');
      }

      const password_hash = await hashPassword(newPassword);

      await supabase
        .from('users')
        .update({ password_hash })
        .eq('id', userId);

      await this.logActivity(userId, { action: 'password_change' });
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (error || !user) {
        // Don't reveal if user exists
        return;
      }

      const token = generateToken();
      await supabase
        .from('password_reset_tokens')
        .insert([
          {
            user_id: user.id,
            token,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        ]);

      // TODO: Send email with reset token
      await this.logActivity(user.id, { action: 'password_reset_requested' });
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  async verifyEmail(token: string) {
    try {
      const { data: verification, error } = await supabase
        .from('email_verification_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single();

      if (error || !verification) {
        throw new Error('Invalid verification token');
      }

      if (new Date(verification.expires_at) < new Date()) {
        throw new Error('Verification token expired');
      }

      await supabase.from('users')
        .update({
          email_verified: true,
          status: 'ACTIVE',
        })
        .eq('id', verification.user_id);

      await supabase.from('email_verification_tokens')
        .update({ used: true })
        .eq('id', verification.id);

      await this.logActivity(verification.user_id, { action: 'email_verified' });
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  async logActivity(userId: string, log: ActivityLog) {
    try {
      await supabase.from('activity_logs').insert([
        {
          user_id: userId,
          ...log,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Activity log error:', error);
      // Don't throw error for logging failures
    }
  }

  async getUserPermissions(userId: string) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const { data: permissions } = await supabase
        .from('role_permissions')
        .select('permissions(name)')
        .eq('role', user.role);

      return permissions?.map(p => p.permissions.name) || [];
    } catch (error) {
      console.error('Get permissions error:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: User['status']) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;

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
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (!user) throw new Error('User not found');

      const secret = authenticator.generateSecret();
      const otpauth = authenticator.keyuri(
        user.email,
        'HopeCare',
        secret
      );

      // Store the secret temporarily until verification
      await supabase
        .from('users')
        .update({ two_factor_secret: secret })
        .eq('id', userId);

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
      const { data: user } = await supabase
        .from('users')
        .select('two_factor_secret')
        .eq('id', userId)
        .single();

      if (!user?.two_factor_secret) {
        throw new Error('Two-factor authentication not initialized');
      }

      const isValid = authenticator.verify({
        token,
        secret: user.two_factor_secret,
      });

      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      await supabase
        .from('users')
        .update({
          two_factor_enabled: true,
        })
        .eq('id', userId);

      await this.logActivity(userId, { action: 'two_factor_enabled' });
      await emailService.sendTwoFactorEnabledEmail(user);

      return true;
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  }

  async disableTwoFactor(userId: string) {
    try {
      await supabase
        .from('users')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null,
        })
        .eq('id', userId);

      await this.logActivity(userId, { action: 'two_factor_disabled' });

      return true;
    } catch (error) {
      console.error('2FA disable error:', error);
      throw error;
    }
  }

  async verifyTwoFactorToken(userId: string, token: string) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('two_factor_secret')
        .eq('id', userId)
        .single();

      if (!user?.two_factor_secret) {
        throw new Error('Two-factor authentication not enabled');
      }

      return authenticator.verify({
        token,
        secret: user.two_factor_secret,
      });
    } catch (error) {
      console.error('2FA token verification error:', error);
      throw error;
    }
  }
}

export const userService = new UserService(); 