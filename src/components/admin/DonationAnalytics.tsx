import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { DollarSign, Users, Repeat, TrendingUp } from 'lucide-react';
import { getDonationAnalytics, getDonationTrends, getDonorStats, DonationAnalytics, DonationTrend } from '@/services/analytics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DonationAnalyticsDashboard = () => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [analytics, setAnalytics] = useState<DonationAnalytics | null>(null);
  const [trends, setTrends] = useState<DonationTrend[]>([]);
  const [donorStats, setDonorStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);

        const [analyticsData, trendsData, donorStatsData] = await Promise.all([
          getDonationAnalytics(startDate, now),
          getDonationTrends(timeframe),
          getDonorStats(),
        ]);

        setAnalytics(analyticsData);
        setTrends(trendsData);
        setDonorStats(donorStatsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  const trendData: ChartData<'line'> = {
    labels: trends.map(t => t.date),
    datasets: [
      {
        label: 'Donation Amount',
        data: trends.map(t => t.amount),
        borderColor: 'rgb(244, 63, 94)',
        backgroundColor: 'rgba(244, 63, 94, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const projectData: ChartData<'bar'> = {
    labels: analytics?.topProjects.map(p => p.projectName) || [],
    datasets: [
      {
        label: 'Total Donations',
        data: analytics?.topProjects.map(p => p.totalAmount) || [],
        backgroundColor: 'rgba(244, 63, 94, 0.8)',
      },
    ],
  };

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Donation Analytics</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-rose-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-rose-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Donations</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${analytics?.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Donors</p>
              <p className="text-2xl font-semibold text-gray-900">
                {donorStats?.totalDonors.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Repeat className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recurring Donors</p>
              <p className="text-2xl font-semibold text-gray-900">
                {donorStats?.recurringDonors.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Donation</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${analytics?.averageDonation.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Donation Trends
          </h3>
          <Line
            data={trendData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Projects by Donations
          </h3>
          <Bar
            data={projectData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Projects</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {analytics?.topProjects.map((project) => (
            <div key={project.projectId} className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {project.projectName}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {project.donationCount} donations
                  </p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  ${project.totalAmount.toLocaleString()}
                </div>
              </div>
              <div className="mt-2">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-rose-100">
                    <div
                      style={{
                        width: `${(project.totalAmount / analytics.totalAmount) * 100}%`,
                      }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-rose-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonationAnalyticsDashboard;
