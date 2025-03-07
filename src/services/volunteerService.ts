// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
import { userService } from './userService';
import { emailService } from './emailService';

interface VolunteerProfile {
  user_id: string;
  availability: {
    weekdays?: string[];
    weekends?: boolean;
    preferred_hours?: string[];
  };
  skills: string[];
  certifications: string[];
  areas_of_interest: string[];
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  background_check_status: 'pending' | 'approved' | 'rejected' | 'expired';
  total_hours: number;
}

interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  location: string;
  date_range: {
    start: string;
    end: string;
  };
  shifts: {
    date: string;
    start_time: string;
    end_time: string;
    volunteers_needed: number;
  }[];
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  updated_at: string;
}

interface VolunteerHourLog {
  id: string;
  volunteer_id: string;
  opportunity_id: string;
  date: string;
  hours: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export class VolunteerService {
  static async registerVolunteer(
    userId: string,
    profileData: Partial<VolunteerProfile>
  ): Promise<void> {
    try {
      // Create volunteer profile
      const { error: profileError } = await supabase
        .from('volunteer_profiles')
        .insert([
          {
            user_id: userId,
            ...profileData,
            background_check_status: 'pending',
            total_hours: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (profileError) throw profileError;

      // Update user role
      await userService.updateProfile(userId, { role: 'VOLUNTEER' });

      // Get user details for email
      const user = await userService.getUserWithProfile(userId);

      // Send welcome email
      await emailService.sendVolunteerWelcomeEmail(user);

      // Log activity
      await userService.logActivity(userId, {
        action: 'volunteer_registered',
        entity_type: 'volunteer_profile',
        entity_id: userId,
      });
    } catch (error) {
      console.error('Volunteer registration error:', error);
      throw new Error('Failed to register volunteer');
    }
  }

  static async updateVolunteerProfile(
    userId: string,
    updates: Partial<VolunteerProfile>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('volunteer_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      await userService.logActivity(userId, {
        action: 'volunteer_profile_updated',
        entity_type: 'volunteer_profile',
        entity_id: userId,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update volunteer profile');
    }
  }

  static async createOpportunity(
    opportunity: Omit<VolunteerOpportunity, 'id' | 'created_at' | 'updated_at'>
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('volunteer_opportunities')
        .insert([
          {
            ...opportunity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('Opportunity creation error:', error);
      throw new Error('Failed to create volunteer opportunity');
    }
  }

  static async matchVolunteers(
    opportunityId: string,
    filters: {
      skills?: string[];
      availability?: string[];
      location?: string;
      maxDistance?: number;
    }
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('volunteer_profiles')
        .select('*, users!inner(*)')
        .eq('background_check_status', 'approved');

      if (filters.skills?.length) {
        query = query.contains('skills', filters.skills);
      }

      // Add more complex filtering logic here
      // This is a simplified version

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Volunteer matching error:', error);
      throw new Error('Failed to match volunteers');
    }
  }

  static async assignVolunteer(
    opportunityId: string,
    volunteerId: string,
    shiftDetails: {
      date: string;
      start_time: string;
      end_time: string;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('volunteer_assignments')
        .insert([
          {
            opportunity_id: opportunityId,
            volunteer_id: volunteerId,
            ...shiftDetails,
            status: 'assigned',
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      // Get volunteer details
      const volunteer = await userService.getUserWithProfile(volunteerId);

      // Send assignment notification
      await emailService.sendVolunteerAssignmentEmail(volunteer, {
        opportunityId,
        shiftDetails,
      });

      // Log activity
      await userService.logActivity(volunteerId, {
        action: 'volunteer_assigned',
        entity_type: 'volunteer_opportunity',
        entity_id: opportunityId,
        metadata: { shiftDetails },
      });
    } catch (error) {
      console.error('Volunteer assignment error:', error);
      throw new Error('Failed to assign volunteer');
    }
  }

  static async logHours(
    volunteerId: string,
    logData: Omit<VolunteerHourLog, 'id' | 'volunteer_id' | 'status'>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('volunteer_hours')
        .insert([
          {
            volunteer_id: volunteerId,
            ...logData,
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      await userService.logActivity(volunteerId, {
        action: 'hours_logged',
        entity_type: 'volunteer_hours',
        metadata: logData,
      });
    } catch (error) {
      console.error('Hour logging error:', error);
      throw new Error('Failed to log volunteer hours');
    }
  }

  static async approveHours(
    hourLogId: string,
    adminId: string,
    notes?: string
  ): Promise<void> {
    try {
      const { data: hourLog, error: fetchError } = await supabase
        .from('volunteer_hours')
        .select('*')
        .eq('id', hourLogId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('volunteer_hours')
        .update({
          status: 'approved',
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', hourLogId);

      if (updateError) throw updateError;

      // Update total hours
      await supabase.rpc('update_volunteer_total_hours', {
        volunteer_id: hourLog.volunteer_id,
        hours_to_add: hourLog.hours,
      });

      await userService.logActivity(adminId, {
        action: 'hours_approved',
        entity_type: 'volunteer_hours',
        entity_id: hourLogId,
      });
    } catch (error) {
      console.error('Hour approval error:', error);
      throw new Error('Failed to approve volunteer hours');
    }
  }

  static async submitBackgroundCheck(
    volunteerId: string,
    documents: {
      type: string;
      url: string;
    }[]
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('background_checks')
        .insert([
          {
            volunteer_id: volunteerId,
            documents,
            status: 'pending',
            submitted_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      // Update profile status
      await this.updateVolunteerProfile(volunteerId, {
        background_check_status: 'pending',
      });

      // Log activity
      await userService.logActivity(volunteerId, {
        action: 'background_check_submitted',
        entity_type: 'background_check',
      });
    } catch (error) {
      console.error('Background check submission error:', error);
      throw new Error('Failed to submit background check');
    }
  }

  static async processBackgroundCheck(
    volunteerId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ): Promise<void> {
    try {
      const { error: updateError } = await supabase
        .from('background_checks')
        .update({
          status,
          processed_at: new Date().toISOString(),
          notes,
        })
        .eq('volunteer_id', volunteerId)
        .eq('status', 'pending');

      if (updateError) throw updateError;

      // Update profile status
      await this.updateVolunteerProfile(volunteerId, {
        background_check_status: status,
      });

      // Get volunteer details
      const volunteer = await userService.getUserWithProfile(volunteerId);

      // Send status notification
      await emailService.sendBackgroundCheckStatusEmail(volunteer, {
        status,
        notes,
      });

      // Log activity
      await userService.logActivity(volunteerId, {
        action: 'background_check_processed',
        metadata: { status, notes },
      });
    } catch (error) {
      console.error('Background check processing error:', error);
      throw new Error('Failed to process background check');
    }
  }
} 