export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
}

export interface Outcome {
  metric: string;
  value: number | string;
  description: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    description: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'planned';
  location: string;
  budget: number;
  beneficiaries: number;
  startDate: string;
  endDate?: string;
  outcomes: Outcome[];
  timeline: TimelineEvent[];
  image?: string;
  tags: string[];
  team: {
    id: string;
    name: string;
    role: string;
    image?: string;
  }[];
  partners: {
    id: string;
    name: string;
    logo?: string;
    website?: string;
  }[];
  documents: {
    id: string;
    title: string;
    type: 'report' | 'proposal' | 'budget' | 'other';
    url: string;
  }[];
}
