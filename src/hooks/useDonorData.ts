import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';

export interface DonorProfile {
  id: string;
  user_id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  donation_total: number;
  donation_count: number;
  donation_frequency?: string;
  preferred_causes?: string[];
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  amount: number;
  date: string;
  campaign: string;
  project_id?: string;
  status: string;
  payment_method?: string;
  is_anonymous?: boolean;
  message?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  target: number;
  raised: number;
  image?: string;
  status: string;
  start_date: string;
  end_date?: string;
  category: string;
}

export function useDonorData() {
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [suggestedProjects, setSuggestedProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchDonorData() {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching donor data for user:', user.id);
        
        // Fetch donor profile
        const donorProfileRef = doc(db, 'donor_profiles', user.id);
        const donorProfileSnap = await getDoc(donorProfileRef);

        console.log('Donor profile exists:', donorProfileSnap.exists());
        
        if (donorProfileSnap.exists()) {
          const profileData = donorProfileSnap.data();
          console.log('Donor profile data:', profileData);
          
          setDonorProfile({
            id: donorProfileSnap.id,
            user_id: user.id,
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ')[1] || '',
            email: user.email,
            ...profileData,
            created_at: profileData.created_at ? new Date(profileData.created_at.seconds * 1000).toISOString() : new Date().toISOString(),
            updated_at: profileData.updated_at ? new Date(profileData.updated_at.seconds * 1000).toISOString() : new Date().toISOString()
          } as DonorProfile);
        } else {
          console.log('Creating default donor profile for user:', user.id);
          // If no profile exists, create a default one
          setDonorProfile({
            id: user.id,
            user_id: user.id,
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ')[1] || '',
            email: user.email,
            donation_total: 0,
            donation_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        // Fetch donations
        try {
          const donationsQuery = query(
            collection(db, 'donations'),
            where('donor_id', '==', user.id)
          );
          const donationsSnap = await getDocs(donationsQuery);
          const donationsData: Donation[] = [];

          console.log('Donations found:', !donationsSnap.empty);

          donationsSnap.forEach((doc) => {
            const data = doc.data();
            donationsData.push({
              id: doc.id,
              donor_id: data.donor_id,
              amount: data.amount,
              date: data.date ? new Date(data.date.seconds * 1000).toISOString() : new Date().toISOString(),
              campaign: data.campaign || 'General Donation',
              project_id: data.project_id,
              status: data.status || 'completed',
              payment_method: data.payment_method,
              is_anonymous: data.is_anonymous,
              message: data.message
            });
          });

          setDonations(donationsData);
        } catch (err) {
          console.error('Error fetching donations:', err);
          // Don't fail the whole hook if donations fetch fails
          setDonations([]);
        }

        // Fetch suggested projects
        try {
          const projectsQuery = query(collection(db, 'projects'));
          const projectsSnap = await getDocs(projectsQuery);
          const projectsData: Project[] = [];

          console.log('Projects found:', !projectsSnap.empty);

          projectsSnap.forEach((doc) => {
            const data = doc.data();
            projectsData.push({
              id: doc.id,
              title: data.title,
              description: data.description,
              target: data.goal || 5000,
              raised: data.raised || 0,
              image: data.image || `https://source.unsplash.com/random/800x600/?${data.category || 'charity'}`,
              status: data.status || 'active',
              start_date: data.start_date ? new Date(data.start_date.seconds * 1000).toISOString() : new Date().toISOString(),
              end_date: data.end_date ? new Date(data.end_date.seconds * 1000).toISOString() : undefined,
              category: data.category || 'general'
            });
          });

          // If no projects in Firestore, add some mock data
          if (projectsData.length === 0) {
            console.log('No projects found, using mock data');
            projectsData.push(
              {
                id: '1',
                title: 'Education Support Program',
                description: 'Help provide educational resources to underprivileged children',
                target: 5000,
                raised: 3500,
                image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80',
                status: 'active',
                start_date: new Date().toISOString(),
                category: 'education'
              },
              {
                id: '2',
                title: 'Community Health Initiative',
                description: 'Support local health programs and medical resources',
                target: 10000,
                raised: 6000,
                image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80',
                status: 'active',
                start_date: new Date().toISOString(),
                category: 'health'
              }
            );
          }

          setSuggestedProjects(projectsData);
        } catch (err) {
          console.error('Error fetching projects:', err);
          // Don't fail the whole hook if projects fetch fails
          setSuggestedProjects([]);
        }
      } catch (err) {
        console.error('Error fetching donor data:', err);
        setError('Failed to load donor data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchDonorData();
  }, [user]);

  return { donorProfile, donations, suggestedProjects, loading, error };
} 