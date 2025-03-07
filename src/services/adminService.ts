// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
import { userService } from './userService';

interface UserSearchFilters {
  role?: string;
  status?: string;
  query?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface UserSearchResult {
  users: any[];
  total: number;
  page: number;
  totalPages: number;
}

export class AdminService {
  static async searchUsers(filters: UserSearchFilters): Promise<UserSearchResult> {
    try {
      let query = supabase
        .from('users')
        .select('*, user_profiles(*)', { count: 'exact' });

      // Apply filters
      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.query) {
        query = query.or(`email.ilike.%${filters.query}%,first_name.ilike.%${filters.query}%,last_name.ilike.%${filters.query}%`);
      }

      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }

      if (filters.toDate) {
        query = query.lte('created_at', filters.toDate);
      }

      // Apply sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, {
          ascending: filters.sortOrder === 'asc'
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      // Execute query
      const { data, error, count } = await query;

      if (error) throw error;

      return {
        users: data,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('User search error:', error);
      throw new Error('Failed to search users');
    }
  }

  static async bulkUpdateUsers(
    userIds: string[],
    updates: {
      status?: string;
      role?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', userIds);

      if (error) throw error;

      // Log activity for each user
      for (const userId of userIds) {
        await userService.logActivity(userId, {
          action: 'bulk_update',
          metadata: updates
        });
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      throw new Error('Failed to update users');
    }
  }

  static async bulkDeleteUsers(userIds: string[]): Promise<void> {
    try {
      for (const userId of userIds) {
        await userService.deleteUser(userId);
      }
    } catch (error) {
      console.error('Bulk deletion error:', error);
      throw new Error('Failed to delete users');
    }
  }

  static async getUserStats(): Promise<{
    total: number;
    activeUsers: number;
    newUsersToday: number;
    roleDistribution: Record<string, number>;
    statusDistribution: Record<string, number>;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('users')
        .select('role, status, created_at');

      if (error) throw error;

      const stats = {
        total: data.length,
        activeUsers: data.filter(u => u.status === 'ACTIVE').length,
        newUsersToday: data.filter(u => new Date(u.created_at) >= today).length,
        roleDistribution: {},
        statusDistribution: {}
      };

      // Calculate distributions
      data.forEach(user => {
        stats.roleDistribution[user.role] = (stats.roleDistribution[user.role] || 0) + 1;
        stats.statusDistribution[user.status] = (stats.statusDistribution[user.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('User stats error:', error);
      throw new Error('Failed to get user statistics');
    }
  }

  static async getAuditLog(
    filters: {
      userId?: string;
      action?: string;
      fromDate?: string;
      toDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    logs: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*, users!inner(email)', { count: 'exact' });

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }

      if (filters.toDate) {
        query = query.lte('created_at', filters.toDate);
      }

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        logs: data,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Audit log error:', error);
      throw new Error('Failed to get audit log');
    }
  }

  static async getSystemHealth(): Promise<{
    activeUsers24h: number;
    failedLogins24h: number;
    averageResponseTime: number;
    errorRate: number;
    storageUsage: number;
  }> {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Get active users in last 24h
      const { data: activeUsers } = await supabase
        .from('user_sessions')
        .select('user_id', { count: 'exact' })
        .gte('created_at', twentyFourHoursAgo.toISOString());

      // Get failed logins in last 24h
      const { data: failedLogins } = await supabase
        .from('activity_logs')
        .select('id', { count: 'exact' })
        .eq('action', 'login_failed')
        .gte('created_at', twentyFourHoursAgo.toISOString());

      // Get error rate and response time
      const { data: errors } = await supabase
        .from('activity_logs')
        .select('metadata')
        .like('action', '%error%')
        .gte('created_at', twentyFourHoursAgo.toISOString());

      // Get storage usage
      const { data: storageData } = await supabase.storage
        .from('media')
        .list();

      return {
        activeUsers24h: activeUsers?.length || 0,
        failedLogins24h: failedLogins?.length || 0,
        averageResponseTime: 0, // Implement actual response time tracking
        errorRate: (errors?.length || 0) / 100, // Implement actual error rate calculation
        storageUsage: storageData?.reduce((acc, file) => acc + (file.metadata?.size || 0), 0) || 0
      };
    } catch (error) {
      console.error('System health check error:', error);
      throw new Error('Failed to get system health metrics');
    }
  }
} 