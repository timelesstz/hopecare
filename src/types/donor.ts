import { z } from 'zod';

export const donorSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    phone: z.string().min(10, 'Valid phone number is required'),
    birthDate: z.string()
  }),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().min(5, 'Postal code is required'),
    country: z.string().min(2, 'Country is required')
  }),
  preferences: z.object({
    interests: z.array(z.string()).min(1, 'Select at least one interest'),
    communication: z.enum(['email', 'phone', 'both']),
    newsletter: z.boolean(),
    taxReceipts: z.boolean()
  }),
  payment: z.object({
    cardName: z.string().min(2, 'Name on card is required'),
    cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number'),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date'),
    cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV')
  })
});

export type DonorFormData = z.infer<typeof donorSchema>;

export interface DonorRegistrationStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}