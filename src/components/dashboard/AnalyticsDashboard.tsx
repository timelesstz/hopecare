import React, { useState, useEffect } from 'react';
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
  Cell,
} from 'recharts';
import { Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { formatCurrency } from '@/lib/utils';
import { analyticsService, DonationAnalytics } from '@/services/analyticsService';
import { DateRangeSelector } from './DateRangeSelector';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './ChartLegend';
import { DrillDownView } from './DrillDownView';
import { ExportDialog } from './ExportDialog';
import { ComparisonSelector, type ComparisonPeriod } from './ComparisonSelector';
import { MetricCard } from './MetricCard';

const COLORS = {
  donation: '#e11d48',
  count: '#4f46e5',
  newDonors: '#4f46e5',
  returningDonors: '#0891b2',
  distribution: ['#e11d48', '#4f46e5', '#0891b2', '#059669', '#eab308', '#ec4899'],
};

export function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<DonationAnalytics | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [activeLines, setActiveLines] = useState<string[]>(['amount', 'count']);
  const [activeBars, setActiveBars] = useState<string[]>(['newDonors', 'returningDonors']);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [comparisonData, setComparisonData] = useState<DonationAnalytics | null>(null);
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>('previous');
  const [trendData, setTrendData] = useState<Record<string, number[]>>({});

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!dateRange.from || !dateRange.to) return;
      
      setIsLoading(true);
      try {
        // Get current period data
        const data = await analyticsService.getDonationAnalytics({
          startDate: dateRange.from,
          endDate: dateRange.to,
        });
        setAnalytics(data);

        // Get comparison data if needed
        if (comparisonPeriod !== 'none') {
          const compData = await analyticsService.getComparisonData(
            {
              startDate: dateRange.from,
              endDate: dateRange.to,
            },
            comparisonPeriod === 'previous' ? 'previous' : comparisonPeriod
          );
          setComparisonData(compData.analytics);
        } else {
          setComparisonData(null);
        }

        // Get trend data
        const trends = await Promise.all([
          analyticsService.getTrendData(dateRange.to, 30, 'day'),
          analyticsService.getTrendData(dateRange.to, 12, 'month'),
        ]);

        setTrendData({
          daily: trends[0],
          monthly: trends[1],
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange, comparisonPeriod]);

  const calculateGrowth = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const renderGrowthIndicator = (current: number, previous: number) => {
    const growth = calculateGrowth(current, previous);
    const color = growth > 0 ? 'text-green-600' : growth < 0 ? 'text-rose-600' : 'text-gray-600';
    const arrow = growth > 0 ? '↑' : growth < 0 ? '↓' : '→';

    return (
      <span className={`${color} text-sm ml-2`}>
        {arrow} {Math.abs(growth).toFixed(1)}%
      </span>
    );
  };

  const handleExport = async () => {
    if (!dateRange.from || !dateRange.to) return;

    try {
      const blob = await analyticsService.exportAnalyticsReport({
        startDate: dateRange.from,
        endDate: dateRange.to,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${dateRange.from.toISOString().split('T')[0]}-to-${
        dateRange.to.toISOString().split('T')[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const toggleLine = (name: string) => {
    setActiveLines(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const toggleBar = (name: string) => {
    setActiveBars(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const handleDrillDown = async (type: string, id: string) => {
    if (!dateRange.from || !dateRange.to) return;

    try {
      const data = await analyticsService.getDrillDownData(type, id, {
        startDate: dateRange.from,
        endDate: dateRange.to,
      });
      setDrillDownData(data);
      setShowDrillDown(true);
    } catch (error) {
      console.error('Error fetching drill-down data:', error);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <DateRangeSelector
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <ComparisonSelector
            value={comparisonPeriod}
            onChange={setComparisonPeriod}
          />
        </div>
        <button
          onClick={() => setShowExportDialog(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Raised"
          value={formatCurrency(analytics.impactMetrics.totalRaised)}
          previousValue={comparisonData ? formatCurrency(comparisonData.impactMetrics.totalRaised) : undefined}
          change={comparisonData ? calculateGrowth(
            analytics.impactMetrics.totalRaised,
            comparisonData.impactMetrics.totalRaised
          ) : undefined}
          trend={trendData.daily}
          info="Total amount raised during the selected period"
        />
        <MetricCard
          title="Lives Impacted"
          value={analytics.impactMetrics.livesImpacted.toLocaleString()}
          previousValue={comparisonData?.impactMetrics.livesImpacted.toLocaleString()}
          change={comparisonData ? calculateGrowth(
            analytics.impactMetrics.livesImpacted,
            comparisonData.impactMetrics.livesImpacted
          ) : undefined}
          trend={trendData.monthly}
          info="Number of people directly impacted by our projects"
        />
        <MetricCard
          title="Projects Supported"
          value={analytics.impactMetrics.projectsSupported}
          previousValue={comparisonData?.impactMetrics.projectsSupported}
          change={comparisonData ? calculateGrowth(
            analytics.impactMetrics.projectsSupported,
            comparisonData.impactMetrics.projectsSupported
          ) : undefined}
          info="Active projects during the selected period"
        />
        <MetricCard
          title="Communities Served"
          value={analytics.impactMetrics.communitiesServed}
          previousValue={comparisonData?.impactMetrics.communitiesServed}
          change={comparisonData ? calculateGrowth(
            analytics.impactMetrics.communitiesServed,
            comparisonData.impactMetrics.communitiesServed
          ) : undefined}
          info="Number of communities receiving support"
        />
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Monthly Growth"
          value={formatCurrency(analytics.donationGrowth.monthly)}
          previousValue={comparisonData ? formatCurrency(comparisonData.donationGrowth.monthly) : undefined}
          change={comparisonData ? calculateGrowth(
            analytics.donationGrowth.monthly,
            comparisonData.donationGrowth.monthly
          ) : undefined}
          trend={trendData.monthly}
          info="Average monthly donation growth"
        />
        <MetricCard
          title="Quarterly Growth"
          value={formatCurrency(analytics.donationGrowth.quarterly)}
          previousValue={comparisonData ? formatCurrency(comparisonData.donationGrowth.quarterly) : undefined}
          change={comparisonData ? calculateGrowth(
            analytics.donationGrowth.quarterly,
            comparisonData.donationGrowth.quarterly
          ) : undefined}
          info="Average quarterly donation growth"
        />
        <MetricCard
          title="Yearly Growth"
          value={formatCurrency(analytics.donationGrowth.yearly)}
          previousValue={comparisonData ? formatCurrency(comparisonData.donationGrowth.yearly) : undefined}
          change={comparisonData ? calculateGrowth(
            analytics.donationGrowth.yearly,
            comparisonData.donationGrowth.yearly
          ) : undefined}
          info="Average yearly donation growth"
        />
      </div>

      {/* Donation Trends */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Trends</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.donationsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis
                yAxisId="amount"
                stroke="#6b7280"
                tickFormatter={value => `$${value / 1000}k`}
              />
              <YAxis
                yAxisId="count"
                orientation="right"
                stroke="#6b7280"
              />
              <Tooltip content={<ChartTooltip type="donation" />} />
              {activeLines.includes('amount') && (
                <Line
                  yAxisId="amount"
                  type="monotone"
                  dataKey="amount"
                  stroke={COLORS.donation}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              )}
              {activeLines.includes('count') && (
                <Line
                  yAxisId="count"
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS.count}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend
          data={[
            { name: 'Amount', color: COLORS.donation },
            { name: 'Count', color: COLORS.count },
          ]}
          onItemClick={name => toggleLine(name.toLowerCase())}
          activeItems={activeLines}
        />
      </div>

      {/* Top Donors */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Donors</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Donated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Donation
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topDonors.slice(0, 5).map((donor, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleDrillDown('donor', donor.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {donor.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(donor.totalDonated)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {donor.donationCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(donor.lastDonation).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Average Donation"
          value={formatCurrency(analytics.averageDonation)}
          previousValue={comparisonData ? formatCurrency(comparisonData.averageDonation) : undefined}
          change={comparisonData ? calculateGrowth(
            analytics.averageDonation,
            comparisonData.averageDonation
          ) : undefined}
          info="Average donation amount"
        />
        <MetricCard
          title="Recurring Donors"
          value={analytics.recurringDonors}
          previousValue={comparisonData ? comparisonData.recurringDonors : undefined}
          change={comparisonData ? calculateGrowth(
            analytics.recurringDonors,
            comparisonData.recurringDonors
          ) : undefined}
          info="Number of recurring donors"
        />
        <MetricCard
          title="New Donors (30d)"
          value={analytics.donorGrowth}
          previousValue={comparisonData ? comparisonData.donorGrowth : undefined}
          change={comparisonData ? calculateGrowth(
            analytics.donorGrowth,
            comparisonData.donorGrowth
          ) : undefined}
          info="Number of new donors in the last 30 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donation Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Donation Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.donationsByProject.map(item => ({
                    ...item,
                    total: analytics.donationsByProject.reduce((sum, p) => sum + p.value, 0),
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {analytics.donationsByProject.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS.distribution[index % COLORS.distribution.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip type="distribution" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend
            data={analytics.donationsByProject.map((item, index) => ({
              name: item.name,
              color: COLORS.distribution[index % COLORS.distribution.length],
              value: Math.round((item.value / analytics.donationsByProject.reduce((sum, p) => sum + p.value, 0)) * 100) + '%',
            }))}
          />
        </div>

        {/* Donor Retention */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Donor Retention
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.donorRetention}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<ChartTooltip type="donor" />} />
                {activeBars.includes('newDonors') && (
                  <Bar
                    dataKey="newDonors"
                    fill={COLORS.newDonors}
                    radius={[4, 4, 0, 0]}
                  />
                )}
                {activeBars.includes('returningDonors') && (
                  <Bar
                    dataKey="returningDonors"
                    fill={COLORS.returningDonors}
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend
            data={[
              { name: 'New Donors', color: COLORS.newDonors },
              { name: 'Returning Donors', color: COLORS.returningDonors },
            ]}
            onItemClick={name =>
              toggleBar(
                name === 'New Donors' ? 'newDonors' : 'returningDonors'
              )
            }
            activeItems={activeBars}
          />
        </div>
      </div>

      {/* Drill Down View */}
      {drillDownData && (
        <DrillDownView
          isOpen={showDrillDown}
          onClose={() => setShowDrillDown(false)}
          data={drillDownData}
        />
      )}

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        dateRange={{
          startDate: dateRange.from!,
          endDate: dateRange.to!,
        }}
      />
    </div>
  );
}
