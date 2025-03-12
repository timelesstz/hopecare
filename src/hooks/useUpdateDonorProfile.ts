import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface UpdateDonorProfileProps {
  refreshData?: () => Promise<void>;
}

interface DonorProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  preferredCauses?: string[];
  donationFrequency?: string;
  isAnonymous?: boolean;
  receiveUpdates?: boolean;
  [key: string]: any; // Allow for additional fields
}

export const useUpdateDonorProfile = ({ refreshData }: UpdateDonorProfileProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateProfile = async (donorId: string, profileData: DonorProfileData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Update user document
      const userDocRef = doc(db, 'users', donorId);
      await updateDoc(userDocRef, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || null,
      });

      // Update donor profile document
      const donorProfileDocRef = doc(db, 'donor_profiles', donorId);
      await updateDoc(donorProfileDocRef, {
        address: profileData.address || null,
        preferredCauses: profileData.preferredCauses || [],
        donationFrequency: profileData.donationFrequency || 'one-time',
        isAnonymous: profileData.isAnonymous === true,
        receiveUpdates: profileData.receiveUpdates !== false,
        updatedAt: new Date().toISOString()
      });

      setSuccess(true);
      
      // Refresh data if callback provided
      if (refreshData) {
        await refreshData();
      }
    } catch (err) {
      console.error('Error updating donor profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
      
      // Auto-reset success state after 3 seconds
      if (success) {
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    }
  };

  return { updateProfile, loading, error, success, setError };
}; 