import React, { useState } from 'react';
import { Send, Mail, Phone, MapPin, Globe, Loader2 } from 'lucide-react';
import { TextField, Button, Alert, Snackbar, CircularProgress, Paper } from '@mui/material';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminEditButton pageId="contact" />
      <PageHero
        title="Contact Us"
        subtitle="Get in touch with us. We're here to help and answer any questions you may have."
        image="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&auto=format&fit=crop&q=80"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Paper elevation={3} className="p-8">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Message"
                name="message"
                multiline
                rows={4}
                value={formData.message}
                onChange={handleChange}
                error={!!errors.message}
                helperText={errors.message}
                required
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Paper>

          {/* Contact Information */}
          <Paper elevation={3} className="p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p>New Safari Hotel, 402</p>
                    <p>Boma Road</p>
                    <p>P.O Box 303</p>
                    <p>Arusha-Tanzania</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p>Tel/Fax: <a href="tel:+255272509720" className="text-primary hover:underline">+255 (0) 27 2509720</a></p>
                    <p>Mobile: <a href="tel:+255742484571" className="text-primary hover:underline">+255 742 484 571</a></p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Mail className="text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:director@hopecaretz.org" className="text-primary hover:underline">
                    director@hopecaretz.org
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Globe className="text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Website</p>
                    <a href="https://www.hopecaretz.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      www.hopecaretz.org
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                Easing the pain of poverty in Tanzania through sustainable community development programs.
                We work tirelessly to create lasting change in communities through education, healthcare,
                and economic empowerment initiatives.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Office Hours</h2>
              <div className="space-y-2">
                <p><span className="font-semibold">Monday - Friday:</span> 8:00 AM - 5:00 PM</p>
                <p><span className="font-semibold">Saturday:</span> 9:00 AM - 1:00 PM</p>
                <p><span className="font-semibold">Sunday:</span> Closed</p>
              </div>
            </div>
          </Paper>
        </div>
      </div>

      {/* Map Section */}
      <div className="w-full h-[500px] mt-12 relative">
        <OpenStreetMap center={mapCenter} zoom={15} />
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Contact;