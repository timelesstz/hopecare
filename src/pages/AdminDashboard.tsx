import React, { useState } from 'react';
import {
  BarChart2,
  Users,
  Calendar,
  FileText,
  Settings,
  Bell,
  User,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';
import ContentManagement from '../components/admin/ContentManagement';
import EventsManagement from '../components/admin/EventsManagement';
import VolunteersManagement from '../components/admin/VolunteersManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('content');

  const stats = [
    { label: 'Total Donations', value: '$24,500', icon: DollarSign },
    { label: 'Active Volunteers', value: '156', icon: Users },
    { label: 'Upcoming Events', value: '12', icon: Calendar },
    { label: 'Monthly Growth', value: '+15%', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart2 },
                { id: 'content', label: 'Content', icon: FileText },
                { id: 'events', label: 'Events', icon: Calendar },
                { id: 'volunteers', label: 'Volunteers', icon: Users },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center px-4 border-b-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <button className="ml-4 flex items-center text-gray-400 hover:text-gray-500">
                <User className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'content' && <ContentManagement />}
        {activeTab === 'events' && <EventsManagement />}
        {activeTab === 'volunteers' && <VolunteersManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;