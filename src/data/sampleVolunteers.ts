export const sampleVolunteers = [
  {
    email: "emma.parker@example.com",
    password: "Volunteer2024!",
    profile: {
      firstName: "Emma",
      lastName: "Parker",
      phone: "(555) 234-5678",
      birthDate: "1995-05-15",
      address: "789 Volunteer Ave, Anytown, ST 12345",
      availability: {
        weekdays: true,
        weekends: true,
        evenings: true
      },
      skills: ["Teaching", "First Aid", "Event Planning"],
      languages: ["English", "Spanish"],
      interests: ["Education", "Youth Programs"]
    },
    volunteerHistory: {
      hoursLogged: 150,
      eventsAttended: 25,
      startDate: "2023-06-15",
      status: "active",
      role: "Program Lead"
    }
  },
  {
    email: "michael.chen@example.com",
    password: "Community2024@",
    profile: {
      firstName: "Michael",
      lastName: "Chen",
      phone: "(555) 876-5432",
      birthDate: "1988-09-23",
      address: "456 Helper St, Springfield, ST 67890",
      availability: {
        weekdays: false,
        weekends: true,
        evenings: true
      },
      skills: ["Photography", "Social Media", "Gardening"],
      languages: ["English", "Mandarin"],
      interests: ["Environmental Projects", "Community Events"]
    },
    volunteerHistory: {
      hoursLogged: 75,
      eventsAttended: 12,
      startDate: "2024-01-10",
      status: "active",
      role: "Event Photographer"
    }
  },
  {
    email: "sofia.rodriguez@example.com",
    password: "Helping2024#",
    profile: {
      firstName: "Sofia",
      lastName: "Rodriguez",
      phone: "(555) 345-6789",
      birthDate: "1992-12-03",
      address: "123 Community Rd, Riverside, ST 13579",
      availability: {
        weekdays: true,
        weekends: false,
        evenings: true
      },
      skills: ["Healthcare", "Translation", "Administration"],
      languages: ["English", "Spanish", "Portuguese"],
      interests: ["Health Programs", "Senior Support"]
    },
    volunteerHistory: {
      hoursLogged: 200,
      eventsAttended: 35,
      startDate: "2023-03-20",
      status: "active",
      role: "Health Program Coordinator"
    }
  }
];

// Test account credentials for quick reference:
export const testAccounts = {
  programLead: {
    email: "emma.parker@example.com",
    password: "Volunteer2024!"
  },
  eventVolunteer: {
    email: "michael.chen@example.com",
    password: "Community2024@"
  },
  coordinator: {
    email: "sofia.rodriguez@example.com",
    password: "Helping2024#"
  }
};

export interface VolunteerRole {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
}

export const volunteerRoles: VolunteerRole[] = [
  {
    id: "program-lead",
    title: "Program Lead",
    description: "Lead and coordinate specific program activities and volunteers",
    requirements: [
      "Minimum 100 hours of volunteer experience",
      "Leadership skills",
      "Program-specific expertise"
    ],
    responsibilities: [
      "Coordinate program activities",
      "Train and mentor new volunteers",
      "Report program outcomes",
      "Ensure program goals are met"
    ]
  },
  {
    id: "event-volunteer",
    title: "Event Volunteer",
    description: "Support community events and activities",
    requirements: [
      "No prior experience required",
      "Enthusiasm and reliability",
      "Good communication skills"
    ],
    responsibilities: [
      "Assist with event setup and cleanup",
      "Welcome and guide participants",
      "Support event activities",
      "Document event highlights"
    ]
  },
  {
    id: "coordinator",
    title: "Program Coordinator",
    description: "Oversee program implementation and volunteer management",
    requirements: [
      "Minimum 150 hours of volunteer experience",
      "Strong organizational skills",
      "Previous leadership experience"
    ],
    responsibilities: [
      "Develop program schedules",
      "Coordinate volunteer assignments",
      "Monitor program progress",
      "Prepare reports and documentation"
    ]
  }
];