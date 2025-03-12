import { useState, useEffect } from 'react';
import { Bell, Clock, Shield, User, Save, Loader, Plus, X, Check } from 'lucide-react';
import { Volunteer } from '../../types/volunteer';
import { Alert, AlertTitle, Snackbar, TextField, Chip, FormControlLabel, Checkbox, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useUpdateVolunteerProfile } from '../../hooks/useUpdateVolunteerProfile';

interface VolunteerSettingsProps {
  volunteer: Volunteer;
  refreshData?: () => Promise<void>;
}

const VolunteerSettings: React.FC<VolunteerSettingsProps> = ({ volunteer, refreshData }) => {
  // Form state
  const [firstName, setFirstName] = useState(volunteer.firstName || '');
  const [lastName, setLastName] = useState(volunteer.lastName || '');
  const [email, setEmail] = useState(volunteer.email || '');
  const [phone, setPhone] = useState(volunteer.phone || '');
  const [weekdays, setWeekdays] = useState(volunteer.availability?.weekdays === true);
  const [weekends, setWeekends] = useState(volunteer.availability?.weekends === true);
  const [evenings, setEvenings] = useState(volunteer.availability?.evenings === true);
  const [skills, setSkills] = useState<string[]>(volunteer.skills || []);
  const [languages, setLanguages] = useState<string[]>(volunteer.languages || []);
  
  // Form validation
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  // New skill/language dialog
  const [newSkillDialogOpen, setNewSkillDialogOpen] = useState(false);
  const [newLanguageDialogOpen, setNewLanguageDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  
  // Form state tracking
  const [formChanged, setFormChanged] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Update form values when volunteer prop changes
  useEffect(() => {
    setFirstName(volunteer.firstName || '');
    setLastName(volunteer.lastName || '');
    setEmail(volunteer.email || '');
    setPhone(volunteer.phone || '');
    setWeekdays(volunteer.availability?.weekdays === true);
    setWeekends(volunteer.availability?.weekends === true);
    setEvenings(volunteer.availability?.evenings === true);
    setSkills(volunteer.skills || []);
    setLanguages(volunteer.languages || []);
    setFormChanged(false);
  }, [volunteer]);
  
  // Track form changes
  useEffect(() => {
    const hasChanged = 
      firstName !== (volunteer.firstName || '') ||
      lastName !== (volunteer.lastName || '') ||
      phone !== (volunteer.phone || '') ||
      weekdays !== (volunteer.availability?.weekdays === true) ||
      weekends !== (volunteer.availability?.weekends === true) ||
      evenings !== (volunteer.availability?.evenings === true) ||
      JSON.stringify(skills) !== JSON.stringify(volunteer.skills || []) ||
      JSON.stringify(languages) !== JSON.stringify(volunteer.languages || []);
    
    setFormChanged(hasChanged);
  }, [firstName, lastName, phone, weekdays, weekends, evenings, skills, languages, volunteer]);
  
  const { updateProfile, loading, error, success, setError } = useUpdateVolunteerProfile({ refreshData });

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
    
    await updateProfile(volunteer.id, {
      firstName,
      lastName,
      phone,
      availability: {
        weekdays: weekdays === true,
        weekends: weekends === true,
        evenings: evenings === true
      },
      skills,
      languages
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
    setFirstName(volunteer.firstName || '');
    setLastName(volunteer.lastName || '');
    setEmail(volunteer.email || '');
    setPhone(volunteer.phone || '');
    setWeekdays(volunteer.availability?.weekdays === true);
    setWeekends(volunteer.availability?.weekends === true);
    setEvenings(volunteer.availability?.evenings === true);
    setSkills(volunteer.skills || []);
    setLanguages(volunteer.languages || []);
    setFirstNameError('');
    setLastNameError('');
    setPhoneError('');
  };
  
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
    setNewSkillDialogOpen(false);
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };
  
  const handleAddLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage('');
    }
    setNewLanguageDialogOpen(false);
  };
  
  const handleRemoveLanguage = (languageToRemove: string) => {
    setLanguages(languages.filter(language => language !== languageToRemove));
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
        </div>
      </div>

      {/* Skills & Languages */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Skills & Languages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Skills</label>
              <button 
                type="button"
                onClick={() => setNewSkillDialogOpen(true)}
                className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Skill
              </button>
            </div>
            <div className="min-h-[100px] p-3 border border-gray-300 rounded-md">
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={() => handleRemoveSkill(skill)}
                      color="primary"
                      size="small"
                      sx={{ bgcolor: '#fecdd3', color: '#be123c', '& .MuiChip-deleteIcon': { color: '#be123c' } }}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills added yet</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Languages</label>
              <button 
                type="button"
                onClick={() => setNewLanguageDialogOpen(true)}
                className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Language
              </button>
            </div>
            <div className="min-h-[100px] p-3 border border-gray-300 rounded-md">
              <div className="flex flex-wrap gap-2">
                {languages.length > 0 ? (
                  languages.map((language, index) => (
                    <Chip
                      key={index}
                      label={language}
                      onDelete={() => handleRemoveLanguage(language)}
                      color="primary"
                      size="small"
                      sx={{ bgcolor: '#dbeafe', color: '#1e40af', '& .MuiChip-deleteIcon': { color: '#1e40af' } }}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No languages added yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Availability</h3>
        <div className="space-y-4">
          <FormControlLabel
            control={
              <Checkbox
                checked={weekdays}
                onChange={(e) => setWeekdays(e.target.checked)}
                color="primary"
              />
            }
            label="Available on Weekdays"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={weekends}
                onChange={(e) => setWeekends(e.target.checked)}
                color="primary"
              />
            }
            label="Available on Weekends"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={evenings}
                onChange={(e) => setEvenings(e.target.checked)}
                color="primary"
              />
            }
            label="Available in Evenings"
          />
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
        <div className="space-y-4">
          <FormControlLabel
            control={<Checkbox defaultChecked color="primary" />}
            label="Event Reminders"
          />
          <FormControlLabel
            control={<Checkbox defaultChecked color="primary" />}
            label="Team Updates"
          />
          <FormControlLabel
            control={<Checkbox defaultChecked color="primary" />}
            label="Certification Expiry Alerts"
          />
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h3>
        <div className="space-y-4">
          <FormControlLabel
            control={<Checkbox defaultChecked color="primary" />}
            label="Show profile to other volunteers"
          />
          <FormControlLabel
            control={<Checkbox defaultChecked color="primary" />}
            label="Allow team members to contact me"
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
      
      {/* Add Skill Dialog */}
      <Dialog open={newSkillDialogOpen} onClose={() => setNewSkillDialogOpen(false)}>
        <DialogTitle>Add New Skill</DialogTitle>
        <DialogContent>
          <div className="flex items-center mt-2">
            <TextField
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              size="small"
              className="mr-2"
            />
            <Button 
              onClick={handleAddSkill} 
              variant="primary"
              size="sm"
            >
              Add
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewSkillDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Language Dialog */}
      <Dialog open={newLanguageDialogOpen} onClose={() => setNewLanguageDialogOpen(false)}>
        <DialogTitle>Add New Language</DialogTitle>
        <DialogContent>
          <div className="flex items-center mt-2">
            <TextField
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Add a language"
              size="small"
              className="mr-2"
            />
            <Button 
              onClick={handleAddLanguage} 
              variant="primary"
              size="sm"
            >
              Add
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewLanguageDialogOpen(false)}>Cancel</Button>
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

export default VolunteerSettings;