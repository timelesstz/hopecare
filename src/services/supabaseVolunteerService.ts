/**
 * Supabase Volunteer Service
 * 
 * This service handles volunteer-related operations using Supabase.
 * It replaces the Firebase-based volunteer service with Supabase equivalents.
 */

import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { supabaseUserService } from './supabaseUserService';

export interface VolunteerProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  skills: string[] | null;
  availability: string[] | null;
  interests: string[] | null;
  experience: string | null;
  applied_opportunities: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface VolunteerCertification {
  id: string;
  volunteer_id: string;
  name: string;
  issue_date: string;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string | null;
  duration: number | null;
  skills_required: string[] | null;
  coordinator: string | null;
  status: string | null;
  image: string | null;
  max_volunteers: number | null;
  current_volunteers: number | null;
  applicants: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface VolunteerHours {
  id: string;
  volunteer_id: string;
  opportunity_id: string | null;
  hours: number;
  activity_date: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VolunteerApplication {
  id: string;
  volunteer_id: string;
  opportunity_id: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

class SupabaseVolunteerService {
  /**
   * Get volunteer profile by ID
   */
  async getVolunteerProfile(volunteerId: string) {
    try {
      // Get volunteer profile
      const { data: profile, error: profileError } = await supabase
        .from('volunteer_profiles')
        .select('*')
        .eq('id', volunteerId)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Get volunteer certifications
      const { data: certifications, error: certError } = await supabase
        .from('volunteer_certifications')
        .select('*')
        .eq('volunteer_id', volunteerId);

      if (certError) {
        throw certError;
      }

      // Get total hours
      const { data: hoursData, error: hoursError } = await supabase
        .from('volunteer_hours')
        .select('hours')
        .eq('volunteer_id', volunteerId)
        .eq('status', 'approved');

      if (hoursError) {
        throw hoursError;
      }

      const totalHours = hoursData?.reduce((sum, record) => sum + (record.hours || 0), 0) || 0;

      return {
        success: true,
        profile,
        certifications: certifications || [],
        totalHours,
      };
    } catch (error: any) {
      console.error('Get volunteer profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get volunteer profile',
      };
    }
  }

  /**
   * Create or update volunteer profile
   */
  async updateVolunteerProfile(volunteerId: string, profileData: Partial<VolunteerProfile>) {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('volunteer_profiles')
        .select('id')
        .eq('id', volunteerId)
        .single();

      const now = new Date().toISOString();
      
      if (existingProfile) {
        // Update existing profile
        const updateData = {
          ...profileData,
          updated_at: now,
        } as Database['public']['Tables']['volunteer_profiles']['Update'];
        
        const { error } = await supabase
          .from('volunteer_profiles')
          .update(updateData)
          .eq('id', volunteerId);

        if (error) {
          throw error;
        }
      } else {
        // Create new profile
        const insertData = {
          id: volunteerId,
          ...profileData,
          created_at: now,
          updated_at: now,
        } as Database['public']['Tables']['volunteer_profiles']['Insert'];
        
        const { error } = await supabase
          .from('volunteer_profiles')
          .insert(insertData);

        if (error) {
          throw error;
        }
      }

      // Log activity
      await supabaseUserService.logActivity(volunteerId, {
        action: existingProfile ? 'profile_update' : 'profile_create',
        entity_type: 'volunteer_profile',
        entity_id: volunteerId,
      });

      return {
        success: true,
        message: existingProfile ? 'Volunteer profile updated' : 'Volunteer profile created',
      };
    } catch (error: any) {
      console.error('Update volunteer profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update volunteer profile',
      };
    }
  }

  /**
   * Add certification to volunteer profile
   */
  async addCertification(certification: Omit<VolunteerCertification, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('volunteer_certifications')
        .insert({
          ...certification,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Log activity
      await supabaseUserService.logActivity(certification.volunteer_id, {
        action: 'certification_add',
        entity_type: 'volunteer_certification',
        entity_id: data.id,
        metadata: { name: certification.name },
      });

      return {
        success: true,
        certificationId: data.id,
        message: 'Certification added successfully',
      };
    } catch (error: any) {
      console.error('Add certification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to add certification',
      };
    }
  }

  /**
   * Update certification
   */
  async updateCertification(certificationId: string, certificationData: Partial<VolunteerCertification>) {
    try {
      // Get certification to check volunteer_id
      const { data: existingCert, error: getError } = await supabase
        .from('volunteer_certifications')
        .select('volunteer_id')
        .eq('id', certificationId)
        .single();

      if (getError) {
        throw getError;
      }

      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('volunteer_certifications')
        .update({
          ...certificationData,
          updated_at: now,
        })
        .eq('id', certificationId);

      if (error) {
        throw error;
      }

      // Log activity
      await supabaseUserService.logActivity(existingCert.volunteer_id, {
        action: 'certification_update',
        entity_type: 'volunteer_certification',
        entity_id: certificationId,
      });

      return {
        success: true,
        message: 'Certification updated successfully',
      };
    } catch (error: any) {
      console.error('Update certification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update certification',
      };
    }
  }

  /**
   * Delete certification
   */
  async deleteCertification(certificationId: string) {
    try {
      // Get certification to check volunteer_id
      const { data: existingCert, error: getError } = await supabase
        .from('volunteer_certifications')
        .select('volunteer_id, name')
        .eq('id', certificationId)
        .single();

      if (getError) {
        throw getError;
      }

      const { error } = await supabase
        .from('volunteer_certifications')
        .delete()
        .eq('id', certificationId);

      if (error) {
        throw error;
      }

      // Log activity
      await supabaseUserService.logActivity(existingCert.volunteer_id, {
        action: 'certification_delete',
        entity_type: 'volunteer_certification',
        entity_id: certificationId,
        metadata: { name: existingCert.name },
      });

      return {
        success: true,
        message: 'Certification deleted successfully',
      };
    } catch (error: any) {
      console.error('Delete certification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete certification',
      };
    }
  }

  /**
   * Get volunteer opportunities
   */
  async getOpportunities(options: {
    limit?: number;
    offset?: number;
    status?: string;
    searchTerm?: string;
    skills?: string[];
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}) {
    try {
      let query = supabase
        .from('opportunities')
        .select('*');

      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.searchTerm) {
        query = query.or(`title.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%,location.ilike.%${options.searchTerm}%`);
      }

      if (options.skills && options.skills.length > 0) {
        // Filter opportunities that require any of the specified skills
        const skillConditions = options.skills.map(skill => `skills_required.cs.{${skill}}`);
        query = query.or(skillConditions.join(','));
      }

      // Apply sorting
      const sortBy = options.sortBy || 'date';
      const sortDirection = options.sortDirection || 'asc';
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });

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

      return {
        success: true,
        opportunities: data || [],
        count: count || 0,
      };
    } catch (error: any) {
      console.error('Get opportunities error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get opportunities',
      };
    }
  }

  /**
   * Get a single opportunity by ID
   */
  async getOpportunity(opportunityId: string) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', opportunityId)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        opportunity: data,
      };
    } catch (error: any) {
      console.error('Get opportunity error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get opportunity',
      };
    }
  }

  /**
   * Create a new volunteer opportunity
   */
  async createOpportunity(opportunityData: Omit<VolunteerOpportunity, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          ...opportunityData,
          current_volunteers: 0,
          applicants: [],
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Log activity for the coordinator if available
      if (opportunityData.coordinator) {
        await supabaseUserService.logActivity(opportunityData.coordinator, {
          action: 'opportunity_create',
          entity_type: 'opportunity',
          entity_id: data.id,
          metadata: { title: opportunityData.title },
        });
      }

      return {
        success: true,
        opportunityId: data.id,
        message: 'Opportunity created successfully',
      };
    } catch (error: any) {
      console.error('Create opportunity error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create opportunity',
      };
    }
  }

  /**
   * Update an existing volunteer opportunity
   */
  async updateOpportunity(opportunityId: string, opportunityData: Partial<VolunteerOpportunity>) {
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('opportunities')
        .update({
          ...opportunityData,
          updated_at: now,
        })
        .eq('id', opportunityId);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Opportunity updated successfully',
      };
    } catch (error: any) {
      console.error('Update opportunity error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update opportunity',
      };
    }
  }

  /**
   * Apply for a volunteer opportunity
   */
  async applyForOpportunity(volunteerId: string, opportunityId: string, message?: string) {
    try {
      const now = new Date().toISOString();
      
      // Create application record
      const { data: application, error: applicationError } = await supabase
        .from('volunteer_applications')
        .insert({
          volunteer_id: volunteerId,
          opportunity_id: opportunityId,
          status: 'pending',
          message: message || null,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();

      if (applicationError) {
        throw applicationError;
      }

      // Update opportunity's applicants array
      const { data: opportunity, error: opportunityError } = await supabase
        .from('opportunities')
        .select('applicants')
        .eq('id', opportunityId)
        .single();

      if (opportunityError) {
        throw opportunityError;
      }

      const applicants = opportunity.applicants || [];
      if (!applicants.includes(volunteerId)) {
        applicants.push(volunteerId);
        
        const { error: updateError } = await supabase
          .from('opportunities')
          .update({
            applicants,
            updated_at: now,
          })
          .eq('id', opportunityId);

        if (updateError) {
          throw updateError;
        }
      }

      // Log activity
      await supabaseUserService.logActivity(volunteerId, {
        action: 'opportunity_apply',
        entity_type: 'opportunity',
        entity_id: opportunityId,
      });

      return {
        success: true,
        applicationId: application.id,
        message: 'Application submitted successfully',
      };
    } catch (error: any) {
      console.error('Apply for opportunity error:', error);
      return {
        success: false,
        error: error.message || 'Failed to apply for opportunity',
      };
    }
  }

  /**
   * Process volunteer application (approve/reject)
   */
  async processApplication(applicationId: string, status: 'approved' | 'rejected', adminId: string, notes?: string) {
    try {
      const now = new Date().toISOString();
      
      // Get application details
      const { data: application, error: getError } = await supabase
        .from('volunteer_applications')
        .select('volunteer_id, opportunity_id, status')
        .eq('id', applicationId)
        .single();

      if (getError) {
        throw getError;
      }

      // Don't process if already processed
      if (application.status !== 'pending') {
        return {
          success: false,
          error: `Application is already ${application.status}`,
        };
      }

      // Update application status
      const { error: updateError } = await supabase
        .from('volunteer_applications')
        .update({
          status,
          admin_notes: notes,
          updated_at: now,
        })
        .eq('id', applicationId);

      if (updateError) {
        throw updateError;
      }

      // If approved, update opportunity current_volunteers count
      if (status === 'approved') {
        const { data: opportunity, error: opportunityError } = await supabase
          .from('opportunities')
          .select('current_volunteers')
          .eq('id', application.opportunity_id)
          .single();

        if (opportunityError) {
          throw opportunityError;
        }

        const { error: updateOpportunityError } = await supabase
          .from('opportunities')
          .update({
            current_volunteers: (opportunity.current_volunteers || 0) + 1,
            updated_at: now,
          })
          .eq('id', application.opportunity_id);

        if (updateOpportunityError) {
          throw updateOpportunityError;
        }
      }

      // Log activity
      await supabaseUserService.logActivity(adminId, {
        action: `application_${status}`,
        entity_type: 'volunteer_application',
        entity_id: applicationId,
        metadata: {
          volunteer_id: application.volunteer_id,
          opportunity_id: application.opportunity_id,
        },
      });

      return {
        success: true,
        message: `Application ${status} successfully`,
      };
    } catch (error: any) {
      console.error('Process application error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process application',
      };
    }
  }

  /**
   * Log volunteer hours
   */
  async logHours(hoursData: Omit<VolunteerHours, 'id' | 'status' | 'approved_by' | 'approved_at' | 'created_at' | 'updated_at'>) {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('volunteer_hours')
        .insert({
          ...hoursData,
          status: 'pending',
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Log activity
      await supabaseUserService.logActivity(hoursData.volunteer_id, {
        action: 'hours_log',
        entity_type: 'volunteer_hours',
        entity_id: data.id,
        metadata: { hours: hoursData.hours, activity_date: hoursData.activity_date },
      });

      return {
        success: true,
        hoursId: data.id,
        message: 'Hours logged successfully',
      };
    } catch (error: any) {
      console.error('Log hours error:', error);
      return {
        success: false,
        error: error.message || 'Failed to log hours',
      };
    }
  }

  /**
   * Approve or reject logged hours
   */
  async processHours(hoursId: string, status: 'approved' | 'rejected', adminId: string) {
    try {
      const now = new Date().toISOString();
      
      // Get hours record
      const { data: hours, error: getError } = await supabase
        .from('volunteer_hours')
        .select('volunteer_id, status')
        .eq('id', hoursId)
        .single();

      if (getError) {
        throw getError;
      }

      // Don't process if already processed
      if (hours.status !== 'pending') {
        return {
          success: false,
          error: `Hours are already ${hours.status}`,
        };
      }

      // Update hours status
      const { error: updateError } = await supabase
        .from('volunteer_hours')
        .update({
          status,
          approved_by: adminId,
          approved_at: now,
          updated_at: now,
        })
        .eq('id', hoursId);

      if (updateError) {
        throw updateError;
      }

      // Log activity
      await supabaseUserService.logActivity(adminId, {
        action: `hours_${status}`,
        entity_type: 'volunteer_hours',
        entity_id: hoursId,
        metadata: { volunteer_id: hours.volunteer_id },
      });

      return {
        success: true,
        message: `Hours ${status} successfully`,
      };
    } catch (error: any) {
      console.error('Process hours error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process hours',
      };
    }
  }

  /**
   * Get volunteer hours
   */
  async getVolunteerHours(volunteerId: string, options: {
    limit?: number;
    offset?: number;
    status?: 'pending' | 'approved' | 'rejected';
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      let query = supabase
        .from('volunteer_hours')
        .select('*, opportunities(*)')
        .eq('volunteer_id', volunteerId)
        .order('activity_date', { ascending: false });

      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.startDate) {
        query = query.gte('activity_date', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('activity_date', options.endDate);
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

      // Process data to include opportunity title if available
      const processedHours = data?.map((record: any) => {
        const { opportunities, ...hoursData } = record;
        return {
          ...hoursData,
          opportunity_title: opportunities?.title || null,
        };
      });

      return {
        success: true,
        hours: processedHours || [],
        count: count || 0,
      };
    } catch (error: any) {
      console.error('Get volunteer hours error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get volunteer hours',
      };
    }
  }

  /**
   * Get volunteer statistics
   */
  async getVolunteerStatistics(volunteerId: string) {
    try {
      // Get total approved hours
      const { data: hoursData, error: hoursError } = await supabase
        .from('volunteer_hours')
        .select('hours')
        .eq('volunteer_id', volunteerId)
        .eq('status', 'approved');

      if (hoursError) {
        throw hoursError;
      }

      const totalHours = hoursData?.reduce((sum, record) => sum + (record.hours || 0), 0) || 0;

      // Get total opportunities participated in
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('volunteer_hours')
        .select('opportunity_id')
        .eq('volunteer_id', volunteerId)
        .eq('status', 'approved')
        .not('opportunity_id', 'is', null);

      if (opportunitiesError) {
        throw opportunitiesError;
      }

      // Count unique opportunities
      const uniqueOpportunities = new Set(opportunitiesData?.map(record => record.opportunity_id) || []);
      const totalOpportunities = uniqueOpportunities.size;

      // Get first and last volunteer dates
      const { data: dateData, error: dateError } = await supabase
        .from('volunteer_hours')
        .select('activity_date')
        .eq('volunteer_id', volunteerId)
        .eq('status', 'approved')
        .order('activity_date', { ascending: true });

      if (dateError) {
        throw dateError;
      }

      const firstVolunteerDate = dateData && dateData.length > 0 ? dateData[0].activity_date : null;
      const lastVolunteerDate = dateData && dateData.length > 0 ? dateData[dateData.length - 1].activity_date : null;

      // Get skills from volunteer profile
      const { data: profileData, error: profileError } = await supabase
        .from('volunteer_profiles')
        .select('skills')
        .eq('id', volunteerId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // Not found error
        throw profileError;
      }

      return {
        success: true,
        statistics: {
          totalHours,
          totalOpportunities,
          firstVolunteerDate,
          lastVolunteerDate,
          skills: profileData?.skills || [],
        },
      };
    } catch (error: any) {
      console.error('Get volunteer statistics error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get volunteer statistics',
      };
    }
  }

  /**
   * Get all volunteers with optional filtering and pagination
   */
  async getAllVolunteers(options: {
    limit?: number;
    offset?: number;
    searchTerm?: string;
    skills?: string[];
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}) {
    try {
      let query = supabase
        .from('volunteer_profiles')
        .select('*, users!inner(email, role, status)');

      // Apply search if provided
      if (options.searchTerm) {
        query = query.or(`full_name.ilike.%${options.searchTerm}%,users.email.ilike.%${options.searchTerm}%`);
      }

      // Filter by skills if provided
      if (options.skills && options.skills.length > 0) {
        const skillConditions = options.skills.map(skill => `skills.cs.{${skill}}`);
        query = query.or(skillConditions.join(','));
      }

      // Apply sorting
      const sortBy = options.sortBy || 'created_at';
      const sortDirection = options.sortDirection || 'desc';
      
      if (sortBy.startsWith('users.')) {
        // Sorting by a field in the users table
        const userField = sortBy.replace('users.', '');
        query = query.order(userField, { ascending: sortDirection === 'asc', foreignTable: 'users' });
      } else {
        // Sorting by a field in the volunteer_profiles table
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
      const processedVolunteers = data?.map((volunteer: any) => {
        const { users, ...volunteerProfile } = volunteer;
        return {
          ...volunteerProfile,
          email: users.email,
          role: users.role,
          status: users.status,
        };
      });

      return {
        success: true,
        volunteers: processedVolunteers || [],
        count: count || 0,
      };
    } catch (error: any) {
      console.error('Get all volunteers error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get volunteers',
      };
    }
  }
}

export const supabaseVolunteerService = new SupabaseVolunteerService();
