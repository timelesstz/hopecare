import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Award, Shield, Search, Filter, ChevronDown, MapPin, TrendingUp } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface Donor {
  id: string;
  name: string;
  amount: number;
  date: string;
  message?: string;
  isRecurring?: boolean;
  badge?: 'new' | 'top' | 'loyal' | 'champion';
  location?: string;
  impactArea?: string;
}

interface DonorWallProps {
  donors: Donor[];
  featuredDonors?: Donor[];
  totalRaised: number;
  donorCount: number;
  onLoadMore: () => Promise<void>;
  isLoading?: boolean;
}

const DonorWall: React.FC<DonorWallProps> = ({
  donors,
  featuredDonors,
  totalRaised,
  donorCount,
  onLoadMore,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedImpactArea, setSelectedImpactArea] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && !isLoading) {
      onLoadMore();
    }
  }, [inView, isLoading, onLoadMore]);

  const filters = [
    { id: 'all', label: 'All Donors' },
    { id: 'recurring', label: 'Monthly Donors' },
    { id: 'recent', label: 'Recent Donations' },
    { id: 'top', label: 'Top Donors' },
  ];

  const impactAreas = [
    'Medical Supplies',
    'Emergency Care',
    'Preventive Care',
    'Mental Health',
    'Community Health',
  ];

  const locations = [
    'North America',
    'South America',
    'Europe',
    'Asia',
    'Africa',
    'Australia',
  ];

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donor.message && donor.message.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = !selectedFilter || 
      (selectedFilter === 'recurring' && donor.isRecurring) ||
      (selectedFilter === 'recent' && new Date(donor.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (selectedFilter === 'top' && donor.amount >= 1000);

    const matchesLocation = !selectedLocation || donor.location === selectedLocation;
    const matchesImpactArea = !selectedImpactArea || donor.impactArea === selectedImpactArea;

    return matchesSearch && matchesFilter && matchesLocation && matchesImpactArea;
  });

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'new':
        return <Star className="w-4 h-4" />;
      case 'top':
        return <Award className="w-4 h-4" />;
      case 'loyal':
        return <Heart className="w-4 h-4" />;
      case 'champion':
        return <Shield className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'new':
        return 'bg-blue-100 text-blue-600';
      case 'top':
        return 'bg-purple-100 text-purple-600';
      case 'loyal':
        return 'bg-rose-100 text-rose-600';
      case 'champion':
        return 'bg-amber-100 text-amber-600';
      default:
        return '';
    }
  };

  const DonorModal = ({ donor }: { donor: Donor }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={() => setShowDonorModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{donor.name}</h3>
            <p className="text-gray-500">{donor.date}</p>
          </div>
          {donor.badge && (
            <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getBadgeStyle(donor.badge)}\`}>
              {getBadgeIcon(donor.badge)}
              <span className="ml-1">{donor.badge.charAt(0).toUpperCase() + donor.badge.slice(1)}</span>
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Donation Amount</span>
              <span className="text-xl font-bold text-gray-900">
                ${donor.amount.toLocaleString()}
                {donor.isRecurring && <span className="text-sm text-gray-500">/month</span>}
              </span>
            </div>
          </div>

          {donor.message && (
            <div className="bg-rose-50 rounded-xl p-4">
              <p className="text-gray-700 italic">"{donor.message}"</p>
            </div>
          )}

          {donor.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{donor.location}</span>
            </div>
          )}

          {donor.impactArea && (
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Supporting {donor.impactArea}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowDonorModal(false)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Our Amazing Donors</h2>
        <p className="text-gray-600">
          Join {donorCount.toLocaleString()} donors who have contributed ${totalRaised.toLocaleString()}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search donors..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            <ChevronDown className={\`w-4 h-4 transition-transform \${showFilters ? 'rotate-180' : ''}\`} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={\`p-2 rounded-lg \${view === 'list' ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-600'}\`}
            >
              List
            </button>
            <button
              onClick={() => setView('grid')}
              className={\`p-2 rounded-lg \${view === 'grid' ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-600'}\`}
            >
              Grid
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(selectedFilter === filter.id ? null : filter.id)}
                      className={\`px-3 py-1 rounded-full text-sm \${
                        selectedFilter === filter.id
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }\`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Impact Area
                    </label>
                    <select
                      value={selectedImpactArea || ''}
                      onChange={(e) => setSelectedImpactArea(e.target.value || null)}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    >
                      <option value="">All Areas</option>
                      {impactAreas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <select
                      value={selectedLocation || ''}
                      onChange={(e) => setSelectedLocation(e.target.value || null)}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    >
                      <option value="">All Locations</option>
                      {locations.map((location) => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Featured Donors */}
      {featuredDonors && featuredDonors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Featured Supporters</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {featuredDonors.map((donor) => (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-xl p-6 cursor-pointer"
                onClick={() => {
                  setSelectedDonor(donor);
                  setShowDonorModal(true);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{donor.name}</h4>
                    <p className="text-sm text-gray-600">{donor.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {donor.isRecurring && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                        Monthly Donor
                      </span>
                    )}
                    {donor.badge && (
                      <span className={\`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 \${getBadgeStyle(donor.badge)}\`}>
                        {getBadgeIcon(donor.badge)}
                        {donor.badge.charAt(0).toUpperCase() + donor.badge.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    ${donor.amount.toLocaleString()}
                  </span>
                  {donor.isRecurring && (
                    <span className="text-gray-500 text-sm">/month</span>
                  )}
                </div>
                {donor.message && (
                  <p className="text-gray-600 italic">"{donor.message}"</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Donor List/Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Recent Donations</h3>
          <span className="text-gray-500">
            Showing {filteredDonors.length} of {donors.length} donors
          </span>
        </div>

        <div className={\`grid gap-4 \${view === 'grid' ? 'md:grid-cols-3' : ''}\`}>
          {filteredDonors.map((donor, index) => (
            <motion.div
              key={donor.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={\`
                bg-white rounded-lg p-4 shadow-sm cursor-pointer
                \${view === 'list' ? 'flex items-center justify-between' : ''}
              \`}
              onClick={() => {
                setSelectedDonor(donor);
                setShowDonorModal(true);
              }}
            >
              <div className={\`\${view === 'list' ? 'flex items-center gap-4' : 'space-y-3'}\`}>
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{donor.name}</h4>
                  <p className="text-sm text-gray-500">{donor.date}</p>
                  {view === 'grid' && donor.message && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{donor.message}</p>
                  )}
                </div>
              </div>
              <div className={\`flex items-center gap-3 \${view === 'grid' ? 'mt-4' : ''}\`}>
                <span className="font-semibold text-gray-900">
                  ${donor.amount.toLocaleString()}
                </span>
                {donor.badge && (
                  <span className={\`p-1 rounded-full \${getBadgeStyle(donor.badge)}\`}>
                    {getBadgeIcon(donor.badge)}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div ref={loadMoreRef} className="flex justify-center">
          {isLoading ? (
            <div className="p-4">
              <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <button
              onClick={() => onLoadMore()}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      </div>

      {/* Join Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl p-8 text-center text-white"
      >
        <h3 className="text-2xl font-bold mb-2">Join Our Community of Donors</h3>
        <p className="mb-4">Every donation makes a difference in someone's life</p>
        <button
          className="bg-white text-rose-600 px-6 py-3 rounded-lg font-medium
            hover:bg-rose-50 transition-colors duration-200"
        >
          Make a Donation
        </button>
      </motion.div>

      {/* Donor Modal */}
      <AnimatePresence>
        {showDonorModal && selectedDonor && <DonorModal donor={selectedDonor} />}
      </AnimatePresence>
    </div>
  );
};

export default DonorWall;
