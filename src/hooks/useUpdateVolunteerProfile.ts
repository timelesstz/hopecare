import { useState } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Volunteer } from '../types/volunteer';

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  availability: {
    weekdays: boolean;
    weekends: boolean;
    evenings: boolean;
  };
  skills?: string[];
  languages?: string[];
}

interface UseUpdateVolunteerProfileProps {
  refreshData?: () => Promise<void>;
}

export function useUpdateVolunteerProfile(props?: UseUpdateVolunteerProfileProps) {
  const { refreshData } = props || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateProfile = async (volunteerId: string, data: UpdateProfileData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log('Updating volunteer profile:', volunteerId, data);
      
      // Ensure availability fields are valid booleans
      const availability = {
        weekdays: data.availability?.weekdays === true,
        weekends: data.availability?.weekends === true,
        evenings: data.availability?.evenings === true
      };
      
      console.log('Sanitized availability:', availability);
      
      // Check if the document exists first
      const volunteerRef = doc(db, 'volunteer_profiles', volunteerId);
      const docSnap = await getDoc(volunteerRef);
      
      // Update user document with basic info
      const userDocRef = doc(db, 'users', volunteerId);
      await updateDoc(userDocRef, {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
      });
      
      if (docSnap.exists()) {
        console.log('Document exists, updating...');
        // Update existing document
        await updateDoc(volunteerRef, {
          availability: availability,
          skills: data.skills || [],
          languages: data.languages || [],
          updatedAt: new Date().toISOString()
        });
      } else {
        console.log('Document does not exist, creating...');
        // Create new document
        await setDoc(volunteerRef, {
          availability: availability,
          skills: data.skills || [],
          languages: data.languages || ['English'],
          hoursLogged: 0,
          experience: '',
          userId: volunteerId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      console.log('Volunteer profile updated successfully');
      
      // Refresh data if provided
      if (refreshData) {
        console.log('Refreshing data after profile update');
        await refreshData();
      }
      
      setSuccess(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
      return true;
    } catch (err: any) {
      console.error('Error updating volunteer profile:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      
      // Provide a more specific error message based on the error
      if (err.code === 'permission-denied') {
        setError('You do not have permission to update this profile.');
      } else if (err.code === 'not-found') {
        setError('Profile not found. Please refresh the page and try again.');
      } else {
        setError(`Failed to update profile: ${err.message || 'Unknown error'}`);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error, success, setError };
} 