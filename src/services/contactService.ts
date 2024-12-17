import axios from 'axios';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const submitContactForm = async (formData: ContactFormData) => {
  try {
    const response = await axios.post(`${API_URL}/api/contact`, formData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to submit contact form');
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
