// Supabase client import removed - using Firebase instead
import { db, auth, storage } from '../lib/firebase';
import { 
  doc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { userService } from './userService';
import { emailService } from './emailService';

export class AccountService {
  static async deactivateAccount(
    userId: string,
    reason?: string
  ): Promise<void> {
    try {
      // Update user status in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'INACTIVE',
        deactivation_reason: reason || null,
        deactivated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Get user details for email notification
      const user = await userService.getUserWithProfile(userId);

      // Send deactivation email
      await emailService.sendAccountDeactivationEmail(user, {
        reason,
        reactivationLink: `${process.env.APP_URL}/reactivate-account?token=${user.id}`
      });

      // Log activity
      await userService.logActivity(userId, {
        action: 'account_deactivated',
        metadata: { reason }
      });
    } catch (error) {
      console.error('Account deactivation error:', error);
      throw new Error('Failed to deactivate account');
    }
  }

  static async reactivateAccount(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'ACTIVE',
        deactivation_reason: null,
        deactivated_at: null,
        updated_at: new Date().toISOString()
      });

      // Get user details for email notification
      const user = await userService.getUserWithProfile(userId);

      // Send reactivation email
      await emailService.sendAccountReactivationEmail(user);

      // Log activity
      await userService.logActivity(userId, {
        action: 'account_reactivated'
      });
    } catch (error) {
      console.error('Account reactivation error:', error);
      throw new Error('Failed to reactivate account');
    }
  }

  static async deleteAccount(
    userId: string,
    reason?: string
  ): Promise<void> {
    try {
      // Get user details before deletion for email notification
      const user = await userService.getUserWithProfile(userId);

      // Schedule deletion by updating user status
      await this.scheduleDeletion(userId, reason);

      // Send deletion confirmation email
      await emailService.sendAccountDeletionEmail(user, {
        reason,
        undoLink: `${process.env.APP_URL}/undo-deletion?token=${user.id}`,
        deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Log activity
      await userService.logActivity(userId, {
        action: 'account_deletion_initiated',
        metadata: { reason }
      });
    } catch (error) {
      console.error('Account deletion error:', error);
      throw new Error('Failed to initiate account deletion');
    }
  }

  static async undoDeletion(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'ACTIVE',
        deletion_scheduled: null,
        deletion_reason: null,
        updated_at: new Date().toISOString()
      });

      // Get user details for email notification
      const user = await userService.getUserWithProfile(userId);

      // Send confirmation email
      await emailService.sendDeletionCancelledEmail(user);

      // Log activity
      await userService.logActivity(userId, {
        action: 'account_deletion_cancelled'
      });
    } catch (error) {
      console.error('Undo deletion error:', error);
      throw new Error('Failed to cancel account deletion');
    }
  }

  private static async scheduleDeletion(
    userId: string, 
    reason?: string
  ): Promise<void> {
    const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'PENDING_DELETION',
        deletion_scheduled: deletionDate.toISOString(),
        deletion_reason: reason || null,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Deletion scheduling error:', error);
      throw new Error('Failed to schedule account deletion');
    }
  }

  static async cleanupDeletedAccounts(): Promise<void> {
    try {
      const now = new Date().toISOString();
      const usersCollection = collection(db, 'users');
      const deletionQuery = query(
        usersCollection,
        where('status', '==', 'PENDING_DELETION'),
        where('deletion_scheduled', '<=', now)
      );
      
      const querySnapshot = await getDocs(deletionQuery);
      
      for (const userDoc of querySnapshot.docs) {
        await this.permanentlyDeleteAccount(userDoc.id);
      }
    } catch (error) {
      console.error('Account cleanup error:', error);
      throw new Error('Failed to cleanup deleted accounts');
    }
  }

  private static async permanentlyDeleteAccount(userId: string): Promise<void> {
    try {
      // Use a batch to delete the user and related data
      const batch = writeBatch(db);
      
      // Delete user document
      const userRef = doc(db, 'users', userId);
      batch.delete(userRef);
      
      // Delete user profile
      const userProfilesCollection = collection(db, 'user_profiles');
      const profileQuery = query(userProfilesCollection, where('user_id', '==', userId));
      const profileSnapshot = await getDocs(profileQuery);
      
      profileSnapshot.forEach(profileDoc => {
        batch.delete(profileDoc.ref);
      });
      
      // Delete donor profile if exists
      const donorProfilesCollection = collection(db, 'donor_profiles');
      const donorQuery = query(donorProfilesCollection, where('user_id', '==', userId));
      const donorSnapshot = await getDocs(donorQuery);
      
      donorSnapshot.forEach(donorDoc => {
        batch.delete(donorDoc.ref);
      });
      
      // Delete volunteer profile if exists
      const volunteerProfilesCollection = collection(db, 'volunteer_profiles');
      const volunteerQuery = query(volunteerProfilesCollection, where('user_id', '==', userId));
      const volunteerSnapshot = await getDocs(volunteerQuery);
      
      volunteerSnapshot.forEach(volunteerDoc => {
        batch.delete(volunteerDoc.ref);
      });
      
      // Commit the batch
      await batch.commit();
      
      // Cleanup storage (profile images, uploaded files, etc.)
      await this.cleanupUserStorage(userId);

      // Log final deletion
      await userService.logActivity('system', {
        action: 'account_permanently_deleted',
        entity_type: 'user',
        entity_id: userId
      });
    } catch (error) {
      console.error('Permanent deletion error:', error);
      throw new Error('Failed to permanently delete account');
    }
  }

  private static async cleanupUserStorage(userId: string): Promise<void> {
    try {
      // Delete profile images from avatars folder
      const avatarsRef = ref(storage, `avatars/profile-${userId}`);
      
      try {
        // List all files that match the pattern
        const avatarsList = await listAll(avatarsRef);
        
        // Delete each file
        const deletePromises = avatarsList.items.map(itemRef => 
          deleteObject(itemRef)
        );
        
        await Promise.all(deletePromises);
      } catch (error) {
        // Ignore errors if the folder doesn't exist
        console.log('No avatar files found or error listing files:', error);
      }
      
      // Delete user uploaded files from media folder
      const mediaRef = ref(storage, `media/user-${userId}`);
      
      try {
        const mediaList = await listAll(mediaRef);
        
        const deleteMediaPromises = mediaList.items.map(itemRef => 
          deleteObject(itemRef)
        );
        
        await Promise.all(deleteMediaPromises);
      } catch (error) {
        // Ignore errors if the folder doesn't exist
        console.log('No media files found or error listing files:', error);
      }
    } catch (error) {
      console.error('Storage cleanup error:', error);
      throw new Error('Failed to cleanup user storage');
    }
  }
} 