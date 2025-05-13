import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Search, Filter, ChevronDown, CheckCircle2, Mail } from 'lucide-react';
import { Opportunity } from '../../hooks/useVolunteerData';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, arrayUnion, getDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Modal, Box, Typography, Button, TextField, CircularProgress, Snackbar, Alert } from '@mui/material';

interface VolunteerOpportunitiesProps {
  opportunities?: Opportunity[];
}

const VolunteerOpportunities: React.FC<VolunteerOpportunitiesProps> = ({ opportunities = [] }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [appliedOpportunities, setAppliedOpportunities] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'week', 'month'
  const [locationFilter, setLocationFilter] = useState('all');
  
  // Modal states
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Load applied opportunities from Firestore
  useEffect(() => {
    const loadAppliedOpportunities = async () => {
      if (!user?.uid) return;
      
      try {
        const volunteerRef = doc(db, 'volunteer_profiles', user.uid);
        const volunteerDoc = await getDoc(volunteerRef);
        
        if (volunteerDoc.exists() && volunteerDoc.data().applied_opportunities) {
          setAppliedOpportunities(volunteerDoc.data().applied_opportunities || []);
        }
      } catch (error) {
        console.error('Error loading applied opportunities:', error);
      }
    };
    
    loadAppliedOpportunities();
  }, [user]);

  // Extract categories from opportunities
  const allCategories = new Set<string>();
  opportunities.forEach(opp => {
    // Extract category from title or use a default
    const category = opp.title.toLowerCase().includes('food') ? 'food-security' :
                    opp.title.toLowerCase().includes('mentor') ? 'education' :
                    opp.title.toLowerCase().includes('care') ? 'healthcare' : 'other';
    allCategories.add(category);
  });

  // Extract locations from opportunities
  const allLocations = new Set<string>();
  opportunities.forEach(opp => {
    allLocations.add(opp.location);
  });

  const categories = [
    { id: 'all', name: 'All Opportunities' },
    ...Array.from(allCategories).map(cat => ({
      id: cat,
      name: cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }))
  ];

  const locations = [
    { id: 'all', name: 'All Locations' },
    ...Array.from(allLocations).map(loc => ({
      id: loc,
      name: loc
    }))
  ];

  // Apply filters and search
  useEffect(() => {
    let filtered = [...opportunities];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(opp => {
        const category = opp.title.toLowerCase().includes('food') ? 'food-security' :
                        opp.title.toLowerCase().includes('mentor') ? 'education' :
                        opp.title.toLowerCase().includes('care') ? 'healthcare' : 'other';
        return category === selectedCategory;
      });
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(query) || 
        opp.description.toLowerCase().includes(query) ||
        opp.location.toLowerCase().includes(query)
      );
    }
    
    // Apply date filter
    if (dateFilter === 'week') {
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      filtered = filtered.filter(opp => 
        new Date(opp.date) <= oneWeekFromNow
      );
    } else if (dateFilter === 'month') {
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      filtered = filtered.filter(opp => 
        new Date(opp.date) <= oneMonthFromNow
      );
    }
    
    // Apply location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(opp => opp.location === locationFilter);
    }
    
    setFilteredOpportunities(filtered);
  }, [opportunities, selectedCategory, searchQuery, dateFilter, locationFilter]);

  const handleViewDetails = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setDetailsModalOpen(true);
  };

  const handleSignUp = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setSignupModalOpen(true);
  };

  const handleApply = async (opportunityId: string) => {
    if (!user?.uid) {
      setSnackbarMessage('Please log in to apply for opportunities');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    if (appliedOpportunities.includes(opportunityId)) {
      // Already applied, do nothing
      return;
    }
    
    setLoading(true);
    
    try {
      // Update volunteer profile with applied opportunity
      const volunteerRef = doc(db, 'volunteer_profiles', user.uid);
      await updateDoc(volunteerRef, {
        applied_opportunities: arrayUnion(opportunityId)
      });
      
      // Get opportunity details
      const opportunity = opportunities.find(opp => opp.id === opportunityId);
      
      // Send email notification to volunteer and director
      await sendSignupNotification(user, opportunity);
      
      // Update local state
      setAppliedOpportunities([...appliedOpportunities, opportunityId]);
      setSnackbarMessage('Successfully applied for the opportunity!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setSignupModalOpen(false);
    } catch (error) {
      console.error('Error applying for opportunity:', error);
      setSnackbarMessage('Failed to apply for the opportunity. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const sendSignupNotification = async (user: any, opportunity: Opportunity | undefined) => {
    if (!opportunity) return;
    
    try {
      // Create a notification document in Firestore
      const notificationRef = doc(collection(db, 'notifications'));
      await setDoc(notificationRef, {
        type: 'volunteer_signup',
        volunteer_id: user.id,
        volunteer_name: user.name,
        volunteer_email: user.email,
        opportunity_id: opportunity.id,
        opportunity_title: opportunity.title,
        opportunity_date: opportunity.date,
        message: message,
        created_at: new Date(),
        status: 'pending',
        recipient_emails: ['director@hopecaretz.org', user.email]
      });
      
      console.log('Notification created for volunteer signup');
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Volunteer Opportunities</h2>
          <button 
            className="flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-1 transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search opportunities..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
            />
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Dates</option>
                  <option value="week">Next 7 Days</option>
                  <option value="month">Next 30 Days</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
                >
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Opportunities List */}
        <div className="space-y-6">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((opportunity) => (
              <div 
                key={opportunity.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-rose-200 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{opportunity.title}</h3>
                    <p className="mt-2 text-gray-600">{opportunity.description}</p>
                  </div>
                  {opportunity.image && (
                    <img 
                      src={opportunity.image} 
                      alt={opportunity.title} 
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                    {opportunity.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                    {new Date(opportunity.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2 text-gray-400" />
                    {opportunity.duration} hours
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2 text-gray-400" />
                    Coordinator: {opportunity.coordinator}
                  </div>
                </div>

                {opportunity.skillsRequired && opportunity.skillsRequired.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Required Skills:</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {opportunity.skillsRequired.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-4">
                  <button 
                    className="text-gray-600 hover:text-gray-900 font-medium"
                    onClick={() => handleViewDetails(opportunity)}
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => appliedOpportunities.includes(opportunity.id) 
                      ? null 
                      : handleSignUp(opportunity)
                    }
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                      appliedOpportunities.includes(opportunity.id)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-rose-600 text-white hover:bg-rose-700'
                    }`}
                  >
                    {appliedOpportunities.includes(opportunity.id) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Applied
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setDateFilter('all');
                  setLocationFilter('all');
                }}
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        aria-labelledby="opportunity-details-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          {selectedOpportunity && (
            <>
              <Typography variant="h5" component="h2" gutterBottom>
                {selectedOpportunity.title}
              </Typography>
              
              {selectedOpportunity.image && (
                <Box sx={{ my: 2 }}>
                  <img 
                    src={selectedOpportunity.image} 
                    alt={selectedOpportunity.title} 
                    style={{ width: '100%', borderRadius: 8, maxHeight: 300, objectFit: 'cover' }}
                  />
                </Box>
              )}
              
              <Typography variant="body1" sx={{ mt: 2 }}>
                {selectedOpportunity.description}
              </Typography>
              
              <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MapPin size={18} style={{ marginRight: 8, color: '#6b7280' }} />
                  <Typography variant="body2">{selectedOpportunity.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Calendar size={18} style={{ marginRight: 8, color: '#6b7280' }} />
                  <Typography variant="body2">{new Date(selectedOpportunity.date).toLocaleDateString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Clock size={18} style={{ marginRight: 8, color: '#6b7280' }} />
                  <Typography variant="body2">{selectedOpportunity.duration} hours</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Users size={18} style={{ marginRight: 8, color: '#6b7280' }} />
                  <Typography variant="body2">Coordinator: {selectedOpportunity.coordinator}</Typography>
                </Box>
              </Box>
              
              {selectedOpportunity.skillsRequired && selectedOpportunity.skillsRequired.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>Required Skills:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedOpportunity.skillsRequired.map((skill: string, index: number) => (
                      <Box 
                        key={index}
                        sx={{ 
                          px: 1.5, 
                          py: 0.5, 
                          borderRadius: 10, 
                          bgcolor: 'grey.100', 
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        {skill}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setDetailsModalOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="contained"
                  color="primary"
                  disabled={appliedOpportunities.includes(selectedOpportunity.id)}
                  onClick={() => {
                    setDetailsModalOpen(false);
                    handleSignUp(selectedOpportunity);
                  }}
                  className={appliedOpportunities.includes(selectedOpportunity.id) ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                >
                  {appliedOpportunities.includes(selectedOpportunity.id) ? 'Already Applied' : 'Sign Up'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Sign Up Modal */}
      <Modal
        open={signupModalOpen}
        onClose={() => !loading && setSignupModalOpen(false)}
        aria-labelledby="opportunity-signup-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4
        }}>
          {selectedOpportunity && (
            <>
              <Typography variant="h5" component="h2" gutterBottom>
                Sign Up for {selectedOpportunity.title}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please confirm your interest in this volunteer opportunity. 
                An email notification will be sent to you and the volunteer coordinator.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Date: {new Date(selectedOpportunity.date).toLocaleDateString()}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Location: {selectedOpportunity.location}
                </Typography>
                <Typography variant="subtitle2">
                  Duration: {selectedOpportunity.duration} hours
                </Typography>
              </Box>
              
              <TextField
                label="Message (Optional)"
                multiline
                rows={4}
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add any additional information or questions you have about this opportunity..."
                variant="outlined"
                sx={{ mb: 3 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setSignupModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleApply(selectedOpportunity.id)}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Mail />}
                >
                  {loading ? 'Submitting...' : 'Confirm & Send Email'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default VolunteerOpportunities;