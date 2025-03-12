import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { Volunteer } from '../types/volunteer';
import { User } from 'firebase/auth';

export interface VolunteerProfile {
  id: string;
  userId: string;
  skills: string[];
  languages: string[];
  availability: {
    weekdays: boolean;
    weekends: boolean;
    evenings: boolean;
  };
  experience?: string;
  hoursLogged: number;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  duration: number;
  skillsRequired: string[];
  status: string;
  image?: string;
  coordinator: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: string[];
  leader: string;
  projects: string[];
  createdAt: string;
}

// Custom error types for better error handling
export class VolunteerDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VolunteerDataError';
  }
}

export class FirestoreError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'FirestoreError';
  }
}

// Type guard to check if user has uid property
function isFirebaseUser(user: any): user is User {
  return user && typeof user === 'object' && 'uid' in user;
}

export function useVolunteerData() {
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);

  const fetchVolunteerData = async () => {
    if (!user || !isFirebaseUser(user)) {
      setError('Invalid user object');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, fetch the user document to get basic info
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        throw new VolunteerDataError('User document not found');
      }
      
      const userData = userDocSnap.data();
      
      // Fetch volunteer profile
      const volunteerProfileRef = doc(db, 'volunteer_profiles', user.uid);
      const volunteerProfileSnap = await getDoc(volunteerProfileRef);
      
      if (volunteerProfileSnap.exists()) {
        const profileData = volunteerProfileSnap.data();
        
        const volunteerProfileData: VolunteerProfile = {
          id: volunteerProfileSnap.id,
          userId: user.uid,
          skills: profileData.skills || [],
          languages: profileData.languages || [],
          availability: profileData.availability || {
            weekdays: true,
            weekends: false,
            evenings: false
          },
          experience: profileData.experience || '',
          hoursLogged: profileData.hoursLogged || 0,
          emergencyContact: profileData.emergencyContact,
          createdAt: profileData.createdAt || new Date().toISOString(),
          updatedAt: profileData.updatedAt || new Date().toISOString()
        };
        
        // Create volunteer object that matches the Volunteer interface
        const volunteerData: Volunteer = {
          id: user.uid,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: user.email || '',
          phone: userData.phone || '',
          skills: volunteerProfileData.skills,
          languages: volunteerProfileData.languages,
          availability: volunteerProfileData.availability,
          experience: volunteerProfileData.experience,
          hoursLogged: volunteerProfileData.hoursLogged,
          eventsAttended: profileData.eventsAttended || 0,
          createdAt: volunteerProfileData.createdAt,
          updatedAt: volunteerProfileData.updatedAt
        };
        
        setVolunteer(volunteerData);
      } else {
        // If no profile exists, create a default one
        const defaultAvailability = {
          weekdays: true,
          weekends: false,
          evenings: false
        };
        
        const defaultSkills = ['Communication', 'Organization'];
        const defaultLanguages = ['English'];
        
        const volunteerProfileData: VolunteerProfile = {
          id: user.uid,
          userId: user.uid,
          skills: defaultSkills,
          languages: defaultLanguages,
          availability: defaultAvailability,
          hoursLogged: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Create the profile in Firestore
        try {
          await setDoc(volunteerProfileRef, {
            userId: user.uid,
            skills: defaultSkills,
            languages: defaultLanguages,
            availability: defaultAvailability,
            hoursLogged: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } catch (err) {
          throw new FirestoreError('Failed to create default volunteer profile', err);
        }
        
        // Create volunteer object that matches the Volunteer interface
        const volunteerData: Volunteer = {
          id: user.uid,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: user.email || '',
          phone: userData.phone || '',
          skills: defaultSkills,
          languages: defaultLanguages,
          availability: defaultAvailability,
          hoursLogged: 0,
          eventsAttended: 0,
          createdAt: volunteerProfileData.createdAt,
          updatedAt: volunteerProfileData.updatedAt
        };
        
        setVolunteer(volunteerData);
      }

      // Fetch opportunities
      try {
        const opportunitiesQuery = query(collection(db, 'opportunities'));
        const opportunitiesSnap = await getDocs(opportunitiesQuery);
        const opportunitiesData: Opportunity[] = [];

        opportunitiesSnap.forEach((doc) => {
          const data = doc.data();
          opportunitiesData.push({
            id: doc.id,
            title: data.title || 'Untitled Opportunity',
            description: data.description || '',
            location: data.location || 'TBD',
            date: data.date || new Date().toISOString(),
            duration: data.duration || 2,
            skillsRequired: data.skillsRequired || [],
            status: data.status || 'open',
            image: data.image,
            coordinator: data.coordinator || 'Team Lead'
          });
        });

        // If no opportunities in Firestore, add some mock data
        if (opportunitiesData.length === 0 && process.env.NODE_ENV === 'development') {
          opportunitiesData.push(
            {
              id: '1',
              title: 'Community Garden Project',
              description: 'Help plant and maintain our community garden',
              location: 'Central Park',
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              duration: 3,
              skillsRequired: ['Gardening', 'Physical Labor'],
              status: 'open',
              coordinator: 'Jane Smith'
            },
            {
              id: '2',
              title: 'Food Bank Distribution',
              description: 'Assist with distributing food to those in need',
              location: 'Community Center',
              date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              duration: 4,
              skillsRequired: ['Organization', 'Communication'],
              status: 'open',
              coordinator: 'John Doe'
            },
            {
              id: '3',
              title: 'Literacy Program',
              description: 'Help adults improve their reading skills',
              location: 'Public Library',
              date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              duration: 2,
              skillsRequired: ['Teaching', 'Patience'],
              status: 'open',
              coordinator: 'Mary Johnson'
            }
          );
        }

        setOpportunities(opportunitiesData);
      } catch (err) {
        throw new FirestoreError('Failed to fetch opportunities', err);
      }

      // Fetch teams
      try {
        const teamsQuery = query(collection(db, 'teams'));
        const teamsSnap = await getDocs(teamsQuery);
        const teamsData: Team[] = [];

        teamsSnap.forEach((doc) => {
          const data = doc.data();
          teamsData.push({
            id: doc.id,
            name: data.name || 'Untitled Team',
            description: data.description || '',
            members: data.members || [],
            leader: data.leader || '',
            projects: data.projects || [],
            createdAt: data.createdAt || new Date().toISOString()
          });
        });

        // If no teams in Firestore, add some mock data
        if (teamsData.length === 0 && process.env.NODE_ENV === 'development') {
          teamsData.push(
            {
              id: '1',
              name: 'Education Team',
              description: 'Focused on educational initiatives and literacy programs',
              members: [user.uid],
              leader: 'Mary Johnson',
              projects: ['Literacy Program', 'After-School Tutoring'],
              createdAt: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Community Outreach',
              description: 'Working on community engagement and support programs',
              members: [],
              leader: 'John Doe',
              projects: ['Food Bank Distribution', 'Homeless Shelter Support'],
              createdAt: new Date().toISOString()
            }
          );
        }

        setTeams(teamsData);
      } catch (err) {
        throw new FirestoreError('Failed to fetch teams', err);
      }
    } catch (err) {
      let errorMessage = 'Failed to load volunteer data';
      
      if (err instanceof VolunteerDataError || err instanceof FirestoreError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Only use fallback data in development mode
      if (process.env.NODE_ENV === 'development') {
        // Set fallback data for opportunities and teams
        setOpportunities([
          {
            id: '1',
            title: 'Community Garden Project',
            description: 'Help plant and maintain our community garden',
            location: 'Central Park',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 3,
            skillsRequired: ['Gardening', 'Physical Labor'],
            status: 'open',
            coordinator: 'Jane Smith'
          }
        ]);
        
        setTeams([
          {
            id: '1',
            name: 'Education Team',
            description: 'Focused on educational initiatives and literacy programs',
            members: [user?.uid || 'unknown'],
            leader: 'Mary Johnson',
            projects: ['Literacy Program', 'After-School Tutoring'],
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchVolunteerData();
  };

  useEffect(() => {
    if (user && isFirebaseUser(user)) {
      fetchVolunteerData();
    }
  }, [user]);

  return { volunteer, opportunities, teams, loading, error, refreshData };
}