import { useState, useEffect } from 'react';
import { Bell, Clock, Shield, User, Save, Loader, Plus, X, Check } from 'lucide-react';
import { Donor } from '../../types/donor';
import { Alert, AlertTitle, Snackbar, TextField, Chip, FormControlLabel, Checkbox, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { useUpdateDonorProfile } from '../../hooks/useUpdateDonorProfile';

interface DonorSettingsProps {
  donor: Donor;
  refreshData?: () => Promise<void>;
}

// Available causes for donors to select
const AVAILABLE_CAUSES = [
  'Education',
  'Health',
  'Environment',
  'Poverty',
  'Disaster Relief',
  'Animal Welfare',
  'Arts & Culture',
  'Human Rights',
  'Community Development',
  'Children & Youth'
];

// Donation frequency options
const DONATION_FREQUENCIES = [
  { value: 'one-time', label: 'One-time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' }
];

const DonorSettings: React.FC<DonorSettingsProps> = ({ donor, refreshData }) => {
  // Form state
  const [firstName, setFirstName] = useState(donor.firstName || '');
  const [lastName, setLastName] = useState(donor.lastName || '');
  const [email, setEmail] = useState(donor.email || '');
  const [phone, setPhone] = useState(donor.phone || '');
  const [address, setAddress] = useState(donor.address || '');
  const [preferredCauses, setPreferredCauses] = useState<string[]>(donor.preferredCauses || []);
  const [donationFrequency, setDonationFrequency] = useState(donor.donationFrequency || 'one-time');
  const [isAnonymous, setIsAnonymous] = useState(donor.isAnonymous === true);
  const [receiveUpdates, setReceiveUpdates] = useState(donor.receiveUpdates !== false); // Default to true if not set
  
  // Form validation
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  // New cause dialog
  const [newCauseDialogOpen, setNewCauseDialogOpen] = useState(false);
  const [newCause, setNewCause] = useState('');
  
  // Form state tracking
  const [formChanged, setFormChanged] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Update form values when donor prop changes
  useEffect(() => {
    setFirstName(donor.firstName || '');
    setLastName(donor.lastName || '');
    setEmail(donor.email || '');
    setPhone(donor.phone || '');
    setAddress(donor.address || '');
    setPreferredCauses(donor.preferredCauses || []);
    setDonationFrequency(donor.donationFrequency || 'one-time');
    setIsAnonymous(donor.isAnonymous === true);
    setReceiveUpdates(donor.receiveUpdates !== false);
    setFormChanged(false);
  }, [donor]);
  
  // Track form changes
  useEffect(() => {
    const hasChanged = 
      firstName !== (donor.firstName || '') ||
      lastName !== (donor.lastName || '') ||
      phone !== (donor.phone || '') ||
      address !== (donor.address || '') ||
      donationFrequency !== (donor.donationFrequency || 'one-time') ||
      isAnonymous !== (donor.isAnonymous === true) ||
      receiveUpdates !== (donor.receiveUpdates !== false) ||
      JSON.stringify(preferredCauses) !== JSON.stringify(donor.preferredCauses || []);
    
    setFormChanged(hasChanged);
  }, [firstName, lastName, phone, address, preferredCauses, donationFrequency, isAnonymous, receiveUpdates, donor]);
  
  const { updateProfile, loading, error, success, setError } = useUpdateDonorProfile({ refreshData });

  const validateForm = () => {
    let isValid = true;
    
    // Validate first name
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    } else {
      setFirstNameError('');
    }
    
    // Validate last name
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    } else {
      setLastNameError('');
    }
    
    // Validate phone (optional but must be valid if provided)
    if (phone.trim() && !/^\+?[0-9\s\-()]{10,15}$/.test(phone.trim())) {
      setPhoneError('Please enter a valid phone number');
      isValid = false;
    } else {
      setPhoneError('');
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await updateProfile(donor.id, {
      firstName,
      lastName,
      phone,
      address,
      preferredCauses,
      donationFrequency,
      isAnonymous,
      receiveUpdates
    });
  };
  
  const handleCancel = () => {
    if (formChanged) {
      setConfirmDialogOpen(true);
    } else {
      resetForm();
    }
  };
  
  const resetForm = () => {
    setFirstName(donor.firstName || '');
    setLastName(donor.lastName || '');
    setEmail(donor.email || '');
    setPhone(donor.phone || '');
    setAddress(donor.address || '');
    setPreferredCauses(donor.preferredCauses || []);
    setDonationFrequency(donor.donationFrequency || 'one-time');
    setIsAnonymous(donor.isAnonymous === true);
    setReceiveUpdates(donor.receiveUpdates !== false);
    setFirstNameError('');
    setLastNameError('');
    setPhoneError('');
  };
  
  const handleAddCause = () => {
    if (newCause.trim() && !preferredCauses.includes(newCause.trim())) {
      setPreferredCauses([...preferredCauses, newCause.trim()]);
      setNewCause('');
    }
    setNewCauseDialogOpen(false);
  };
  
  const handleRemoveCause = (causeToRemove: string) => {
    setPreferredCauses(preferredCauses.filter(cause => cause !== causeToRemove));
  };
  
  const handleSelectCause = (cause: string) => {
    if (!preferredCauses.includes(cause)) {
      setPreferredCauses([...preferredCauses, cause]);
    } else {
      handleRemoveCause(cause);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        message="Profile updated successfully"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      
      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              required
              error={!!firstNameError}
              helperText={firstNameError}
              variant="outlined"
              size="small"
            />
          </div>
          <div>
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              required
              error={!!lastNameError}
              helperText={lastNameError}
              variant="outlined"
              size="small"
            />
          </div>
          <div>
            <TextField
              label="Email"
              value={email}
              disabled
              fullWidth
              variant="outlined"
              size="small"
              helperText="Email cannot be changed"
            />
          </div>
          <div>
            <TextField
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              error={!!phoneError}
              helperText={phoneError || "Format: +1234567890"}
              variant="outlined"
              size="small"
            />
          </div>
          <div className="md:col-span-2">
            <TextField
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              size="small"
            />
          </div>
        </div>
      </div>

      {/* Donation Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Donation Preferences</h3>
        <div className="space-y-6">
          <div>
            <FormControl fullWidth size="small">
              <InputLabel id="donation-frequency-label">Donation Frequency</InputLabel>
              <Select
                labelId="donation-frequency-label"
                value={donationFrequency}
                label="Donation Frequency"
                onChange={(e) => setDonationFrequency(e.target.value)}
              >
                {DONATION_FREQUENCIES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>How often you prefer to donate</FormHelperText>
            </FormControl>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Preferred Causes</label>
              <button 
                type="button"
                onClick={() => setNewCauseDialogOpen(true)}
                className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Custom Cause
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
              {AVAILABLE_CAUSES.map((cause) => (
                <Chip
                  key={cause}
                  label={cause}
                  onClick={() => handleSelectCause(cause)}
                  color={preferredCauses.includes(cause) ? "primary" : "default"}
                  variant={preferredCauses.includes(cause) ? "filled" : "outlined"}
                  sx={{ 
                    bgcolor: preferredCauses.includes(cause) ? '#fecdd3' : 'transparent',
                    color: preferredCauses.includes(cause) ? '#be123c' : 'inherit',
                    borderColor: preferredCauses.includes(cause) ? '#be123c' : 'inherit',
                    '&:hover': { bgcolor: preferredCauses.includes(cause) ? '#fecaca' : '#f5f5f5' }
                  }}
                />
              ))}
            </div>
            <div className="min-h-[60px] p-3 border border-gray-300 rounded-md">
              <div className="flex flex-wrap gap-2">
                {preferredCauses.length > 0 ? (
                  preferredCauses
                    .filter(cause => !AVAILABLE_CAUSES.includes(cause))
                    .map((cause, index) => (
                      <Chip
                        key={index}
                        label={cause}
                        onDelete={() => handleRemoveCause(cause)}
                        color="primary"
                        size="small"
                        sx={{ bgcolor: '#fecdd3', color: '#be123c', '& .MuiChip-deleteIcon': { color: '#be123c' } }}
                      />
                    ))
                ) : (
                  <p className="text-gray-500 text-sm">No custom causes added</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h3>
        <div className="space-y-4">
          <FormControlLabel
            control={
              <Checkbox
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                color="primary"
              />
            }
            label="Make my donations anonymous"
          />
          <FormHelperText className="ml-8 -mt-2">Your name will not be displayed publicly with your donations</FormHelperText>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={receiveUpdates}
                onChange={(e) => setReceiveUpdates(e.target.checked)}
                color="primary"
              />
            }
            label="Receive updates about projects I've supported"
          />
          <FormHelperText className="ml-8 -mt-2">We'll send you occasional updates about the impact of your donations</FormHelperText>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
        <div className="space-y-4">
          <FormControlLabel
            control={<Checkbox defaultChecked color="primary" />}
            label="Donation Receipts"
          />
          <FormControlLabel
            control={<Checkbox defaultChecked color="primary" />}
            label="Project Updates"
          />
          <FormControlLabel
            control={<Checkbox defaultChecked color="primary" />}
            label="New Project Alerts"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button 
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
          icon={<X className="h-4 w-4" />}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          disabled={loading || !formChanged}
          icon={loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          className="bg-rose-700 hover:bg-rose-800"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      
      {/* Add Custom Cause Dialog */}
      <Dialog open={newCauseDialogOpen} onClose={() => setNewCauseDialogOpen(false)}>
        <DialogTitle>Add Custom Cause</DialogTitle>
        <DialogContent>
          <div className="flex items-center mt-2">
            <TextField
              value={newCause}
              onChange={(e) => setNewCause(e.target.value)}
              placeholder="Enter a cause"
              size="small"
              className="mr-2"
            />
            <Button 
              onClick={handleAddCause} 
              variant="primary"
              size="sm"
            >
              Add
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCauseDialogOpen(false)} variant="outline">Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Cancel Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <p>You have unsaved changes. Are you sure you want to discard them?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>No, Keep Editing</Button>
          <Button 
            onClick={() => {
              resetForm();
              setConfirmDialogOpen(false);
            }} 
            color="error"
          >
            Yes, Discard Changes
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default DonorSettings; 