// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
import { userService } from './userService';
import { emailService } from './emailService';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';

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
      // Create volunteer profile in Firestore
      const volunteerProfilesCollection = collection(db, 'volunteer_profiles');
      
      await addDoc(volunteerProfilesCollection, {
        user_id: userId,
        ...profileData,
        background_check_status: 'pending',
        total_hours: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        timestamp: serverTimestamp(),
      });

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
      // Find the volunteer profile by user_id
      const volunteerProfilesCollection = collection(db, 'volunteer_profiles');
      const q = query(volunteerProfilesCollection, where('user_id', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Volunteer profile not found for user ID: ${userId}`);
      }
      
      // Get the first matching document
      const volunteerProfileDoc = querySnapshot.docs[0];
      const volunteerProfileRef = doc(db, 'volunteer_profiles', volunteerProfileDoc.id);
      
      // Update the profile
      await updateDoc(volunteerProfileRef, {
        ...updates,
        updated_at: new Date().toISOString(),
        timestamp: serverTimestamp(),
      });

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
      const opportunitiesCollection = collection(db, 'volunteer_opportunities');
      
      const docRef = await addDoc(opportunitiesCollection, {
        ...opportunity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        timestamp: serverTimestamp(),
      });

      return docRef.id;
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
      const volunteerProfilesCollection = collection(db, 'volunteer_profiles');
      let q = query(volunteerProfilesCollection, where('background_check_status', '==', 'approved'));
      
      // Add skill filtering if provided
      // Note: This is a simplified approach. For array containment with multiple values,
      // you might need to use multiple queries or a more complex solution
      if (filters.skills?.length) {
        // This will match profiles that contain at least one of the specified skills
        // For exact matching of all skills, you would need a different approach
        q = query(q, where('skills', 'array-contains-any', filters.skills));
      }
      
      const querySnapshot = await getDocs(q);
      
      const matchedVolunteers: any[] = [];
      
      // Process results and fetch related user data
      for (const volunteerDoc of querySnapshot.docs) {
        const volunteerData = volunteerDoc.data();
        
        // Fetch the user data for this volunteer
        const usersCollection = collection(db, 'users');
        const userQuery = query(usersCollection, where('id', '==', volunteerData.user_id));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          matchedVolunteers.push({
            ...volunteerData,
            user: userData
          });
        }
      }
      
      return matchedVolunteers;
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
      const assignmentsCollection = collection(db, 'volunteer_assignments');
      
      await addDoc(assignmentsCollection, {
        opportunity_id: opportunityId,
        volunteer_id: volunteerId,
        ...shiftDetails,
        status: 'assigned',
        created_at: new Date().toISOString(),
        timestamp: serverTimestamp(),
      });

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
      const hoursCollection = collection(db, 'volunteer_hours');
      
      await addDoc(hoursCollection, {
        volunteer_id: volunteerId,
        ...logData,
        status: 'pending',
        created_at: new Date().toISOString(),
        timestamp: serverTimestamp(),
      });

      await userService.logActivity(volunteerId, {
        action: 'hours_logged',
        entity_type: 'volunteer_hours',
        entity_id: logData.opportunity_id,
        metadata: { hours: logData.hours, date: logData.date },
      });
    } catch (error) {
      console.error('Hours logging error:', error);
      throw new Error('Failed to log volunteer hours');
    }
  }

  static async approveHours(
    hourLogId: string,
    adminId: string,
    notes?: string
  ): Promise<void> {
    try {
      // Get the hour log
      const hourLogRef = doc(db, 'volunteer_hours', hourLogId);
      const hourLogSnap = await getDoc(hourLogRef);
      
      if (!hourLogSnap.exists()) {
        throw new Error(`Hour log with ID ${hourLogId} not found`);
      }
      
      const hourLog = hourLogSnap.data() as VolunteerHourLog & { id: string };
      
      // Use a transaction to ensure data consistency
      await runTransaction(db, async (transaction) => {
        // Update the hour log status
        transaction.update(hourLogRef, {
          status: 'approved',
          approved_by: adminId,
          approved_at: new Date().toISOString(),
          notes: notes || null,
          updated_at: new Date().toISOString(),
        });
        
        // Find the volunteer profile to update total hours
        const volunteerProfilesCollection = collection(db, 'volunteer_profiles');
        const q = query(volunteerProfilesCollection, where('user_id', '==', hourLog.volunteer_id));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const volunteerProfileDoc = querySnapshot.docs[0];
          const volunteerProfileRef = doc(db, 'volunteer_profiles', volunteerProfileDoc.id);
          const volunteerProfile = volunteerProfileDoc.data() as VolunteerProfile;
          
          // Update the total hours
          transaction.update(volunteerProfileRef, {
            total_hours: (volunteerProfile.total_hours || 0) + hourLog.hours,
            updated_at: new Date().toISOString(),
          });
        }
      });

      // Get volunteer details for notification
      const volunteerProfilesCollection = collection(db, 'volunteer_profiles');
      const q = query(volunteerProfilesCollection, where('user_id', '==', hourLog.volunteer_id));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const volunteer = await userService.getUserWithProfile(hourLog.volunteer_id);
        
        // Send approval notification
        await emailService.sendHoursApprovedEmail(volunteer, {
          hours: hourLog.hours,
          date: hourLog.date,
          opportunityId: hourLog.opportunity_id,
        });
        
        // Log activity
        await userService.logActivity(adminId, {
          action: 'hours_approved',
          entity_type: 'volunteer_hours',
          entity_id: hourLogId,
          metadata: {
            volunteer_id: hourLog.volunteer_id,
            hours: hourLog.hours,
          },
        });
      }
    } catch (error) {
      console.error('Hours approval error:', error);
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
      const backgroundChecksCollection = collection(db, 'background_checks');
      
      await addDoc(backgroundChecksCollection, {
        volunteer_id: volunteerId,
        documents,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        timestamp: serverTimestamp(),
      });

      // Update volunteer profile status
      const volunteerProfilesCollection = collection(db, 'volunteer_profiles');
      const q = query(volunteerProfilesCollection, where('user_id', '==', volunteerId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const volunteerProfileDoc = querySnapshot.docs[0];
        const volunteerProfileRef = doc(db, 'volunteer_profiles', volunteerProfileDoc.id);
        
        await updateDoc(volunteerProfileRef, {
          background_check_status: 'pending',
          updated_at: new Date().toISOString(),
        });
      }

      // Log activity
      await userService.logActivity(volunteerId, {
        action: 'background_check_submitted',
        entity_type: 'background_check',
        entity_id: volunteerId,
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
      // Update the background check record
      const backgroundChecksCollection = collection(db, 'background_checks');
      const q = query(backgroundChecksCollection, 
        where('volunteer_id', '==', volunteerId),
        where('status', '==', 'submitted')
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const backgroundCheckDoc = querySnapshot.docs[0];
        const backgroundCheckRef = doc(db, 'background_checks', backgroundCheckDoc.id);
        
        await updateDoc(backgroundCheckRef, {
          status,
          processed_at: new Date().toISOString(),
          notes: notes || null,
          updated_at: new Date().toISOString(),
        });
      }

      // Update volunteer profile status
      const volunteerProfilesCollection = collection(db, 'volunteer_profiles');
      const profileQuery = query(volunteerProfilesCollection, where('user_id', '==', volunteerId));
      const profileSnapshot = await getDocs(profileQuery);
      
      if (!profileSnapshot.empty) {
        const volunteerProfileDoc = profileSnapshot.docs[0];
        const volunteerProfileRef = doc(db, 'volunteer_profiles', volunteerProfileDoc.id);
        
        await updateDoc(volunteerProfileRef, {
          background_check_status: status,
          updated_at: new Date().toISOString(),
        });
        
        // Get volunteer details for notification
        const volunteer = await userService.getUserWithProfile(volunteerId);
        
        // Send status notification
        if (status === 'approved') {
          await emailService.sendBackgroundCheckApprovedEmail(volunteer);
        } else {
          await emailService.sendBackgroundCheckRejectedEmail(volunteer, { notes });
        }
      }

      // Log activity
      await userService.logActivity('admin', { // Replace with actual admin ID
        action: `background_check_${status}`,
        entity_type: 'background_check',
        entity_id: volunteerId,
        metadata: { notes },
      });
    } catch (error) {
      console.error('Background check processing error:', error);
      throw new Error('Failed to process background check');
    }
  }
} 