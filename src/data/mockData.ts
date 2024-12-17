import { Volunteer } from '../types/volunteer';

export const mockVolunteer: Volunteer = {
  id: '1',
  firstName: 'Emma',
  lastName: 'Parker',
  email: 'emma.parker@example.com',
  phone: '+255 769 297925',
  role: {
    id: 'program-lead',
    name: 'Program Lead',
    level: 'lead',
    permissions: [
      {
        resource: 'events',
        actions: ['view', 'create', 'edit', 'delete']
      },
      {
        resource: 'team',
        actions: ['view', 'create', 'edit']
      },
      {
        resource: 'reports',
        actions: ['view', 'create']
      },
      {
        resource: 'settings',
        actions: ['view', 'edit']
      }
    ]
  },
  joinDate: 'June 2023',
  skills: ['Teaching', 'First Aid', 'Event Planning'],
  languages: ['English', 'Swahili'],
  availability: {
    weekdays: true,
    weekends: true,
    evenings: true
  },
  status: 'active',
  impactScore: 850
};

export const mockEvents = [
  {
    id: '1',
    title: 'Community Health Workshop',
    date: '2024-03-20',
    time: '09:00-14:00',
    location: 'Arusha Community Center',
    role: 'Health Educator',
    teamSize: 5,
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Youth Mentoring Session',
    date: '2024-03-22',
    time: '15:00-17:00',
    location: 'Local School',
    role: 'Lead Mentor',
    teamSize: 3,
    status: 'upcoming'
  }
];

export const mockCertifications = [
  {
    id: '1',
    name: 'First Aid Certification',
    issuer: 'Red Cross Tanzania',
    date: '2023-06-15',
    expiryDate: '2024-06-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Community Health Worker',
    issuer: 'Ministry of Health',
    date: '2023-08-01',
    expiryDate: '2024-08-01',
    status: 'active'
  }
];