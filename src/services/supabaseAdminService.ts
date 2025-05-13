/**
 * Supabase Admin Service
 * 
 * This service handles admin-specific operations using Supabase.
 * It replaces the Firebase-based admin service with Supabase equivalents.
 */

import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { supabaseUserService } from './supabaseUserService';

export interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string;
  position: string;
  department: string;
  access_level: string;
  contact_email: string | null;
  phone_number: string | null;
  profile_image: string | null;
  bio: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDonors: number;
  totalVolunteers: number;
  totalDonations: number;
  totalAmount: number;
  recentDonations: any[];
  recentUsers: any[];
  pendingApplications: number;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    email: string;
    display_name: string;
  };
}

class SupabaseAdminService {
  /**
   * Get admin profile by user ID
   */
  async getAdminProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        profile: data,
      };
    } catch (error: any) {
      console.error('Get admin profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get admin profile',
      };
    }
  }

  /**
   * Create or update admin profile
   */
  async upsertAdminProfile(userId: string, profileData: Partial<AdminProfile>) {
    try {
      const now = new Date().toISOString();
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('admin_profiles')
          .update({
            ...profileData,
            updated_at: now,
          })
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        return {
          success: true,
          message: 'Admin profile updated successfully',
        };
      } else {
        // Create new profile
        const { error } = await supabase
          .from('admin_profiles')
          .insert({
            user_id: userId,
            ...profileData,
            created_at: now,
            updated_at: now,
          } as Database['public']['Tables']['admin_profiles']['Insert']);

        if (error) {
          throw error;
        }

        // Update user role if not already an admin
        await supabaseUserService.updateUserRole(userId, 'ADMIN');

        return {
          success: true,
          message: 'Admin profile created successfully',
        };
      }
    } catch (error: any) {
      console.error('Upsert admin profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update admin profile',
      };
    }
  }

  /**
   * Get all admin profiles
   */
  async getAllAdminProfiles() {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*, users!inner(email, display_name, role)');

      if (error) {
        throw error;
      }

      // Process data to format user information
      const processedProfiles = data?.map((profile: any) => {
        const { users, ...profileData } = profile;
        return {
          ...profileData,
          email: users.email,
          display_name: users.display_name,
          role: users.role,
        };
      });

      return {
        success: true,
        profiles: processedProfiles || [],
      };
    } catch (error: any) {
      console.error('Get all admin profiles error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get admin profiles',
      };
    }
  }

  /**
   * Update admin last login
   */
  async updateAdminLastLogin(userId: string) {
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('admin_profiles')
        .update({
          last_login: now,
          updated_at: now,
        })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Update admin last login error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update admin last login',
      };
    }
  }

  /**
   * Get admin dashboard statistics
   */
  async getAdminStats() {
    try {
      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        throw usersError;
      }

      // Get total donors count
      const { count: totalDonors, error: donorsError } = await supabase
        .from('donor_profiles')
        .select('*', { count: 'exact', head: true });

      if (donorsError) {
        throw donorsError;
      }

      // Get total volunteers count
      const { count: totalVolunteers, error: volunteersError } = await supabase
        .from('volunteer_profiles')
        .select('*', { count: 'exact', head: true });

      if (volunteersError) {
        throw volunteersError;
      }

      // Get donation statistics
      const { data: donationStats, error: donationStatsError } = await supabase
        .rpc('get_donation_statistics');

      if (donationStatsError) {
        throw donationStatsError;
      }

      // Get recent donations
      const { data: recentDonations, error: recentDonationsError } = await supabase
        .from('donations')
        .select('*, donor_profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentDonationsError) {
        throw recentDonationsError;
      }

      // Get recent users
      const { data: recentUsers, error: recentUsersError } = await supabase
        .from('users')
        .select('id, email, display_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentUsersError) {
        throw recentUsersError;
      }

      // Get pending volunteer applications
      const { count: pendingApplications, error: pendingApplicationsError } = await supabase
        .from('volunteer_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingApplicationsError) {
        throw pendingApplicationsError;
      }

      // Format recent donations
      const formattedDonations = recentDonations?.map((donation: any) => ({
        id: donation.id,
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status,
        created_at: donation.created_at,
        donor_name: donation.donor_profiles?.full_name || 'Anonymous',
      }));

      return {
        success: true,
        stats: {
          totalUsers: totalUsers || 0,
          totalDonors: totalDonors || 0,
          totalVolunteers: totalVolunteers || 0,
          totalDonations: donationStats?.total_donations || 0,
          totalAmount: donationStats?.total_amount || 0,
          recentDonations: formattedDonations || [],
          recentUsers: recentUsers || [],
          pendingApplications: pendingApplications || 0,
        },
      };
    } catch (error: any) {
      console.error('Get admin stats error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get admin statistics',
      };
    }
  }

  /**
   * Get user activities with pagination
   */
  async getUserActivities(options: {
    limit?: number;
    offset?: number;
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    includeUserDetails?: boolean;
  } = {}) {
    try {
      let query = supabase
        .from('activity_logs')
        .select(
          options.includeUserDetails 
            ? '*, users!inner(email, display_name)' 
            : '*'
        );

      // Apply filters
      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options.action) {
        query = query.eq('action', options.action);
      }

      if (options.entityType) {
        query = query.eq('entity_type', options.entityType);
      }

      if (options.startDate) {
        query = query.gte('created_at', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('created_at', options.endDate);
      }

      // Apply sorting
      query = query.order('created_at', { ascending: false });

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // Process data to format user information if included
      const processedActivities = data?.map((activity: any) => {
        if (options.includeUserDetails && activity.users) {
          const { users, ...activityData } = activity;
          return {
            ...activityData,
            user: {
              id: activity.user_id,
              email: users.email,
              display_name: users.display_name,
            },
          };
        }
        return activity;
      });

      return {
        success: true,
        activities: processedActivities || [],
        count: count || 0,
      };
    } catch (error: any) {
      console.error('Get user activities error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get user activities',
      };
    }
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(role: string) {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permissions')
        .eq('role', role)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        permissions: data?.permissions || {},
      };
    } catch (error: any) {
      console.error('Get role permissions error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get role permissions',
      };
    }
  }

  /**
   * Update role permissions
   */
  async updateRolePermissions(role: string, permissions: any, adminId: string) {
    try {
      const now = new Date().toISOString();
      
      // Check if role exists
      const { data: existingRole } = await supabase
        .from('role_permissions')
        .select('id')
        .eq('role', role)
        .single();
      
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('role_permissions')
          .update({
            permissions,
            updated_at: now,
          })
          .eq('role', role);

        if (error) {
          throw error;
        }
      } else {
        // Create new role
        const { error } = await supabase
          .from('role_permissions')
          .insert({
            role,
            permissions,
            created_at: now,
            updated_at: now,
          });

        if (error) {
          throw error;
        }
      }

      // Log activity
      await supabaseUserService.logActivity(adminId, {
        action: 'update_role_permissions',
        entity_type: 'role',
        entity_id: role,
        metadata: { role },
      });

      return {
        success: true,
        message: 'Role permissions updated successfully',
      };
    } catch (error: any) {
      console.error('Update role permissions error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update role permissions',
      };
    }
  }

  /**
   * Change user role
   */
  async changeUserRole(userId: string, newRole: string, adminId: string) {
    try {
      // Update user role
      const result = await supabaseUserService.updateUserRole(userId, newRole);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Log activity
      await supabaseUserService.logActivity(adminId, {
        action: 'change_user_role',
        entity_type: 'user',
        entity_id: userId,
        metadata: { new_role: newRole },
      });

      return {
        success: true,
        message: 'User role updated successfully',
      };
    } catch (error: any) {
      console.error('Change user role error:', error);
      return {
        success: false,
        error: error.message || 'Failed to change user role',
      };
    }
  }

  /**
   * Get system settings
   */
  async getSystemSettings() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) {
        throw error;
      }

      // Convert array of settings to object
      const settingsObject = data?.reduce((acc: Record<string, any>, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      return {
        success: true,
        settings: settingsObject || {},
      };
    } catch (error: any) {
      console.error('Get system settings error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get system settings',
      };
    }
  }

  /**
   * Update system setting
   */
  async updateSystemSetting(key: string, value: any, adminId: string) {
    try {
      const now = new Date().toISOString();
      
      // Check if setting exists
      const { data: existingSetting } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', key)
        .single();
      
      if (existingSetting) {
        // Update existing setting
        const { error } = await supabase
          .from('system_settings')
          .update({
            value,
            updated_at: now,
          })
          .eq('key', key);

        if (error) {
          throw error;
        }
      } else {
        // Create new setting
        const { error } = await supabase
          .from('system_settings')
          .insert({
            key,
            value,
            created_at: now,
            updated_at: now,
          });

        if (error) {
          throw error;
        }
      }

      // Log activity
      await supabaseUserService.logActivity(adminId, {
        action: 'update_system_setting',
        entity_type: 'setting',
        entity_id: key,
        metadata: { key },
      });

      return {
        success: true,
        message: 'System setting updated successfully',
      };
    } catch (error: any) {
      console.error('Update system setting error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update system setting',
      };
    }
  }
}

export const supabaseAdminService = new SupabaseAdminService();
