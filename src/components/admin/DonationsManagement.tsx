import { useState } from 'react';
import { Search, Download, DollarSign } from 'lucide-react';

interface Donation {
  id: string;
  amount: number;
  donorName: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  anonymous: boolean;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annually';
  projectAllocation: string | null;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

const DonationsManagement = () => {
  const [donations, setDonations] = useState<Donation[]>([
    {
      id: '1',
      amount: 100.00,
      donorName: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      message: 'Keep up the great work!',
      anonymous: false,
      frequency: 'one-time',
      projectAllocation: null,
      status: 'completed',
      createdAt: '2024-12-14T08:00:00Z',
    },
    {
      id: '2',
      amount: 50.00,
      donorName: null,
      email: null,
      phone: null,
      message: 'Supporting the cause',
      anonymous: true,
      frequency: 'monthly',
      projectAllocation: 'project-1',
      status: 'completed',
      createdAt: '2024-12-14T07:30:00Z',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const handleExportCSV = () => {
    // Implementation for exporting donations to CSV
    console.log('Exporting donations to CSV...');
  };

  const getDateFilterValue = (date: string) => {
    const today = new Date();
    const donationDate = new Date(date);
    const diffTime = Math.abs(today.getTime() - donationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) return 'week';
    if (diffDays <= 30) return 'month';
    if (diffDays <= 90) return 'quarter';
    return 'older';
  };

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      !searchTerm ||
      (donation.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus =
      statusFilter === 'all' || donation.status === statusFilter;
    
    const matchesDate =
      dateFilter === 'all' ||
      getDateFilterValue(donation.createdAt) === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalDonations = filteredDonations.reduce(
    (sum, donation) => sum + donation.amount,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Donations Management</h2>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
        >
          <Download className="h-5 w-5 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search donors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="quarter">Past Quarter</option>
                <option value="older">Older</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <DollarSign className="h-5 w-5" />
              <span className="font-medium">Total:</span>
              <span className="text-lg font-bold">
                ${totalDonations.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {donation.anonymous
                          ? 'Anonymous Donor'
                          : donation.donorName}
                      </div>
                      {!donation.anonymous && donation.email && (
                        <div className="text-sm text-gray-500">
                          {donation.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${donation.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {donation.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donation.projectAllocation || 'General Fund'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          donation.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : donation.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {donation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationsManagement;
