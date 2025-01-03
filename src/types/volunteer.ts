import { z } from 'zod';

export const volunteerSchema = z.object({
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
  birthDate: z.string(),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  availability: z.object({
    weekdays: z.boolean(),
    weekends: z.boolean(),
    evenings: z.boolean()
  }),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    relationship: z.string().min(2, 'Relationship is required')
  })
});

export type VolunteerFormData = z.infer<typeof volunteerSchema>;

export interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: VolunteerRole;
  joinDate: string;
  skills: string[];
  languages: string[];
  availability: Availability;
  status: 'active' | 'inactive' | 'pending';
  impactScore: number;
}

export interface Availability {
  weekdays: boolean;
  weekends: boolean;
  evenings: boolean;
}

export interface VolunteerRole {
  id: string;
  name: string;
  level: 'junior' | 'senior' | 'lead' | 'coordinator';
  permissions: Permission[];
}

export interface Permission {
  resource: 'events' | 'team' | 'reports' | 'settings';
  actions: ('view' | 'create' | 'edit' | 'delete')[];
}