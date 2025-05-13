/**
 * Supabase Donor Service
 * 
 * This service handles donor-related operations using Supabase.
 * It replaces the Firebase-based donor service with Supabase equivalents.
 */

import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { supabaseUserService } from './supabaseUserService';

export interface DonorProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  preferred_causes: string[] | null;
  donation_frequency: string | null;
  donation_amount: number | null;
  tax_receipt_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  donor_id: string | null;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  reference: string | null;
  transaction_id: string | null;
  donation_date: string;
  recurring: boolean;
  campaign_id: string | null;
  anonymous: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonationMetadata {
  donation_id: string;
  key: string;
  value: string;
  created_at: string;
}

class SupabaseDonorService {
  /**
   * Get donor profile by ID
   */
  async getDonorProfile(donorId: string) {
    try {
      const { data, error } = await supabase
        .from('donor_profiles')
        .select('*')
        .eq('id', donorId)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        profile: data,
      };
    } catch (error: any) {
      console.error('Get donor profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get donor profile',
      };
    }
  }

  /**
   * Create or update donor profile
   */
  async updateDonorProfile(donorId: string, profileData: Partial<DonorProfile>) {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('donor_profiles')
        .select('id')
        .eq('id', donorId)
        .single();

      const now = new Date().toISOString();
      
      if (existingProfile) {
        // Update existing profile
        const updateData = {
          ...profileData,
          updated_at: now,
        } as Database['public']['Tables']['donor_profiles']['Update'];
        
        const { error } = await supabase
          .from('donor_profiles')
          .update(updateData)
          .eq('id', donorId);

        if (error) {
          throw error;
        }
      } else {
        // Create new profile
        const insertData = {
          id: donorId,
          ...profileData,
          created_at: now,
          updated_at: now,
        } as Database['public']['Tables']['donor_profiles']['Insert'];
        
        const { error } = await supabase
          .from('donor_profiles')
          .insert(insertData);

        if (error) {
          throw error;
        }
      }

      // Log activity
      await supabaseUserService.logActivity(donorId, {
        action: existingProfile ? 'profile_update' : 'profile_create',
        entity_type: 'donor_profile',
        entity_id: donorId,
      });

      return {
        success: true,
        message: existingProfile ? 'Donor profile updated' : 'Donor profile created',
      };
    } catch (error: any) {
      console.error('Update donor profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update donor profile',
      };
    }
  }

  /**
   * Get donor's donation history
   */
  async getDonationHistory(donorId: string, options: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
  } = {}) {
    try {
      let query = supabase
        .from('donations')
        .select('*, donation_metadata(*)')
        .eq('donor_id', donorId)
        .order('donation_date', { ascending: false });

      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.startDate) {
        query = query.gte('donation_date', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('donation_date', options.endDate);
      }

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

      // Process donations to include metadata as key-value pairs
      const processedDonations = data?.map((donation: any) => {
        const metadata: Record<string, any> = {};
        
        if (donation.donation_metadata && Array.isArray(donation.donation_metadata)) {
          donation.donation_metadata.forEach((meta: DonationMetadata) => {
            try {
              // Try to parse JSON values
              metadata[meta.key] = JSON.parse(meta.value);
            } catch {
              // If not JSON, use as is
              metadata[meta.key] = meta.value;
            }
          });
        }
        
        // Remove the donation_metadata array and add the processed metadata
        const { donation_metadata, ...donationData } = donation;
        return {
          ...donationData,
          metadata
        };
      });

      return {
        success: true,
        donations: processedDonations || [],
        count: count || 0,
      };
    } catch (error: any) {
      console.error('Get donation history error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get donation history',
      };
    }
  }

  /**
   * Create a new donation
   */
  async createDonation(donationData: Omit<Donation, 'id' | 'created_at' | 'updated_at'>, metadata?: Record<string, any>) {
    try {
      const now = new Date().toISOString();
      
      // Insert donation
      const { data: donation, error: donationError } = await supabase
        .from('donations')
        .insert({
          ...donationData,
          donation_date: donationData.donation_date || now,
          created_at: now,
          updated_at: now,
        } as Database['public']['Tables']['donations']['Insert'])
        .select('id')
        .single();

      if (donationError || !donation) {
        throw donationError || new Error('Failed to create donation');
      }

      // Insert metadata if provided
      if (metadata && Object.keys(metadata).length > 0) {
        const metadataEntries = Object.entries(metadata).map(([key, value]) => ({
          donation_id: donation.id,
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          created_at: now,
        }));

        const { error: metadataError } = await supabase
          .from('donation_metadata')
          .insert(metadataEntries as any[]);

        if (metadataError) {
          console.error('Error saving donation metadata:', metadataError);
        }
      }

      // Log activity if donor is authenticated
      if (donationData.donor_id) {
        await supabaseUserService.logActivity(donationData.donor_id, {
          action: 'donation_create',
          entity_type: 'donation',
          entity_id: donation.id,
          metadata: { amount: donationData.amount, currency: donationData.currency },
        });
      }

      return {
        success: true,
        donationId: donation.id,
        message: 'Donation created successfully',
      };
    } catch (error: any) {
      console.error('Create donation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create donation',
      };
    }
  }

  /**
   * Update donation status
   */
  async updateDonationStatus(donationId: string, status: string, transactionId?: string) {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (transactionId) {
        updateData.transaction_id = transactionId;
      }

      const { error } = await supabase
        .from('donations')
        .update(updateData)
        .eq('id', donationId);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: `Donation status updated to ${status}`,
      };
    } catch (error: any) {
      console.error('Update donation status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update donation status',
      };
    }
  }

  /**
   * Get donation statistics for a donor
   */
  async getDonorStatistics(donorId: string) {
    try {
      // Get total donations
      const { data: totalData, error: totalError } = await supabase
        .from('donations')
        .select('amount, currency')
        .eq('donor_id', donorId)
        .eq('status', 'completed');

      if (totalError) {
        throw totalError;
      }

      // Calculate totals by currency
      const totalsByCurrency: Record<string, number> = {};
      let donationCount = 0;

      if (totalData) {
        donationCount = totalData.length;
        
        totalData.forEach((donation: { amount: number; currency: string }) => {
          const { amount, currency } = donation;
          totalsByCurrency[currency] = (totalsByCurrency[currency] || 0) + amount;
        });
      }

      // Get first and last donation dates
      const { data: dateData, error: dateError } = await supabase
        .from('donations')
        .select('donation_date')
        .eq('donor_id', donorId)
        .eq('status', 'completed')
        .order('donation_date', { ascending: true });

      if (dateError) {
        throw dateError;
      }

      const firstDonationDate = dateData && dateData.length > 0 ? dateData[0].donation_date : null;
      const lastDonationDate = dateData && dateData.length > 0 ? dateData[dateData.length - 1].donation_date : null;

      // Get preferred causes from donor profile
      const { data: profileData, error: profileError } = await supabase
        .from('donor_profiles')
        .select('preferred_causes')
        .eq('id', donorId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // Not found error
        throw profileError;
      }

      return {
        success: true,
        statistics: {
          totalsByCurrency,
          donationCount,
          firstDonationDate,
          lastDonationDate,
          preferredCauses: profileData?.preferred_causes || [],
        },
      };
    } catch (error: any) {
      console.error('Get donor statistics error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get donor statistics',
      };
    }
  }

  /**
   * Get all donors with optional filtering and pagination
   */
  async getAllDonors(options: {
    limit?: number;
    offset?: number;
    searchTerm?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}) {
    try {
      let query = supabase
        .from('donor_profiles')
        .select('*, users!inner(email, role, status)');

      // Apply search if provided
      if (options.searchTerm) {
        query = query.or(`full_name.ilike.%${options.searchTerm}%,users.email.ilike.%${options.searchTerm}%`);
      }

      // Apply sorting
      const sortBy = options.sortBy || 'created_at';
      const sortDirection = options.sortDirection || 'desc';
      
      if (sortBy.startsWith('users.')) {
        // Sorting by a field in the users table
        const userField = sortBy.replace('users.', '');
        query = query.order(userField, { ascending: sortDirection === 'asc', foreignTable: 'users' });
      } else {
        // Sorting by a field in the donor_profiles table
        query = query.order(sortBy, { ascending: sortDirection === 'asc' });
      }

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

      // Process data to combine user and profile information
      const processedDonors = data?.map((donor: any) => {
        const { users, ...donorProfile } = donor;
        return {
          ...donorProfile,
          email: users.email,
          role: users.role,
          status: users.status,
        };
      });

      return {
        success: true,
        donors: processedDonors || [],
        count: count || 0,
      };
    } catch (error: any) {
      console.error('Get all donors error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get donors',
      };
    }
  }

  /**
   * Get donation summary for reporting
   */
  async getDonationSummary(options: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month' | 'year';
  } = {}) {
    try {
      const { startDate, endDate, groupBy = 'month' } = options;
      
      // Determine the date trunc format based on groupBy
      let dateFormat: string;
      switch (groupBy) {
        case 'day':
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'week':
          dateFormat = 'YYYY-WW';
          break;
        case 'month':
          dateFormat = 'YYYY-MM';
          break;
        case 'year':
          dateFormat = 'YYYY';
          break;
        default:
          dateFormat = 'YYYY-MM';
      }

      // Build the SQL query for aggregating donations
      const { data, error } = await supabase.rpc('get_donation_summary', {
        start_date: startDate,
        end_date: endDate,
        group_by: groupBy,
        date_format: dateFormat
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        summary: data || [],
      };
    } catch (error: any) {
      console.error('Get donation summary error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get donation summary',
      };
    }
  }
}

export const supabaseDonorService = new SupabaseDonorService();
