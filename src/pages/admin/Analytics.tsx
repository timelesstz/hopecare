import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analytics } from '../../lib/analytics-firebase';
import { formatCurrency } from '../../lib/utils';

interface DonationMetrics {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  recurringDonations: number;
  oneTimeDonations: number;
}

interface UserMetrics {
  totalPageViews: number;
  uniqueVisitors: number;
  mostViewedPages: Record<string, number>;
  userActions: Record<string, number>;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [donationMetrics, setDonationMetrics] = useState<DonationMetrics | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();

      const [donationData, userData] = await Promise.all([
        analytics.getDonationMetrics(startDate, endDate),
        analytics.getUserMetrics(startDate, endDate),
      ]);

      setDonationMetrics(donationData);
      setUserMetrics(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={fetchAnalytics}
          className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const donationTypeData = donationMetrics ? [
    { name: 'One-time', value: donationMetrics.oneTimeDonations },
    { name: 'Recurring', value: donationMetrics.recurringDonations },
  ] : [];

  const pageViewData = userMetrics ? Object.entries(userMetrics.mostViewedPages)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="ml-4 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-rose-500 focus:outline-none focus:ring-rose-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Donation Stats */}
        <div className="bg-white rounded-lg shadow px-5 py-6">
          <div className="text-sm font-medium text-gray-500 truncate">
            Total Donations
          </div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">
            {donationMetrics?.totalDonations || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow px-5 py-6">
          <div className="text-sm font-medium text-gray-500 truncate">
            Total Amount
          </div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">
            {formatCurrency(donationMetrics?.totalAmount || 0, 'USD')}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow px-5 py-6">
          <div className="text-sm font-medium text-gray-500 truncate">
            Average Donation
          </div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">
            {formatCurrency(donationMetrics?.averageDonation || 0, 'USD')}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow px-5 py-6">
          <div className="text-sm font-medium text-gray-500 truncate">
            Unique Visitors
          </div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">
            {userMetrics?.uniqueVisitors || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Donation Type Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Donation Type Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donationTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {donationTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Viewed Pages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Most Viewed Pages
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pageViewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#FF6B6B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          User Actions
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={Object.entries(userMetrics?.userActions || {}).map(([name, value]) => ({
                name,
                value,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4ECDC4"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
