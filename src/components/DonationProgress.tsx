import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, TrendingUp, Users, Target, Share2, ChevronDown } from 'lucide-react';
import { donationAnalytics } from '../services/donationAnalytics';

interface DonationProgressProps {
  campaignId?: string;
  showDetails?: boolean;
}

export const DonationProgress: React.FC<DonationProgressProps> = ({
  campaignId,
  showDetails = true,
}) => {
  const [timeframe, setTimeframe] = useState<'month' | 'year' | 'all'>('month');
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'donors'>('overview');

  React.useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await donationAnalytics.getDonationStats(timeframe);
        setStats(data);
      } catch (error) {
        console.error('Error fetching donation stats:', error);
      }
      setIsLoading(false);
    };

    fetchStats();
  }, [timeframe, campaignId]);

  const impactMetrics = [
    {
      icon: Heart,
      label: 'Lives Impacted',
      value: stats?.impactMetrics.livesImpacted || 0,
      description: 'Number of individuals directly benefiting from our programs',
    },
    {
      icon: Users,
      label: 'Communities Served',
      value: stats?.impactMetrics.communitiesServed || 0,
      description: 'Local communities receiving healthcare support',
    },
    {
      icon: Target,
      label: 'Programs Supported',
      value: stats?.impactMetrics.programsSupported || 0,
      description: 'Healthcare initiatives funded through donations',
    },
  ];

  const ImpactModal = ({ metric }: { metric: typeof impactMetrics[0] }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={() => setShowImpactModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-rose-100 rounded-full">
            <metric.icon className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{metric.label}</h3>
            <p className="text-gray-500">{metric.description}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="text-center">
              <span className="text-4xl font-bold text-rose-600">
                {metric.value.toLocaleString()}
              </span>
              <p className="text-gray-600 mt-2">{metric.label}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Impact Breakdown</h4>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-600">Impact Category {i}</span>
                  <span className="font-medium text-gray-900">
                    {Math.floor(metric.value / (i * 3)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Monthly Trend</h4>
            <div className="h-32 bg-gray-50 rounded-lg">
              {/* Add a chart here */}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowImpactModal(false)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-8" data-cy="donation-progress-container">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center" data-cy="donation-progress-header">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900" data-cy="donation-progress-title">
            Donation Impact
          </h2>
          <p className="text-gray-600">Track our progress and impact</p>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        >
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`
              pb-4 px-1 ${
                activeTab === 'overview'
                  ? 'border-b-2 border-rose-500 text-rose-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`
              pb-4 px-1 ${
                activeTab === 'trends'
                  ? 'border-b-2 border-rose-500 text-rose-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveTab('donors')}
            className={`
              pb-4 px-1 ${
                activeTab === 'donors'
                  ? 'border-b-2 border-rose-500 text-rose-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Donors
          </button>
        </nav>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-12"
          >
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-8" data-cy="donation-progress-stats">
                {/* Impact Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {impactMetrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedMetric(metric.label);
                        setShowImpactModal(true);
                      }}
                      data-cy={`donation-progress-metric-${index}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-100 rounded-full">
                          <metric.icon className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{metric.label}</h3>
                          <p className="text-2xl font-bold text-rose-600">
                            {metric.value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Progress Bars */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Campaign Progress</h3>
                  {stats?.topCampaigns.map((campaign: any, index: number) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                      data-cy={`donation-progress-campaign-${index}`}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-900">{campaign.name}</span>
                        <span className="text-gray-600">
                          ${campaign.amount.toLocaleString()} raised
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-rose-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(campaign.amount / campaign.goal) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-8">
                {/* Monthly Donations Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Donations</h3>
                  <div className="h-64 bg-gray-50 rounded-lg">
                    {/* Add a chart here */}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h4 className="text-sm font-medium text-gray-600">Growth Rate</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.growthRate.toFixed(1)}%
                    </p>
                    <div className="flex items-center gap-2 text-green-600 mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">vs last month</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h4 className="text-sm font-medium text-gray-600">Retention Rate</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.retentionRate.toFixed(1)}%
                    </p>
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">monthly donors</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h4 className="text-sm font-medium text-gray-600">Average Donation</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats?.averageDonation.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">per donation</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'donors' && (
              <div className="space-y-8">
                {/* Donor Segments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {stats?.donorSegments.map((segment: any) => (
                    <div key={segment.segment} className="bg-white rounded-xl shadow-sm p-6">
                      <h4 className="text-sm font-medium text-gray-600">{segment.segment} Donors</h4>
                      <p className="text-2xl font-bold text-gray-900">{segment.count}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Total: ${segment.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recent Donors */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Donors</h3>
                  <div className="space-y-4">
                    {/* Add recent donors list here */}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Button */}
      <div className="flex justify-center">
        <button
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          data-cy="donation-progress-share-button"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Our Impact
        </button>
      </div>

      {/* Impact Modal */}
      <AnimatePresence>
        {showImpactModal && selectedMetric && (
          <ImpactModal
            metric={impactMetrics.find((m) => m.label === selectedMetric)!}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonationProgress;
