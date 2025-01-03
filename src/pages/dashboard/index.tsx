import React from 'react';
import { Heart, TrendingUp, Users, Calendar, Download } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DonationChart } from '@/components/dashboard/DonationChart';
import { RecentDonations } from '@/components/dashboard/RecentDonations';
import { ImpactMetrics } from '@/components/dashboard/ImpactMetrics';
import { ProjectProgress } from '@/components/dashboard/ProjectProgress';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { formatCurrency } from '@/lib/utils';

const stats = [
  {
    label: 'Total Donated',
    value: '$2,450.00',
    change: '+12.5%',
    trend: 'up',
    icon: Heart,
    color: 'rose',
  },
  {
    label: 'Active Projects',
    value: '8',
    change: '+2',
    trend: 'up',
    icon: TrendingUp,
    color: 'blue',
  },
  {
    label: 'Lives Impacted',
    value: '1,234',
    change: '+123',
    trend: 'up',
    icon: Users,
    color: 'green',
  },
  {
    label: 'Member Since',
    value: 'Dec 2023',
    icon: Calendar,
    color: 'purple',
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        <AnalyticsDashboard />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h2>
              <RecentDonations />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Impact Metrics</h2>
              <ImpactMetrics />
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h2>
              <ProjectProgress />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Donation History</h2>
              <DonationChart />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
