import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Typography,
  Chip,
  Autocomplete,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

interface ProfileEditorProps {
  userId: string;
  onUpdate?: () => void;
}

const SKILL_OPTIONS = [
  'Web Development',
  'Healthcare',
  'Education',
  'Project Management',
  'Social Work',
  'Fundraising',
  'Marketing',
  'Event Planning',
  'Leadership',
  'Communication',
];

const INTEREST_OPTIONS = [
  'Healthcare Access',
  'Education',
  'Community Development',
  'Youth Programs',
  'Elder Care',
  'Mental Health',
  'Environmental',
  'Social Justice',
  'Poverty Alleviation',
  'Emergency Response',
];

const ProfileEditor: React.FC<ProfileEditorProps> = ({ userId, onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    location: '',
    skills: [] as string[],
    interests: [] as string[],
    social_links: {
      linkedin: '',
      twitter: '',
      facebook: '',
    },
    // Donor-specific fields
    preferred_causes: [] as string[],
    tax_receipts_email: true,
    anonymous_donation: false,
    // Volunteer-specific fields
    availability: {
      weekdays: false,
      weekends: false,
      mornings: false,
      afternoons: false,
      evenings: false,
    },
    certifications: [] as string[],
    emergency_contact: {
      name: '',
      phone: '',
      relationship: '',
    },
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const profile = await userService.getUserWithProfile(userId);
      setFormData(prev => ({
        ...prev,
        ...profile,
        ...profile.user_profiles,
        ...(profile.donor_profile || {}),
        ...(profile.volunteer_profile || {}),
      }));
      setAvatarPreview(profile.avatar_url || '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setNotification({
        message: 'Failed to load profile',
        type: 'error',
      });
      setLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      let avatarUrl = formData.avatar_url;
      if (avatarFile) {
        // Upload avatar
        const filename = `${userId}-${Date.now()}-${avatarFile.name}`;
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filename, avatarFile);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filename);

        avatarUrl = publicUrl;
      }

      await userService.updateProfile(userId, {
        ...formData,
        avatar_url: avatarUrl,
      });

      setNotification({
        message: 'Profile updated successfully',
        type: 'success',
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        message: 'Failed to update profile',
        type: 'error',
      });
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
      <Card>
        <CardContent>
          <Grid container spacing={4}>
            {/* Avatar Section */}
            <Grid item xs={12} display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={avatarPreview}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
              >
                Upload Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </Button>
            </Grid>

            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={4}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                margin="normal"
              />
            </Grid>

            {/* Skills and Interests */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={SKILL_OPTIONS}
                value={formData.skills}
                onChange={(_, newValue) =>
                  setFormData({ ...formData, skills: newValue })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Skills" margin="normal" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={INTEREST_OPTIONS}
                value={formData.interests}
                onChange={(_, newValue) =>
                  setFormData({ ...formData, interests: newValue })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Interests" margin="normal" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
            </Grid>

            {/* Social Links */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Social Links
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    value={formData.social_links.linkedin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_links: {
                          ...formData.social_links,
                          linkedin: e.target.value,
                        },
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Twitter"
                    value={formData.social_links.twitter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_links: {
                          ...formData.social_links,
                          twitter: e.target.value,
                        },
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Facebook"
                    value={formData.social_links.facebook}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_links: {
                          ...formData.social_links,
                          facebook: e.target.value,
                        },
                      })
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
      >
        {notification && (
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.type}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </form>
  );
};

export default ProfileEditor; 