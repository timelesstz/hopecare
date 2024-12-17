import React, { useState } from 'react';
import { 
  BarChart2, 
  History, 
  Clock, 
  Settings, 
  CreditCard,
  FileText,
  Bell,
  Heart,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DonorStats from '../components/donor/DonorStats';
import DonationHistory from '../components/donor/DonationHistory';
import RecurringDonations from '../components/donor/RecurringDonations';
import DonorProfile from '../components/donor/DonorProfile';
import DonorAnalytics from '../components/donor/analytics/DonorAnalytics';
import PaymentMethods from '../components/donor/settings/PaymentMethods';
import EmailPreferences from '../components/donor/settings/EmailPreferences';
import TaxDocuments from '../components/donor/settings/TaxDocuments';
import SecuritySettings from '../components/donor/settings/SecuritySettings';
import MessageCenter from '../components/donor/messaging/MessageCenter';
import SuggestedProjects from '../components/donor/SuggestedProjects';

const mockDonations = [
  {
    id: "1",
    amount: 100,
    date: "2024-03-15",
    campaign: "Education Fund",
    status: "completed"
  },
  {
    id: "2",
    amount: 50,
    date: "2024-03-01",
    campaign: "Community Garden",
    status: "completed"
  }
];

const suggestedProjects = [
  {
    id: 1,
    title: "Education Support Program",
    description: "Help provide educational resources to underprivileged children",
    target: 5000,
    raised: 3500,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    title: "Community Health Initiative",
    description: "Support local health programs and medical resources",
    target: 10000,
    raised: 6000,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80"
  }
];

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(2);

  const mockDonor = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, ST 12345",
    joinDate: "January 2024"
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'donations', label: 'My Donations', icon: History },
    { id: 'recurring', label: 'Recurring Giving', icon: Clock },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'documents', label: 'Tax Documents', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center px-4 border-b-2 text-sm font-medium whitespace-nowrap ${
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
            <div className="flex items-center space-x-4">
              <Link
                to="/donate"
                className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition flex items-center"
              >
                <Heart className="h-5 w-5 mr-2" />
                Donate Now
              </Link>
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <>
              <SuggestedProjects projects={suggestedProjects} />
              <DonorProfile donor={mockDonor} />
              <DonorStats />
              <DonorAnalytics donations={mockDonations} />
            </>
          )}

          {activeTab === 'donations' && (
            <div className="bg-white rounded-lg shadow">
              <DonationHistory />
            </div>
          )}

          {activeTab === 'recurring' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Active Recurring Donations</h3>
                <button className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition">
                  Set Up New Recurring Donation
                </button>
              </div>
              <RecurringDonations />
            </div>
          )}

          {activeTab === 'messages' && (
            <MessageCenter />
          )}

          {activeTab === 'payments' && (
            <PaymentMethods />
          )}

          {activeTab === 'documents' && (
            <TaxDocuments />
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
                  <DonorProfile donor={mockDonor} />
                </div>
                <SecuritySettings />
              </div>
              <div className="space-y-8">
                <EmailPreferences />
                <PaymentMethods />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Donate Button (Mobile) */}
      <div className="lg:hidden fixed bottom-4 right-4">
        <Link
          to="/donate"
          className="bg-rose-600 text-white p-4 rounded-full shadow-lg hover:bg-rose-700 transition flex items-center justify-center"
        >
          <Heart className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
};

export default DonorDashboard;