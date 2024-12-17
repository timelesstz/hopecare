export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'planned';
  location: string;
  startDate: string;
  endDate?: string;
  budget: number;
  beneficiaries: number;
  image: string;
  category: 'education' | 'health' | 'economic' | 'community';
  objectives: string[];
  outcomes: {
    title: string;
    description: string;
    metrics?: {
      label: string;
      value: string | number;
    }[];
  }[];
  timeline: {
    date: string;
    title: string;
    description: string;
    status: 'completed' | 'in-progress' | 'upcoming';
  }[];
  partners?: string[];
  gallery?: string[];
}

export const activeProjects: Project[] = [
  {
    id: 'edu-001',
    title: 'Rural Education Enhancement Program',
    description: 'Improving access to quality education in rural communities through infrastructure development and teacher training.',
    status: 'active',
    location: 'Kisumu County',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    budget: 5000000,
    beneficiaries: 2500,
    image: '/images/projects/education-1.jpg',
    category: 'education',
    objectives: [
      'Build and equip 5 new classrooms',
      'Train 50 teachers in modern teaching methods',
      'Provide learning materials to 2500 students',
      'Establish digital learning centers'
    ],
    outcomes: [
      {
        title: 'Infrastructure Development',
        description: 'New classrooms and facilities built to improve learning environment',
        metrics: [
          { label: 'New Classrooms', value: 5 },
          { label: 'Digital Centers', value: 2 }
        ]
      },
      {
        title: 'Teacher Training',
        description: 'Enhanced teaching capabilities through modern methodology training',
        metrics: [
          { label: 'Teachers Trained', value: 50 },
          { label: 'Training Hours', value: 200 }
        ]
      }
    ],
    timeline: [
      {
        date: '2024-01',
        title: 'Project Launch',
        description: 'Initial assessment and community engagement',
        status: 'completed'
      },
      {
        date: '2024-03',
        title: 'Construction Phase',
        description: 'Building of new classrooms begins',
        status: 'in-progress'
      },
      {
        date: '2024-06',
        title: 'Teacher Training',
        description: 'Intensive training program for teachers',
        status: 'upcoming'
      }
    ],
    partners: [
      'Ministry of Education',
      'Local Community Leaders',
      'UNESCO'
    ]
  },
  {
    id: 'health-001',
    title: 'Community Health Outreach Initiative',
    description: 'Providing essential healthcare services and health education to underserved communities.',
    status: 'active',
    location: 'Mombasa County',
    startDate: '2024-02-01',
    budget: 3000000,
    beneficiaries: 5000,
    image: '/images/projects/health-1.jpg',
    category: 'health',
    objectives: [
      'Conduct regular health screenings',
      'Provide basic medical supplies',
      'Organize health education workshops',
      'Train community health workers'
    ],
    outcomes: [
      {
        title: 'Health Screenings',
        description: 'Regular health check-ups and disease prevention',
        metrics: [
          { label: 'People Screened', value: 2000 },
          { label: 'Health Camps', value: 15 }
        ]
      },
      {
        title: 'Community Education',
        description: 'Health awareness and prevention practices',
        metrics: [
          { label: 'Workshops Held', value: 25 },
          { label: 'Participants', value: 1500 }
        ]
      }
    ],
    timeline: [
      {
        date: '2024-02',
        title: 'Program Initiation',
        description: 'Community needs assessment and planning',
        status: 'completed'
      },
      {
        date: '2024-04',
        title: 'Health Camps',
        description: 'Regular health screening camps begin',
        status: 'in-progress'
      },
      {
        date: '2024-07',
        title: 'Impact Assessment',
        description: 'Evaluation of program effectiveness',
        status: 'upcoming'
      }
    ]
  }
];

export const pastProjects: Project[] = [
  {
    id: 'eco-001',
    title: 'Women Entrepreneurship Program',
    description: 'Empowering women through business skills training and microfinance support.',
    status: 'completed',
    location: 'Nairobi County',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    budget: 2000000,
    beneficiaries: 1000,
    image: '/images/projects/economic-1.jpg',
    category: 'economic',
    objectives: [
      'Train 1000 women in business skills',
      'Provide seed funding to 100 startups',
      'Establish mentorship programs',
      'Create market linkages'
    ],
    outcomes: [
      {
        title: 'Business Development',
        description: 'New businesses established and existing ones expanded',
        metrics: [
          { label: 'New Businesses', value: 100 },
          { label: 'Jobs Created', value: 300 }
        ]
      },
      {
        title: 'Skills Enhancement',
        description: 'Business and financial management skills improved',
        metrics: [
          { label: 'Women Trained', value: 1000 },
          { label: 'Training Hours', value: 500 }
        ]
      }
    ],
    timeline: [
      {
        date: '2023-01',
        title: 'Program Launch',
        description: 'Participant selection and initial training',
        status: 'completed'
      },
      {
        date: '2023-06',
        title: 'Business Launch',
        description: 'First batch of businesses launched',
        status: 'completed'
      },
      {
        date: '2023-12',
        title: 'Program Completion',
        description: 'Final assessment and graduation',
        status: 'completed'
      }
    ],
    partners: [
      'UN Women',
      'Local Banks',
      'Business Mentors Network'
    ],
    gallery: [
      '/images/projects/eco-001-1.jpg',
      '/images/projects/eco-001-2.jpg',
      '/images/projects/eco-001-3.jpg'
    ]
  }
];
