import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { volunteerService } from '../../services/volunteerService';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { ImageProcessor } from '../../utils/imageProcessor';

interface ProfileManagerProps {
  userId: string;
  onUpdate?: () => void;
}

const AVAILABLE_SKILLS = [
  'First Aid',
  'CPR',
  'Teaching',
  'Counseling',
  'Event Planning',
  'Social Media',
  'Photography',
  'Translation',
  'Medical',
  'Administrative',
];

const AVAILABLE_INTERESTS = [
  'Healthcare',
  'Education',
  'Environment',
  'Youth',
  'Elderly Care',
  'Mental Health',
  'Community Development',
  'Crisis Response',
];

const ProfileManager: React.FC<ProfileManagerProps> = ({ userId, onUpdate }) => {
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [profile, setProfile] = useState({
    skills: [] as string[],
    certifications: [] as string[],
    areas_of_interest: [] as string[],
    availability: {
      weekdays: [] as string[],
      weekends: false,
      preferred_hours: [] as string[],
    },
    emergency_contact: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await volunteerService.getVolunteerProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const url = await ImageProcessor.uploadProfileImage(userId, file, file.type);
      onUpdate?.();
      setSuccess(true);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      setSaving(true);
      await volunteerService.updateVolunteerProfile(userId, profile);
      setSuccess(true);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Avatar Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={user?.avatar_url}
                  sx={{ width: 100, height: 100 }}
                />
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={saving}
                  >
                    Change Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Recommended: Square image, at least 200x200px
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Skills & Interests */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skills & Interests
              </Typography>
              
              <Autocomplete
                multiple
                options={AVAILABLE_SKILLS}
                value={profile.skills}
                onChange={(_, newValue) =>
                  setProfile({ ...profile, skills: newValue })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Skills"
                    placeholder="Add skills"
                    margin="normal"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                }
              />

              <Autocomplete
                multiple
                options={AVAILABLE_INTERESTS}
                value={profile.areas_of_interest}
                onChange={(_, newValue) =>
                  setProfile({ ...profile, areas_of_interest: newValue })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Areas of Interest"
                    placeholder="Add interests"
                    margin="normal"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      color="secondary"
                      variant="outlined"
                    />
                  ))
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Availability */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Availability
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Weekday Availability</InputLabel>
                <Select
                  multiple
                  value={profile.availability.weekdays}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      availability: {
                        ...profile.availability,
                        weekdays: e.target.value as string[],
                      },
                    })
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="Monday">Monday</MenuItem>
                  <MenuItem value="Tuesday">Tuesday</MenuItem>
                  <MenuItem value="Wednesday">Wednesday</MenuItem>
                  <MenuItem value="Thursday">Thursday</MenuItem>
                  <MenuItem value="Friday">Friday</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Preferred Hours</InputLabel>
                <Select
                  multiple
                  value={profile.availability.preferred_hours}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      availability: {
                        ...profile.availability,
                        preferred_hours: e.target.value as string[],
                      },
                    })
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="morning">Morning (8AM-12PM)</MenuItem>
                  <MenuItem value="afternoon">Afternoon (12PM-5PM)</MenuItem>
                  <MenuItem value="evening">Evening (5PM-9PM)</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Emergency Contact */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    value={profile.emergency_contact.name}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        emergency_contact: {
                          ...profile.emergency_contact,
                          name: e.target.value,
                        },
                      })
                    }
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    value={profile.emergency_contact.relationship}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        emergency_contact: {
                          ...profile.emergency_contact,
                          relationship: e.target.value,
                        },
                      })
                    }
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profile.emergency_contact.phone}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        emergency_contact: {
                          ...profile.emergency_contact,
                          phone: e.target.value,
                        },
                      })
                    }
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profile.emergency_contact.email}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        emergency_contact: {
                          ...profile.emergency_contact,
                          email: e.target.value,
                        },
                      })
                    }
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => fetchProfile()}
              disabled={saving}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Grid>

        {/* Notifications */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Grid>
        )}
        {success && (
          <Grid item xs={12}>
            <Alert severity="success" onClose={() => setSuccess(false)}>
              Profile updated successfully
            </Alert>
          </Grid>
        )}
      </Grid>
    </form>
  );
};

export default ProfileManager; 