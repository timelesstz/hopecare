import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import DonorSidebar from '../components/donor/DonorSidebar';
import DonorHeader from '../components/donor/DonorHeader';
import DonorOverview from '../components/donor/DonorOverview';
import DonorProjects from '../components/donor/DonorProjects';
import DonorDonations from '../components/donor/DonorDonations';
import DonorSettings from '../components/donor/DonorSettings';
import { Donor } from '../types/donor';
import { CircularProgress, Alert, AlertTitle } from '@mui/material';

const DEFAULT_DONOR: Donor = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  preferredCauses: [],
  donationFrequency: 'one-time',
  isAnonymous: false,
  receiveUpdates: true,
  totalDonated: 0,
  donationCount: 0,
  createdAt: '',
  updatedAt: ''
};

const DonorDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    // Fetch donor data if authenticated
    if (user) {
      fetchDonorData();
    }
  }, [user, authLoading, navigate]);

  const fetchDonorData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user document
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }
      
      const userData = userDoc.data();
      
      // Verify user is a donor
      if (userData.role !== 'DONOR') {
        navigate('/unauthorized');
        return;
      }
      
      // Fetch donor profile
      const donorProfileRef = doc(db, 'donor_profiles', user.uid);
      const donorProfileDoc = await getDoc(donorProfileRef);
      
      if (!donorProfileDoc.exists()) {
        console.warn('Donor profile not found, creating default profile');
        // If no donor profile exists, use default values
        setDonor({
          ...DEFAULT_DONOR,
          id: user.uid,
          email: user.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
        });
      } else {
        // Combine user data with donor profile
        const donorProfileData = donorProfileDoc.data();
        setDonor({
          id: user.uid,
          email: user.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          ...donorProfileData,
        });
      }
    } catch (err) {
      console.error('Error fetching donor data:', err);
      setError('Failed to load donor data. Please refresh the page or contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <CircularProgress color="secondary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Alert severity="warning">
          <AlertTitle>Profile Not Found</AlertTitle>
          Your donor profile could not be loaded. Please contact support.
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DonorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <DonorHeader donor={donor} />
        <main className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && <DonorOverview donor={donor} />}
          {activeTab === 'projects' && <DonorProjects donor={donor} />}
          {activeTab === 'donations' && <DonorDonations donor={donor} />}
          {activeTab === 'settings' && <DonorSettings donor={donor} refreshData={fetchDonorData} />}
        </main>
      </div>
    </div>
  );
};

export default DonorDashboard;