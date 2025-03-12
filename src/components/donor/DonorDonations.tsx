import React, { useState, useEffect } from 'react';
import { Heart, Download, Search, Filter, Calendar, ArrowDown, ArrowUp } from 'lucide-react';
import { Donor } from '../../types/donor';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { CircularProgress, TextField, MenuItem, Select, FormControl, InputLabel, Chip, Button, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';

interface DonorDonationsProps {
  donor: Donor;
}

interface Donation {
  id: string;
  amount: number;
  projectId: string;
  projectTitle: string;
  date: string;
  status: string;
  paymentMethod: string;
  receiptUrl?: string;
}

const DonorDonations: React.FC<DonorDonationsProps> = ({ donor }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchDonations();
  }, [donor.id]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const donationsRef = collection(db, 'donations');
      const donationsQuery = query(
        donationsRef,
        where('donorId', '==', donor.id),
        orderBy('date', 'desc')
      );
      
      const donationsSnapshot = await getDocs(donationsQuery);
      const donationsData: Donation[] = [];
      
      donationsSnapshot.forEach((doc) => {
        const data = doc.data();
        donationsData.push({
          id: doc.id,
          amount: data.amount || 0,
          projectId: data.projectId || '',
          projectTitle: data.projectTitle || 'Unknown Project',
          date: data.date || new Date().toISOString(),
          status: data.status || 'completed',
          paymentMethod: data.paymentMethod || 'card',
          receiptUrl: data.receiptUrl
        });
      });
      
      setDonations(donationsData);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };

  const filteredDonations = donations
    .filter(donation => {
      // Apply search filter
      if (searchTerm && !donation.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter !== 'all' && donation.status !== statusFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'project') {
        comparison = a.projectTitle.localeCompare(b.projectTitle);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'failed':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress color="secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Donation History</h2>
        
        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-1 md:col-span-1">
            <TextField
              label="Search Projects"
              variant="outlined"
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search className="h-4 w-4 mr-2 text-gray-400" />,
              }}
            />
          </div>
          
          <div>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="outlined"
              startIcon={<Download />}
              sx={{ 
                borderColor: '#be123c', 
                color: '#be123c',
                '&:hover': { borderColor: '#9f1239', color: '#9f1239', bgcolor: 'rgba(190, 18, 60, 0.04)' }
              }}
            >
              Export History
            </Button>
          </div>
        </div>
        
        {/* Donations Table */}
        {filteredDonations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('date')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === 'date' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="h-3 w-3 ml-1" /> : 
                          <ArrowDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('project')}
                  >
                    <div className="flex items-center">
                      Project
                      {sortBy === 'project' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="h-3 w-3 ml-1" /> : 
                          <ArrowDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('amount')}
                  >
                    <div className="flex items-center">
                      Amount
                      {sortBy === 'amount' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="h-3 w-3 ml-1" /> : 
                          <ArrowDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.map((donation) => {
                  const statusColor = getStatusColor(donation.status);
                  return (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(donation.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-rose-100 rounded-full flex items-center justify-center">
                            <Heart className="h-4 w-4 text-rose-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              <Link to={`/projects/${donation.projectId}`} className="hover:text-rose-600">
                                {donation.projectTitle}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${donation.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>
                          {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {donation.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {donation.receiptUrl ? (
                          <a 
                            href={donation.receiptUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-rose-600 hover:text-rose-900"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No donations found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-4 text-rose-600 hover:text-rose-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDonations; 