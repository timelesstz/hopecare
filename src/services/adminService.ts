// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  orderBy, 
  limit as firestoreLimit, 
  startAfter, 
  getCountFromServer,
  Timestamp,
  or,
  and,
  startAt,
  endAt,
  getDoc
} from 'firebase/firestore';
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
      const usersCollection = collection(db, 'users');
      
      // Build query constraints
      const constraints = [];
      
      if (filters.role) {
        constraints.push(where('role', '==', filters.role));
      }
      
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      
      // Date filters
      if (filters.fromDate) {
        constraints.push(where('created_at', '>=', filters.fromDate));
      }
      
      if (filters.toDate) {
        constraints.push(where('created_at', '<=', filters.toDate));
      }
      
      // Sort order
      const sortField = filters.sortBy || 'created_at';
      const sortDirection = filters.sortOrder === 'asc' ? 'asc' : 'desc';
      constraints.push(orderBy(sortField, sortDirection));
      
      // Create the query
      const usersQuery = query(usersCollection, ...constraints);
      
      // Get total count
      const countSnapshot = await getCountFromServer(usersQuery);
      const total = countSnapshot.data().count;
      
      // Apply pagination
      const page = filters.page || 1;
      const pageSize = filters.limit || 10;
      const paginatedQuery = query(
        usersCollection, 
        ...constraints,
        firestoreLimit(pageSize)
      );
      
      // If not the first page, we need to use startAfter
      let finalQuery = paginatedQuery;
      if (page > 1) {
        // This is a simplified approach - for production, you'd need to store the last document
        // of each page or use a cursor-based pagination approach
        const snapshot = await getDocs(query(
          usersCollection,
          ...constraints,
          firestoreLimit((page - 1) * pageSize)
        ));
        
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        if (lastVisible) {
          finalQuery = query(
            usersCollection,
            ...constraints,
            startAfter(lastVisible),
            firestoreLimit(pageSize)
          );
        }
      }
      
      // Execute query
      const querySnapshot = await getDocs(finalQuery);
      
      // Process results
      const users = [];
      for (const userDoc of querySnapshot.docs) {
        const userData = userDoc.data();
        
        // Get user profile
        const userProfilesCollection = collection(db, 'user_profiles');
        const profileQuery = query(userProfilesCollection, where('user_id', '==', userDoc.id));
        const profileSnapshot = await getDocs(profileQuery);
        
        let profile = null;
        if (!profileSnapshot.empty) {
          profile = profileSnapshot.docs[0].data();
        }
        
        users.push({
          id: userDoc.id,
          ...userData,
          user_profiles: profile
        });
      }
      
      // If text search is needed, we need to filter in memory
      // Note: For production, consider using Algolia or another search service
      let filteredUsers = users;
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filteredUsers = users.filter(user => 
          user.email?.toLowerCase().includes(query) ||
          user.first_name?.toLowerCase().includes(query) ||
          user.last_name?.toLowerCase().includes(query)
        );
      }
      
      return {
        users: filteredUsers,
        total,
        page,
        totalPages: Math.ceil(total / pageSize)
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
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // Update each user document
      for (const userId of userIds) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, updateData);
        
        // Log activity for each user
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
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const stats = {
        total: usersSnapshot.size,
        activeUsers: 0,
        newUsersToday: 0,
        roleDistribution: {},
        statusDistribution: {}
      };
      
      // Process each user
      usersSnapshot.forEach(userDoc => {
        const userData = userDoc.data();
        
        // Count active users
        if (userData.status === 'ACTIVE') {
          stats.activeUsers++;
        }
        
        // Count new users today
        if (new Date(userData.created_at) >= today) {
          stats.newUsersToday++;
        }
        
        // Update distributions
        if (userData.role) {
          stats.roleDistribution[userData.role] = (stats.roleDistribution[userData.role] || 0) + 1;
        }
        
        if (userData.status) {
          stats.statusDistribution[userData.status] = (stats.statusDistribution[userData.status] || 0) + 1;
        }
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
      const logsCollection = collection(db, 'activity_logs');
      
      // Build query constraints
      const constraints = [];
      
      if (filters.userId) {
        constraints.push(where('user_id', '==', filters.userId));
      }
      
      if (filters.action) {
        constraints.push(where('action', '==', filters.action));
      }
      
      if (filters.fromDate) {
        constraints.push(where('created_at', '>=', filters.fromDate));
      }
      
      if (filters.toDate) {
        constraints.push(where('created_at', '<=', filters.toDate));
      }
      
      // Add sort order
      constraints.push(orderBy('created_at', 'desc'));
      
      // Create the query
      const logsQuery = query(logsCollection, ...constraints);
      
      // Get total count
      const countSnapshot = await getCountFromServer(logsQuery);
      const total = countSnapshot.data().count;
      
      // Apply pagination
      const page = filters.page || 1;
      const pageSize = filters.limit || 50;
      
      // Create paginated query
      let paginatedQuery = query(
        logsCollection,
        ...constraints,
        firestoreLimit(pageSize)
      );
      
      // If not the first page, we need to use startAfter
      if (page > 1) {
        const snapshot = await getDocs(query(
          logsCollection,
          ...constraints,
          firestoreLimit((page - 1) * pageSize)
        ));
        
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        if (lastVisible) {
          paginatedQuery = query(
            logsCollection,
            ...constraints,
            startAfter(lastVisible),
            firestoreLimit(pageSize)
          );
        }
      }
      
      // Execute query
      const querySnapshot = await getDocs(paginatedQuery);
      
      // Process results and fetch user emails
      const logs = [];
      for (const logDoc of querySnapshot.docs) {
        const logData = logDoc.data();
        
        // Get user email
        let userEmail = null;
        if (logData.user_id) {
          const userDoc = await getDoc(doc(db, 'users', logData.user_id));
          if (userDoc.exists()) {
            userEmail = userDoc.data().email;
          }
        }
        
        logs.push({
          id: logDoc.id,
          ...logData,
          user: { email: userEmail }
        });
      }
      
      return {
        logs,
        total,
        page,
        totalPages: Math.ceil(total / pageSize)
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
      const twentyFourHoursAgoStr = twentyFourHoursAgo.toISOString();
      
      // Get active users in last 24h
      const sessionsCollection = collection(db, 'user_sessions');
      const sessionsQuery = query(
        sessionsCollection,
        where('created_at', '>=', twentyFourHoursAgoStr)
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const activeUsers24h = new Set(
        sessionsSnapshot.docs.map(doc => doc.data().user_id)
      ).size;
      
      // Get failed logins in last 24h
      const logsCollection = collection(db, 'activity_logs');
      const failedLoginsQuery = query(
        logsCollection,
        where('action', '==', 'login_failed'),
        where('created_at', '>=', twentyFourHoursAgoStr)
      );
      const failedLoginsSnapshot = await getDocs(failedLoginsQuery);
      const failedLogins24h = failedLoginsSnapshot.size;
      
      // Get errors in last 24h
      const errorLogsCollection = collection(db, 'error_logs');
      const errorLogsQuery = query(
        errorLogsCollection,
        where('created_at', '>=', twentyFourHoursAgoStr)
      );
      const errorLogsSnapshot = await getDocs(errorLogsQuery);
      
      // Calculate error rate (errors / total requests)
      const requestLogsQuery = query(
        logsCollection,
        where('created_at', '>=', twentyFourHoursAgoStr)
      );
      const requestLogsSnapshot = await getDocs(requestLogsQuery);
      
      const errorRate = requestLogsSnapshot.size > 0 
        ? (errorLogsSnapshot.size / requestLogsSnapshot.size) * 100 
        : 0;
      
      // Calculate average response time
      let totalResponseTime = 0;
      let responseTimeCount = 0;
      
      errorLogsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.metadata?.response_time) {
          totalResponseTime += data.metadata.response_time;
          responseTimeCount++;
        }
      });
      
      const averageResponseTime = responseTimeCount > 0 
        ? totalResponseTime / responseTimeCount 
        : 0;
      
      // Get storage usage
      // Note: For Firebase Storage, you might need a different approach
      // This is a placeholder implementation
      const storageUsage = 0; // In bytes
      
      return {
        activeUsers24h,
        failedLogins24h,
        averageResponseTime,
        errorRate,
        storageUsage
      };
    } catch (error) {
      console.error('System health error:', error);
      throw new Error('Failed to get system health');
    }
  }
} 