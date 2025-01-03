import { useState, useEffect } from 'react';
import {
  calculateDonorRetention,
  predictGrowth,
  segmentDonors,
  RetentionMetrics,
  GrowthMetrics,
  DonorSegment,
} from '@/services/advanced-analytics';
import {
  getYearlyGoalProgress,
  listDonationGoals,
  DonationGoal,
} from '@/services/donation-goals';
import {
  TrendingUp,
  Users,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const AdvancedAnalytics = () => {
  const [retention, setRetention] = useState<RetentionMetrics | null>(null);
  const [growth, setGrowth] = useState<GrowthMetrics | null>(null);
  const [segments, setSegments] = useState<DonorSegment[]>([]);
  const [yearlyProgress, setYearlyProgress] = useState<any>(null);
  const [activeGoals, setActiveGoals] = useState<DonationGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          retentionData,
          growthData,
          segmentData,
          yearlyProgressData,
          goalsData,
        ] = await Promise.all([
          calculateDonorRetention(),
          predictGrowth(),
          segmentDonors(),
          getYearlyGoalProgress(),
          listDonationGoals(),
        ]);

        setRetention(retentionData);
        setGrowth(growthData);
        setSegments(segmentData);
        setYearlyProgress(yearlyProgressData);
        setActiveGoals(goalsData);
      } catch (error) {
        console.error('Error fetching advanced analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading advanced analytics...</div>;
  }

  const retentionChartData = {
    labels: retention?.monthlyRetentionTrend.map(m => m.month) || [],
    datasets: [
      {
        label: 'Retention Rate',
        data: retention?.monthlyRetentionTrend.map(m => m.retentionRate * 100) || [],
        borderColor: 'rgb(244, 63, 94)',
        backgroundColor: 'rgba(244, 63, 94, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const growthChartData = {
    labels: growth?.projectedDonations.map(d => d.month) || [],
    datasets: [
      {
        label: 'Projected Donations',
        data: growth?.projectedDonations.map(d => d.amount) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const segmentChartData = {
    labels: segments.map(s => s.segment),
    datasets: [
      {
        data: segments.map(s => s.count),
        backgroundColor: [
          'rgba(244, 63, 94, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Users className="h-6 w-6 text-rose-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Donor Retention</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(retention?.retentionRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Growth</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(growth?.monthlyGrowthRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Donor Lifespan</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(retention?.averageDonorLifespan || 0)} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">YoY Growth</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(growth?.yearOverYearGrowth * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Retention Trend
          </h3>
          <Line
            data={retentionChartData}
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
                  max: 100,
                },
              },
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Projected Growth
          </h3>
          <Line
            data={growthChartData}
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

      {/* Donor Segments and Yearly Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Donor Segments
          </h3>
          <div className="aspect-square">
            <Doughnut
              data={segmentChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Yearly Goal Progress
          </h3>
          {yearlyProgress ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  ${yearlyProgress.currentAmount.toLocaleString()} of $
                  {yearlyProgress.goal.targetAmount.toLocaleString()}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    yearlyProgress.isAhead
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {yearlyProgress.isAhead ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-1" />
                  )}
                  {yearlyProgress.isAhead ? 'Ahead of Schedule' : 'Behind Schedule'}
                </span>
              </div>

              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-rose-100">
                  <div
                    style={{ width: `${yearlyProgress.percentageComplete}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-rose-500"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Projected Total: ${yearlyProgress.projectedTotal.toLocaleString()}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No yearly goal set</p>
          )}

          {/* Active Goals List */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">
              Active Goals
            </h4>
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-sm text-gray-500">
                      ${goal.currentAmount.toLocaleString()} / $
                      {goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-rose-100">
                      <div
                        style={{
                          width: `${(goal.currentAmount / goal.targetAmount) * 100}%`,
                        }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-rose-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
