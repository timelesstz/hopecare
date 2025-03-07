import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Heart,
  Clock,
  AlertCircle,
  FileText,
  Shield,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, DocumentData, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { toast } from 'react-hot-toast';

// Chart components (you can replace with your preferred chart library)
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeLabel, 
  color,
  delay = 0
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  // Format the value if it's a number
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString() 
    : value;
  
  // Map color to Tailwind CSS classes
  const getColorClasses = (colorName: string) => {
    const colorMap: Record<string, { bg: string, text: string }> = {
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-600' }
    };
    
    return colorMap[colorName] || colorMap.gray;
  };
  
  const colorClasses = getColorClasses(color);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{formattedValue}</p>
          
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span
                className={`flex items-center text-xs font-medium ${
                  isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight size={14} className="mr-1" />
                ) : isNegative ? (
                  <ArrowDownRight size={14} className="mr-1" />
                ) : null}
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">{changeLabel}</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${colorClasses.bg}`}>
          <div className={`${colorClasses.text}`}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
};

interface RecentActivityProps {
  activities: {
    id: string;
    type: string;
    title: string;
    time: string;
    status?: 'completed' | 'pending' | 'failed';
  }[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {activities.map((activity) => (
          <div key={activity.id} className="px-6 py-4 flex items-center">
            <div className="mr-4">
              {activity.type === 'donation' && (
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <DollarSign size={16} />
                </div>
              )}
              {activity.type === 'volunteer' && (
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Heart size={16} />
                </div>
              )}
              {activity.type === 'event' && (
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <Calendar size={16} />
                </div>
              )}
              {activity.type === 'alert' && (
                <div className="p-2 rounded-full bg-red-100 text-red-600">
                  <AlertCircle size={16} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Clock size={12} className="mr-1" />
                {activity.time}
              </p>
            </div>
            {activity.status && (
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : activity.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="px-6 py-3 border-t border-gray-100">
        <a href="/admin/activity" className="text-sm font-medium text-blue-600 hover:text-blue-800">
          View all activity
        </a>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalDonors: 0,
    totalVolunteers: 0,
    totalEvents: 0,
    donationChange: 0,
    donorChange: 0,
    volunteerChange: 0,
    eventChange: 0,
    recentDonations: [],
    recentVolunteers: [],
    donationsByMonth: [],
    usersByRole: []
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [donationData, setDonationData] = useState<{ name: string; amount: number }[]>([]);
  const [volunteerData, setVolunteerData] = useState<{ name: string; value: number }[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [missingOptionalCollections, setMissingOptionalCollections] = useState<string[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Auto-retry on network errors
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout | null = null;
    
    if (error && error.includes('network') && retryCount < maxRetries) {
      console.log(`Retrying dashboard data fetch (${retryCount + 1}/${maxRetries})...`);
      retryTimeout = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        fetchDashboardData();
      }, 3000); // Retry after 3 seconds
    }
    
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [error, retryCount]);
  
  // Helper function to check if a collection exists
  const checkCollectionExists = async (collectionName: string): Promise<boolean> => {
    try {
      console.log(`Checking if collection ${collectionName} exists...`);
      const collectionRef = collection(db, collectionName);
      
      try {
        const snapshot = await getDocs(query(collectionRef, limit(1)));
        
        // A collection exists if we can successfully query it, even if it's empty
        console.log(`Collection ${collectionName} exists: ${!snapshot.empty ? 'Yes (has documents)' : 'Yes (empty)'}`);
        return true;
      } catch (queryError) {
        // If we get a specific Firestore error about the collection not existing
        if (queryError instanceof Error && 
            (queryError.message.includes('collection not found') || 
             queryError.message.includes('Missing or insufficient permissions'))) {
          console.log(`Collection ${collectionName} does not exist (from query error)`);
          return false;
        }
        
        // For other query errors, log and re-throw
        console.error(`Error querying collection ${collectionName}:`, queryError);
        throw queryError;
      }
    } catch (error) {
      // For any other errors in the outer try block
      console.error(`Error checking if collection ${collectionName} exists:`, error);
      
      // Provide more specific error information
      if (error instanceof Error) {
        console.error(`Error type: ${error.name}, Message: ${error.message}`);
        if (error.stack) {
          console.error(`Stack trace: ${error.stack}`);
        }
      }
      
      return false;
    }
  };

  // Helper function to create a collection if it doesn't exist
  const createCollection = async (collectionName: string) => {
    try {
      console.log(`Creating collection: ${collectionName}`);
      
      // First check if the collection already exists
      const exists = await checkCollectionExists(collectionName);
      if (exists) {
        console.log(`Collection ${collectionName} already exists, skipping creation`);
        return true;
      }
      
      // To create a collection in Firestore, we need to add at least one document
      const collectionRef = collection(db, collectionName);
      let docRef;
      
      // Add an appropriate initial document based on the collection type
      if (collectionName === 'events') {
        const sampleEvent = {
          title: 'Welcome to HopeCare Events',
          description: 'This is a sample event to help you get started with the events feature. You can edit or delete this event, or create new ones from the Events page.',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
          location: 'HopeCare Community Center',
          organizer: 'HopeCare Team',
          status: 'upcoming',
          capacity: 50,
          registered: 0,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          image_url: 'https://source.unsplash.com/random/800x600/?charity',
          tags: ['sample', 'welcome', 'community']
        };
        
        try {
          docRef = await addDoc(collectionRef, sampleEvent);
          console.log(`Created ${collectionName} collection with a sample event, doc ID: ${docRef.id}`);
          
          // Add a second sample event
          const secondEvent = {
            title: 'Volunteer Orientation',
            description: 'Join us for an orientation session for new volunteers. Learn about our mission, programs, and how you can make a difference.',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Two weeks from now
            location: 'HopeCare Training Room',
            organizer: 'Volunteer Coordinator',
            status: 'upcoming',
            capacity: 30,
            registered: 5,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            image_url: 'https://source.unsplash.com/random/800x600/?volunteer',
            tags: ['volunteer', 'orientation', 'training']
          };
          
          await addDoc(collectionRef, secondEvent);
          console.log(`Added second sample event to ${collectionName} collection`);
        } catch (addError) {
          console.error(`Error adding sample event document:`, addError);
          throw new Error(`Failed to add sample event document: ${addError instanceof Error ? addError.message : 'Unknown error'}`);
        }
      } else if (collectionName === 'settings') {
        const systemSettings = {
          id: 'system_settings',
          siteName: 'HopeCare',
          siteDescription: 'Empowering communities through hope and care',
          contactEmail: 'contact@hopecare.org',
          supportEmail: 'support@hopecare.org',
          logoUrl: '/logo.png',
          primaryColor: '#e11d48',
          secondaryColor: '#4f46e5',
          enableDonations: true,
          enableVolunteers: true,
          enableEvents: true,
          enableBlog: true,
          enableNotifications: true,
          currencySymbol: '$',
          defaultLanguage: 'en',
          termsUrl: '/terms',
          privacyUrl: '/privacy',
          lastUpdated: serverTimestamp(),
          updatedBy: user?.email || 'system'
        };
        
        try {
          docRef = await addDoc(collectionRef, systemSettings);
          console.log(`Created ${collectionName} collection with system settings, doc ID: ${docRef.id}`);
        } catch (addError) {
          console.error(`Error adding settings document:`, addError);
          throw new Error(`Failed to add settings document: ${addError instanceof Error ? addError.message : 'Unknown error'}`);
        }
      } else {
        // Add a placeholder document for other collections
        const placeholderDoc = {
          _placeholder: true,
          _createdAt: serverTimestamp(),
          _description: `This is a placeholder document to create the ${collectionName} collection.`
        };
        
        try {
          docRef = await addDoc(collectionRef, placeholderDoc);
          console.log(`Created ${collectionName} collection with a placeholder document, doc ID: ${docRef.id}`);
        } catch (addError) {
          console.error(`Error adding placeholder document:`, addError);
          throw new Error(`Failed to add placeholder document: ${addError instanceof Error ? addError.message : 'Unknown error'}`);
        }
      }
      
      // Verify the collection was created
      const verifyExists = await checkCollectionExists(collectionName);
      if (!verifyExists) {
        console.error(`Failed to verify creation of collection ${collectionName}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error creating ${collectionName} collection:`, error);
      
      // Provide more detailed error information
      if (error instanceof Error) {
        console.error(`Error type: ${error.name}, Message: ${error.message}`);
        if (error.stack) {
          console.error(`Stack trace: ${error.stack}`);
        }
      }
      
      return false;
    }
  };

  // Function to handle creating missing collections
  const handleCreateMissingCollections = async () => {
    setLoading(true);
    
    try {
      // Create each missing collection one by one for better error handling
      const createdCollections = [];
      const failedCollections = [];
      
      for (const collectionName of missingOptionalCollections) {
        try {
          console.log(`Attempting to create collection: ${collectionName}`);
          const created = await createCollection(collectionName);
          
          if (created) {
            createdCollections.push(collectionName);
            console.log(`Successfully created collection: ${collectionName}`);
          } else {
            failedCollections.push(collectionName);
            console.error(`Failed to create collection: ${collectionName}`);
          }
        } catch (collectionError) {
          console.error(`Error creating collection ${collectionName}:`, collectionError);
          failedCollections.push(collectionName);
        }
      }
      
      if (createdCollections.length > 0) {
        console.log(`Successfully created collections: ${createdCollections.join(', ')}`);
        toast.success(`Successfully created collections: ${createdCollections.join(', ')}`);
        
        // Clear the missing collections list immediately for UI feedback
        setMissingOptionalCollections(prev => 
          prev.filter(name => !createdCollections.includes(name))
        );
        
        // Refresh the dashboard data after a short delay
        setTimeout(() => {
          fetchDashboardData();
        }, 1000);
      }
      
      if (failedCollections.length > 0) {
        console.error(`Failed to create collections: ${failedCollections.join(', ')}`);
        setError(`Failed to create some collections: ${failedCollections.join(', ')}`);
        toast.error(`Failed to create some collections: ${failedCollections.join(', ')}`);
      }
    } catch (error) {
      console.error('Error creating collections:', error);
      setError('Failed to create missing collections');
      toast.error('Failed to create missing collections');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data...');
      
      // Check if required collections exist
      const requiredCollections = ['users', 'donations'];
      const optionalCollections = ['events', 'settings'];
      
      console.log('Checking required collections...');
      // Check required collections
      const requiredChecks = await Promise.all(
        requiredCollections.map(async (collectionName) => ({
          name: collectionName,
          exists: await checkCollectionExists(collectionName)
        }))
      );
      
      const missingRequired = requiredChecks.filter(check => !check.exists);
      if (missingRequired.length > 0) {
        const missingNames = missingRequired.map(c => c.name).join(', ');
        console.error(`Missing required collections: ${missingNames}`);
        throw new Error(`Missing required collections: ${missingNames}`);
      }
      
      console.log('Checking optional collections...');
      // Check optional collections
      const optionalChecks = await Promise.all(
        optionalCollections.map(async (collectionName) => ({
          name: collectionName,
          exists: await checkCollectionExists(collectionName)
        }))
      );
      
      // Log missing optional collections but don't throw an error
      const missingOptional = optionalChecks.filter(check => !check.exists);
      if (missingOptional.length > 0) {
        const missingNames = missingOptional.map(c => c.name).join(', ');
        console.warn(`Missing optional collections: ${missingNames}`);
        setMissingOptionalCollections(missingOptional.map(c => c.name));
      } else {
        setMissingOptionalCollections([]);
      }
      
      let totalUsers = 0;
      let adminCount = 0;
      let donorCount = 0;
      let volunteerCount = 0;
      let totalDonations = 0;
      let totalDonationAmount = 0;
      let recentDonations: any[] = [];
      let totalVolunteers = 0;
      let recentVolunteers: any[] = [];
      let totalEvents = 0;
      let donationsByMonth: { name: string; amount: number }[] = [];
      let usersByRole: { name: string; value: number }[] = [];
      
      // Fetch total users
      try {
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        totalUsers = usersSnapshot.size;
        
        // Fetch users by role for pie chart
        adminCount = usersSnapshot.docs.filter(doc => {
          const data = doc.data();
          return data && data.role === 'ADMIN';
        }).length;
        
        donorCount = usersSnapshot.docs.filter(doc => {
          const data = doc.data();
          return data && data.role === 'DONOR';
        }).length;
        
        volunteerCount = usersSnapshot.docs.filter(doc => {
          const data = doc.data();
          return data && data.role === 'VOLUNTEER';
        }).length;
        
        usersByRole = [
          { name: 'Admins', value: adminCount },
          { name: 'Donors', value: donorCount },
          { name: 'Volunteers', value: volunteerCount }
        ];
      } catch (userError) {
        console.error('Error fetching user data:', userError);
        throw new Error(`Failed to fetch user data: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
      }
      
      // Fetch donations data
      try {
        const donationsQuery = query(collection(db, 'donations'));
        const donationsSnapshot = await getDocs(donationsQuery);
        totalDonations = donationsSnapshot.size;
        
        // Calculate total donation amount
        donationsSnapshot.forEach(doc => {
          try {
            const data = doc.data();
            if (data && data.amount) {
              const amount = Number(data.amount);
              if (!isNaN(amount)) {
                totalDonationAmount += amount;
              }
            }
          } catch (err) {
            console.warn(`Error processing donation amount for doc ${doc.id}:`, err);
          }
        });
        
        // Generate donations by month data
        donationsByMonth = generateDonationsByMonth(donationsSnapshot.docs);
        
        // Fetch recent donations
        try {
          const recentDonationsQuery = query(
            collection(db, 'donations'),
            orderBy('created_at', 'desc'),
            limit(5)
          );
          const recentDonationsSnapshot = await getDocs(recentDonationsQuery);
          recentDonations = recentDonationsSnapshot.docs.map(doc => {
            try {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                created_at: formatTimestamp(data.created_at),
                amount: data.amount ? `$${Number(data.amount).toLocaleString()}` : 'N/A',
                donor_name: data.donor_name || 'Anonymous',
                status: data.status || 'completed'
              };
            } catch (err) {
              console.warn(`Error processing recent donation ${doc.id}:`, err);
              return {
                id: doc.id,
                created_at: 'Invalid date',
                amount: 'N/A',
                donor_name: 'Error',
                status: 'error'
              };
            }
          });
        } catch (recentDonationsError) {
          console.error('Error fetching recent donations:', recentDonationsError);
          // Don't throw, just set empty array
          recentDonations = [];
        }
      } catch (donationError) {
        console.error('Error fetching donation data:', donationError);
        throw new Error(`Failed to fetch donation data: ${donationError instanceof Error ? donationError.message : 'Unknown error'}`);
      }
      
      // Fetch volunteer data
      try {
        // Fetch recent volunteers
        try {
          const recentVolunteersQuery = query(
            collection(db, 'users'),
            where('role', '==', 'VOLUNTEER'),
            orderBy('created_at', 'desc'),
            limit(5)
          );
          const recentVolunteersSnapshot = await getDocs(recentVolunteersQuery);
          recentVolunteers = recentVolunteersSnapshot.docs.map(doc => {
            try {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                created_at: formatTimestamp(data.created_at),
                name: data.name || data.displayName || 'Unknown Volunteer',
                email: data.email || 'No email',
                status: data.status || 'ACTIVE'
              };
            } catch (err) {
              console.warn(`Error processing recent volunteer ${doc.id}:`, err);
              return {
                id: doc.id,
                created_at: 'Invalid date',
                name: 'Error',
                email: 'Error',
                status: 'error'
              };
            }
          });
        } catch (recentVolunteersError) {
          console.error('Error fetching recent volunteers:', recentVolunteersError);
          // Don't throw, just set empty array
          recentVolunteers = [];
        }
      } catch (volunteerError) {
        console.error('Error fetching volunteer data:', volunteerError);
        // Don't throw an error for volunteer data, just log it
        console.warn(`Failed to fetch volunteer data: ${volunteerError instanceof Error ? volunteerError.message : 'Unknown error'}`);
      }
      
      // Fetch events data
      try {
        // Check if events collection exists before querying
        const eventsExists = optionalChecks.find(check => check.name === 'events')?.exists || false;
        
        if (eventsExists) {
          try {
            const eventsQuery = query(collection(db, 'events'));
            const eventsSnapshot = await getDocs(eventsQuery);
            totalEvents = eventsSnapshot.size;
          } catch (eventsQueryError) {
            console.error('Error querying events collection:', eventsQueryError);
            totalEvents = 0;
          }
        } else {
          console.log('Events collection does not exist, skipping events data fetch');
          totalEvents = 0;
        }
      } catch (eventError) {
        console.error('Error fetching event data:', eventError);
        // Don't throw an error for optional collections
        console.warn(`Failed to fetch event data: ${eventError instanceof Error ? eventError.message : 'Unknown error'}`);
        totalEvents = 0;
      }
      
      // Calculate donation change percentage (comparing current month to previous month)
      let donationChange = 0;
      if (donationsByMonth.length >= 2) {
        const currentMonth = donationsByMonth[donationsByMonth.length - 1].amount;
        const previousMonth = donationsByMonth[donationsByMonth.length - 2].amount;
        if (previousMonth > 0) {
          donationChange = Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
        }
      }
      
      // Calculate donor change percentage (placeholder - you can implement actual logic)
      const donorChange = 5.2;
      
      // Calculate volunteer change percentage (placeholder - you can implement actual logic)
      const volunteerChange = 3.8;
      
      // Calculate event change percentage (placeholder - you can implement actual logic)
      const eventChange = -2.1;
      
      setStats({
        totalUsers,
        totalDonations: totalDonationAmount,
        totalDonors: donorCount,
        totalVolunteers,
        totalEvents,
        donationChange,
        donorChange,
        volunteerChange,
        eventChange,
        recentDonations,
        recentVolunteers,
        donationsByMonth,
        usersByRole
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // Provide more specific error messages based on the error type
      if (err instanceof Error) {
        // Check for Firebase-specific errors
        if (err.message.includes('permission-denied')) {
          setError('You do not have permission to access this data. Please check your account permissions.');
        } else if (err.message.includes('not-found')) {
          setError('Some required data collections were not found. Please ensure your database is properly set up.');
        } else if (err.message.includes('network')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          // Use the actual error message for more specific information
          setError(`Error: ${err.message}`);
        }
      } else {
        setError('Failed to load dashboard data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const generateDonationsByMonth = (donations: DocumentData[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const monthlyData: { name: string; amount: number }[] = [];
    
    // Generate data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentDate.getMonth() - i + 12) % 12;
      const year = currentDate.getFullYear() - (currentDate.getMonth() < i ? 1 : 0);
      const monthName = `${months[monthIndex]} ${year}`;
      
      // Calculate total donations for this month
      let monthlyTotal = 0;
      donations.forEach(donation => {
        try {
          const donationData = donation.data();
          if (!donationData || !donationData.created_at) {
            console.warn('Donation missing created_at field:', donation.id);
            return; // Skip this donation
          }
          
          let donationDate: Date | null = null;
          
          // Handle different timestamp formats
          if (donationData.created_at instanceof Timestamp) {
            donationDate = donationData.created_at.toDate();
          } else if (donationData.created_at.toDate && typeof donationData.created_at.toDate === 'function') {
            donationDate = donationData.created_at.toDate();
          } else if (donationData.created_at.seconds !== undefined) {
            const seconds = donationData.created_at.seconds;
            const nanoseconds = donationData.created_at.nanoseconds || 0;
            donationDate = new Date(seconds * 1000 + nanoseconds / 1000000);
          } else if (typeof donationData.created_at === 'string') {
            donationDate = new Date(donationData.created_at);
          }
          
          if (donationDate && !isNaN(donationDate.getTime()) && 
              donationDate.getMonth() === monthIndex && 
              donationDate.getFullYear() === year) {
            const amount = Number(donationData.amount) || 0;
            if (!isNaN(amount)) {
              monthlyTotal += amount;
            }
          }
        } catch (error) {
          console.error('Error processing donation for monthly data:', error);
          // Continue with next donation
        }
      });
      
      monthlyData.push({ name: monthName, amount: monthlyTotal });
    }
    
    return monthlyData;
  };
  
  const formatTimestamp = (timestamp: Timestamp | Date | any | null | undefined) => {
    if (!timestamp) return 'N/A';
    
    try {
      let date: Date;
      
      if (timestamp instanceof Timestamp) {
        // Firebase Timestamp object
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        // JavaScript Date object
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        // ISO string or other string format
        date = new Date(timestamp);
      } else if (typeof timestamp === 'number') {
        // Unix timestamp (milliseconds)
        date = new Date(timestamp);
      } else if (typeof timestamp === 'object') {
        // Handle Firestore timestamp-like objects with seconds and nanoseconds
        if (timestamp.seconds !== undefined) {
          const seconds = timestamp.seconds;
          const nanoseconds = timestamp.nanoseconds || 0;
          date = new Date(seconds * 1000 + nanoseconds / 1000000);
        } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          // Handle objects with toDate method
          date = timestamp.toDate();
        } else {
          console.warn('Unknown timestamp format (object):', JSON.stringify(timestamp));
          return 'Invalid date';
        }
      } else {
        console.warn('Unknown timestamp format (type):', typeof timestamp);
        return 'Invalid date';
      }
      
      // Check if date is valid
      if (!date || isNaN(date.getTime())) {
        console.warn('Invalid date object created from:', JSON.stringify(timestamp));
        return 'Invalid date';
      }
      
      try {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (formatError) {
        console.error('Error formatting date with toLocaleDateString:', formatError);
        // Fallback format
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error, typeof timestamp, timestamp ? JSON.stringify(timestamp) : 'null');
      return 'Invalid date';
    }
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Function to create a sample event
  const createSampleEvent = async () => {
    try {
      setLoading(true);
      
      // Check if events collection exists, create it if it doesn't
      if (missingOptionalCollections.includes('events')) {
        await createCollection('events');
      }
      
      // Create a sample event
      const eventsRef = collection(db, 'events');
      const sampleEvent = {
        title: 'Sample Community Outreach',
        description: 'A sample event to demonstrate the events feature.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
        location: 'Community Center',
        organizer: 'HopeCare Admin',
        status: 'upcoming',
        capacity: 50,
        registered: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        image_url: 'https://source.unsplash.com/random/800x600/?community',
        tags: ['community', 'outreach', 'sample']
      };
      
      await addDoc(eventsRef, sampleEvent);
      
      // Refresh dashboard data
      await fetchDashboardData();
      
      // Show success message
      toast.success('Sample event created successfully!');
    } catch (error) {
      console.error('Error creating sample event:', error);
      setError('Failed to create sample event');
      toast.error('Failed to create sample event');
    } finally {
      setLoading(false);
    }
  };

  // Function to create a sample donation
  const createSampleDonation = async () => {
    try {
      setLoading(true);
      
      // Create a sample donation
      const donationsRef = collection(db, 'donations');
      const sampleDonation = {
        amount: Math.floor(Math.random() * 900) + 100, // Random amount between 100 and 1000
        currency: 'USD',
        donor_name: 'Sample Donor',
        donor_email: 'sample.donor@example.com',
        donor_id: user?.id || 'anonymous',
        payment_method: 'card',
        status: 'completed',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        project: 'General Fund',
        is_anonymous: false,
        is_recurring: false,
        message: 'This is a sample donation for testing purposes.'
      };
      
      await addDoc(donationsRef, sampleDonation);
      
      // Refresh dashboard data
      await fetchDashboardData();
      
      // Show success message
      toast.success('Sample donation created successfully!');
    } catch (error) {
      console.error('Error creating sample donation:', error);
      setError('Failed to create sample donation');
      toast.error('Failed to create sample donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name || 'HopeCare Admin'}! Here's what's happening today.
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData()}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700 mr-2"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p className="font-medium">Error loading dashboard data</p>
          </div>
          <p className="text-sm mb-3">{error}</p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-red-600">
              {retryCount > 0 && retryCount < maxRetries && (
                <span>Retrying automatically ({retryCount}/{maxRetries})...</span>
              )}
            </div>
            <button 
              onClick={() => {
                setRetryCount(prev => prev + 1);
                fetchDashboardData();
              }} 
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Show warning for missing optional collections */}
          {missingOptionalCollections.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p className="font-medium">Some features may be limited</p>
              </div>
              <p className="text-sm mt-2 mb-3">
                The following collections are missing from your database: 
                <strong> {missingOptionalCollections.join(', ')}</strong>. 
                {missingOptionalCollections.includes('events') && (
                  <span> Without the events collection, you won't be able to manage events.</span>
                )}
                {missingOptionalCollections.includes('settings') && (
                  <span> Without the settings collection, you won't be able to configure system settings.</span>
                )}
                <br />
                Click the button below to create these collections with sample data.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={handleCreateMissingCollections}
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Missing Collections'}
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Donations"
              value={`$${stats.totalDonations}`}
              icon={<DollarSign size={20} />}
              change={stats.donationChange}
              changeLabel="vs last month"
              color="green"
              delay={0}
            />
            <StatCard
              title="Total Donors"
              value={stats.totalDonors}
              icon={<Users size={20} />}
              change={stats.donorChange}
              changeLabel="vs last month"
              color="blue"
              delay={1}
            />
            <StatCard
              title="Total Volunteers"
              value={stats.totalVolunteers}
              icon={<Heart size={20} />}
              change={stats.volunteerChange}
              changeLabel="vs last month"
              color="rose"
              delay={2}
            />
            <StatCard
              title="Upcoming Events"
              value={stats.totalEvents}
              icon={<Calendar size={20} />}
              change={stats.eventChange}
              changeLabel="vs last month"
              color="purple"
              delay={3}
            />
          </div>

          {/* Check if we have any data to display */}
          {stats.totalUsers === 0 && stats.totalDonations === 0 && stats.totalEvents === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p className="font-medium">No data available</p>
              </div>
              <p className="text-sm mt-2 mb-3">
                It looks like there's no data in your database yet. You may need to add some users, donations, or events to see data on this dashboard.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={createSampleDonation}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Sample Donation'}
                </button>
                <button
                  onClick={createSampleEvent}
                  disabled={loading || missingOptionalCollections.includes('events')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Sample Event'}
                </button>
              </div>
            </div>
          ) : stats.totalEvents === 0 && !missingOptionalCollections.includes('events') ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <p className="font-medium">No events found</p>
              </div>
              <p className="text-sm mt-2 mb-3">
                The events collection exists but doesn't have any events yet. Would you like to create a sample event?
              </p>
              <div className="flex justify-end">
                <button
                  onClick={createSampleEvent}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Sample Event'}
                </button>
              </div>
            </div>
          ) : stats.totalDonations === 0 ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                <p className="font-medium">No donations found</p>
              </div>
              <p className="text-sm mt-2 mb-3">
                The donations collection exists but doesn't have any donations yet. Would you like to create a sample donation?
              </p>
              <div className="flex justify-end">
                <button
                  onClick={createSampleDonation}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Sample Donation'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Charts and Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Donation Chart */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Donation Overview</h3>
                  <div className="h-80">
                    {stats.donationsByMonth.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.donationsByMonth}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                          <Bar dataKey="amount" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No donation data available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Distribution */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h3>
                  <div className="h-80">
                    {stats.usersByRole && stats.usersByRole.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.usersByRole}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {stats.usersByRole.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Users']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No user data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Donations */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900">Recent Donations</h3>
                  </div>
                  {stats.recentDonations && stats.recentDonations.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {stats.recentDonations.map((donation: any) => (
                        <div key={donation.id} className="px-6 py-4 flex items-center">
                          <div className="mr-4">
                            <div className="p-2 rounded-full bg-green-100 text-green-600">
                              <DollarSign size={16} />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {donation.amount} from {donation.donor_name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                              <Clock size={12} className="mr-1" />
                              {donation.created_at || 'Unknown date'}
                            </p>
                          </div>
                          <div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                              donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {donation.status || 'unknown'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No recent donations
                    </div>
                  )}
                </div>
                
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 lg:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Link
                      to="/admin/events"
                      className="block w-full py-2 px-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2" />
                        <span>Manage Events</span>
                      </div>
                    </Link>
                    <Link
                      to="/admin/users/volunteers"
                      className="block w-full py-2 px-4 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <Heart size={16} className="mr-2" />
                        <span>Manage Volunteers</span>
                      </div>
                    </Link>
                    <Link
                      to="/admin/users/donors"
                      className="block w-full py-2 px-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <DollarSign size={16} className="mr-2" />
                        <span>Manage Donors</span>
                      </div>
                    </Link>
                    <Link
                      to="/admin/users/admins"
                      className="block w-full py-2 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <Shield size={16} className="mr-2" />
                        <span>Manage Admins</span>
                      </div>
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="block w-full py-2 px-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <Settings size={16} className="mr-2" />
                        <span>System Settings</span>
                      </div>
                    </Link>
                    <Link
                      to="/admin/content"
                      className="block w-full py-2 px-4 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <FileText size={16} className="mr-2" />
                        <span>Manage Content</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
