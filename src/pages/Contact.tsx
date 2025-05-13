import React, { useState } from 'react';
import { Send, Mail, Phone, MapPin, Globe, Clock, Calendar } from 'lucide-react';
import { 
  TextField, 
  Button, 
  Alert, 
  Snackbar, 
  CircularProgress, 
  Paper, 
  InputAdornment,
  Divider,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import AdminEditButton from '../components/AdminEditButton';
import PageHero from '../components/PageHero';
import OpenStreetMap from '../components/maps/OpenStreetMap';
import { submitContactForm, validateEmail, type ContactFormData } from '../services/contactService';

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      email: '',
      message: ''
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await submitContactForm(formData);
      setSnackbar({
        open: true,
        message: 'Message sent successfully! We will get back to you soon.',
        severity: 'success'
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again later.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // HopeCare Tanzania office coordinates (Arusha)
  const mapCenter = {
    lat: -3.3731,
    lng: 36.6941
  };

  const theme = useTheme();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminEditButton pageId="contact" />
      <PageHero
        title="Contact Us"
        subtitle="Get in touch with us. We're here to help and answer any questions you may have."
        image="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&auto=format&fit=crop&q=80"
      />

      <Box className="container mx-auto px-4 py-16">
        {/* Section Title */}
        <Box className="text-center mb-12">
          <Typography variant="h4" component="h2" className="font-bold mb-3" color="primary">
            How Can We Help You?
          </Typography>
          <Divider className="w-24 mx-auto my-4" sx={{ borderColor: theme.palette.primary.main, borderWidth: 2 }} />
          <Typography variant="body1" className="max-w-2xl mx-auto text-gray-600 text-center">
            Whether you have questions about our programs, want to volunteer, or are interested in making a donation,
            we're eager to hear from you. Your message makes a difference.
          </Typography>
        </Box>

        <Box className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Card */}
          <Paper elevation={3} className="p-8 lg:col-span-1 transform transition duration-300 hover:shadow-xl">
            <Typography variant="h5" component="h3" className="font-bold mb-6 pb-3 border-b border-gray-200">
              Contact Information
            </Typography>
            
            <Box className="space-y-6">
              <Box className="flex items-start space-x-4">
                <MapPin className="text-rose-600 mt-1" size={20} />
                <Box>
                  <Typography variant="subtitle1" className="font-semibold">Address</Typography>
                  <Typography variant="body2">New Safari Hotel, 402</Typography>
                  <Typography variant="body2">Boma Road</Typography>
                  <Typography variant="body2">P.O Box 303</Typography>
                  <Typography variant="body2">Arusha-Tanzania</Typography>
                </Box>
              </Box>
              
              <Box className="flex items-start space-x-4">
                <Phone className="text-rose-600 mt-1" size={20} />
                <Box>
                  <Typography variant="subtitle1" className="font-semibold">Phone</Typography>
                  <Typography variant="body2">
                    Tel/Fax: <a href="tel:+255272509720" className="text-rose-600 hover:underline">+255 (0) 27 2509720</a>
                  </Typography>
                  <Typography variant="body2">
                    Mobile: <a href="tel:+255742484571" className="text-rose-600 hover:underline">+255 742 484 571</a>
                  </Typography>
                </Box>
              </Box>
              
              <Box className="flex items-start space-x-4">
                <Mail className="text-rose-600 mt-1" size={20} />
                <Box>
                  <Typography variant="subtitle1" className="font-semibold">Email</Typography>
                  <Typography variant="body2">
                    <a href="mailto:director@hopecaretz.org" className="text-rose-600 hover:underline">
                      director@hopecaretz.org
                    </a>
                  </Typography>
                </Box>
              </Box>
              
              <Box className="flex items-start space-x-4">
                <Globe className="text-rose-600 mt-1" size={20} />
                <Box>
                  <Typography variant="subtitle1" className="font-semibold">Website</Typography>
                  <Typography variant="body2">
                    <a href="https://www.hopecaretz.org" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline">
                      www.hopecaretz.org
                    </a>
                  </Typography>
                </Box>
              </Box>
              
              <Box className="flex items-start space-x-4">
                <Clock className="text-rose-600 mt-1" size={20} />
                <Box>
                  <Typography variant="subtitle1" className="font-semibold">Office Hours</Typography>
                  <Typography variant="body2"><span className="font-medium">Monday - Friday:</span> 8:00 AM - 5:00 PM</Typography>
                  <Typography variant="body2"><span className="font-medium">Saturday:</span> 9:00 AM - 1:00 PM</Typography>
                  <Typography variant="body2"><span className="font-medium">Sunday:</span> Closed</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Contact Form Card */}
          <Paper elevation={3} className="p-8 lg:col-span-2 transform transition duration-300 hover:shadow-xl">
            <Typography variant="h5" component="h3" className="font-bold mb-6 pb-3 border-b border-gray-200">
              Send us a Message
            </Typography>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  fullWidth
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="text-gray-400">👤</span>
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
                
                <TextField
                  fullWidth
                  label="Your Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="text-gray-400">✉️</span>
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Box>
              
              <TextField
                fullWidth
                label="Your Message"
                name="message"
                multiline
                rows={6}
                value={formData.message}
                onChange={handleChange}
                error={!!errors.message}
                helperText={errors.message}
                required
                disabled={loading}
                variant="outlined"
                placeholder="How can we help you?"
              />
              
              <Box className="flex justify-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                  sx={{ 
                    borderRadius: '8px', 
                    padding: '10px 24px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                    }
                  }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>

        {/* Mission Statement */}
        <Paper elevation={2} className="mt-12 p-8 bg-gradient-to-r from-rose-50 to-rose-100 border-l-4 border-rose-500">
          <Typography variant="h5" component="h3" className="font-bold mb-4">
            Our Mission
          </Typography>
          <Typography variant="body1" className="text-gray-700 leading-relaxed">
            Easing the pain of poverty in Tanzania through sustainable community development programs.
            We work tirelessly to create lasting change in communities through education, healthcare,
            and economic empowerment initiatives. Your support makes our work possible.
          </Typography>
        </Paper>
      </Box>

      {/* Map Section with Title */}
      <Box className="bg-gray-100 py-12">
        <Box className="container mx-auto px-4">
          <Typography variant="h4" component="h2" className="text-center font-bold mb-2" color="primary">
            Visit Our Office
          </Typography>
          <Typography variant="body1" className="text-center mb-8 text-gray-600">
            We're located in the heart of Arusha, Tanzania
          </Typography>
          <Paper elevation={3} className="rounded-lg overflow-hidden">
            <Box className="w-full h-[500px] relative">
              <OpenStreetMap center={mapCenter} zoom={15} markerTitle="HopeCare Tanzania Office" />
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Contact;