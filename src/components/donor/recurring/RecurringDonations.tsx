import React, { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import RecurringDonationCard from './RecurringDonationCard';
import RecurringDonationForm from './RecurringDonationForm';
import RecurringDonationStats from './RecurringDonationStats';
import RecurringDonationHistory from './RecurringDonationHistory';

const RecurringDonations = () => {
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [donations] = useState([
    {
      id: '1',
      amount: 25,
      frequency: 'monthly',
      campaign: 'General Fund',
      nextDate: 'Apr 1, 2024',
      card: '**** 4242',
      status: 'active',
      startDate: '2024-01-01',
      totalDonated: 75
    },
    {
      id: '2',
      amount: 50,
      frequency: 'monthly',
      campaign: 'Education Initiative',
      nextDate: 'Apr 15, 2024',
      card: '**** 5555',
      status: 'active',
      startDate: '2024-02-15',
      totalDonated: 100
    }
  ]);

  const stats = {
    totalMonthly: 75,
    nextPayment: 'Apr 1',
    totalImpact: 450,
    activeSubscriptions: donations.filter(d => d.status === 'active').length
  };

  const filteredDonations = donations.filter(donation => {
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
    const matchesSearch = donation.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         donation.frequency.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleEdit = (id: string) => {
    // Handle editing donation
    console.log('Edit donation:', id);
  };

  const handleCancel = (id: string) => {
    // Handle canceling donation
    console.log('Cancel donation:', id);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recurring Giving</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your recurring donations and payment schedules
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Recurring Donation
        </button>
      </div>

      <RecurringDonationStats stats={stats} />

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search donations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Active Donations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {filteredDonations.map((donation) => (
          <RecurringDonationCard
            key={donation.id}
            donation={donation}
            onEdit={handleEdit}
            onCancel={handleCancel}
          />
        ))}
      </div>

      {/* Payment History */}
      <RecurringDonationHistory />

      {/* New Donation Form */}
      {showForm && (
        <RecurringDonationForm
          onSubmit={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default RecurringDonations;