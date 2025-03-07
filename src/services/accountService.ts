// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
import { userService } from './userService';
import { emailService } from './emailService';

export class AccountService {
  static async deactivateAccount(
    userId: string,
    reason?: string
  ): Promise<void> {
    try {
      // Start a transaction
      const { error } = await supabase.rpc('deactivate_account', {
        user_id: userId,
        deactivation_reason: reason
      });

      if (error) throw error;

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
      const { error } = await supabase
        .from('users')
        .update({
          status: 'ACTIVE',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

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

      // Start account deletion process
      const { error } = await supabase.rpc('initiate_account_deletion', {
        user_id: userId,
        deletion_reason: reason
      });

      if (error) throw error;

      // Schedule permanent deletion after 30 days
      await this.scheduleDeletion(userId);

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
      const { error } = await supabase
        .from('users')
        .update({
          status: 'ACTIVE',
          deletion_scheduled: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

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

  private static async scheduleDeletion(userId: string): Promise<void> {
    const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    try {
      const { error } = await supabase
        .from('users')
        .update({
          status: 'PENDING_DELETION',
          deletion_scheduled: deletionDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Schedule cleanup job (implementation depends on your job scheduling system)
      // await scheduleCleanupJob(userId, deletionDate);
    } catch (error) {
      console.error('Deletion scheduling error:', error);
      throw new Error('Failed to schedule account deletion');
    }
  }

  static async cleanupDeletedAccounts(): Promise<void> {
    try {
      const { data: accounts, error } = await supabase
        .from('users')
        .select('id')
        .eq('status', 'PENDING_DELETION')
        .lt('deletion_scheduled', new Date().toISOString());

      if (error) throw error;

      for (const account of accounts) {
        await this.permanentlyDeleteAccount(account.id);
      }
    } catch (error) {
      console.error('Account cleanup error:', error);
      throw new Error('Failed to cleanup deleted accounts');
    }
  }

  private static async permanentlyDeleteAccount(userId: string): Promise<void> {
    try {
      // Delete all related data (implement cascading deletes in database)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Cleanup storage (profile images, uploaded files, etc.)
      await this.cleanupUserStorage(userId);

      // Log final deletion
      await userService.logActivity(userId, {
        action: 'account_permanently_deleted'
      });
    } catch (error) {
      console.error('Permanent deletion error:', error);
      throw new Error('Failed to permanently delete account');
    }
  }

  private static async cleanupUserStorage(userId: string): Promise<void> {
    try {
      // Delete profile images
      const { error: avatarError } = await supabase.storage
        .from('avatars')
        .remove([`profile-${userId}-*`]);

      if (avatarError) console.error('Avatar cleanup error:', avatarError);

      // Delete other user files
      // Implement cleanup for other storage buckets as needed
    } catch (error) {
      console.error('Storage cleanup error:', error);
      throw new Error('Failed to cleanup user storage');
    }
  }
} 