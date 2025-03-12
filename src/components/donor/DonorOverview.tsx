import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { Donor } from '../../types/donor';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { CircularProgress, Card, CardContent, LinearProgress } from '@mui/material';
import { Link } from 'react-router-dom';

interface DonorOverviewProps {
  donor: Donor;
}

interface Project {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  imageUrl: string;
  category: string;
  endDate: string;
}

interface DonationRecord {
  id: string;
  amount: number;
  projectId: string;
  projectTitle: string;
  date: string;
  status: string;
}

const DonorOverview: React.FC<DonorOverviewProps> = ({ donor }) => {
  const [recentDonations, setRecentDonations] = useState<DonationRecord[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch recent donations
        const donationsRef = collection(db, 'donations');
        const donationsQuery = query(
          donationsRef,
          where('donorId', '==', donor.id),
          orderBy('date', 'desc'),
          limit(3)
        );
        
        const donationsSnapshot = await getDocs(donationsQuery);
        const donationsData: DonationRecord[] = [];
        
        donationsSnapshot.forEach((doc) => {
          const data = doc.data();
          donationsData.push({
            id: doc.id,
            amount: data.amount || 0,
            projectId: data.projectId || '',
            projectTitle: data.projectTitle || 'Unknown Project',
            date: data.date || new Date().toISOString(),
            status: data.status || 'completed'
          });
        });
        
        setRecentDonations(donationsData);
        
        // Fetch recommended projects based on preferred causes
        const projectsRef = collection(db, 'projects');
        const projectsQuery = query(
          projectsRef,
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsData: Project[] = [];
        
        projectsSnapshot.forEach((doc) => {
          const data = doc.data();
          projectsData.push({
            id: doc.id,
            title: data.title || 'Untitled Project',
            description: data.description || '',
            goal: data.goal || 0,
            raised: data.raised || 0,
            imageUrl: data.imageUrl || 'https://via.placeholder.com/300x200',
            category: data.category || 'General',
            endDate: data.endDate || ''
          });
        });
        
        setRecommendedProjects(projectsData);
      } catch (error) {
        console.error('Error fetching donor overview data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [donor.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress color="secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Donor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card sx={{ bgcolor: '#fef2f2', color: '#be123c' }}>
          <CardContent>
            <div className="flex items-start">
              <div className="bg-rose-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-rose-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-rose-900">Total Donated</p>
                <p className="text-2xl font-semibold text-rose-700">
                  ${donor.totalDonated?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-rose-600 mt-1">
                  {donor.donationCount || 0} donations made
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <div className="flex items-start">
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Donation Frequency</p>
                <p className="text-2xl font-semibold text-gray-700">
                  {donor.donationFrequency ? (
                    donor.donationFrequency.charAt(0).toUpperCase() + donor.donationFrequency.slice(1)
                  ) : 'One-time'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Last donation: {recentDonations[0]?.date ? new Date(recentDonations[0].date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <div className="flex items-start">
              <div className="bg-green-100 p-3 rounded-full">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Preferred Causes</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {donor.preferredCauses && donor.preferredCauses.length > 0 ? (
                    donor.preferredCauses.slice(0, 3).map((cause, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {cause}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No preferred causes set</span>
                  )}
                  {donor.preferredCauses && donor.preferredCauses.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      +{donor.preferredCauses.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Donations</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentDonations.length > 0 ? (
            recentDonations.map((donation) => (
              <div key={donation.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-rose-100 p-2 rounded-full">
                      <Heart className="h-5 w-5 text-rose-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{donation.projectTitle}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(donation.date).toLocaleDateString()} • 
                        <span className="ml-1 capitalize">{donation.status}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${donation.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">
              <p>No donations yet</p>
            </div>
          )}
        </div>
        {recentDonations.length > 0 && (
          <div className="px-6 py-3 bg-gray-50">
            <Link
              to="#"
              className="text-sm font-medium text-rose-600 hover:text-rose-500"
              onClick={() => document.querySelector('[data-tab="donations"]')?.click()}
            >
              View all donations
            </Link>
          </div>
        )}
      </div>

      {/* Recommended Projects */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recommended Projects</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">{project.title}</h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {project.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900">${project.raised.toFixed(0)} raised</span>
                      <span className="text-gray-600">of ${project.goal.toFixed(0)}</span>
                    </div>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((project.raised / project.goal) * 100, 100)} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: '#fee2e2',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#be123c',
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {project.endDate ? (
                        <>Ends {new Date(project.endDate).toLocaleDateString()}</>
                      ) : (
                        <>Ongoing</>
                      )}
                    </div>
                    <Link
                      to={`/projects/${project.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    >
                      Donate Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50">
          <Link
            to="#"
            className="text-sm font-medium text-rose-600 hover:text-rose-500"
            onClick={() => document.querySelector('[data-tab="projects"]')?.click()}
          >
            View all projects
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DonorOverview; 