export interface CMSImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface CMSProject {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: CMSImage;
  gallery?: CMSImage[];
  category: string;
  location: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'draft';
  content: string;
  donationTiers: CMSDonationTier[];
  metadata?: Record<string, any>;
}

export interface CMSDonationTier {
  id: string;
  name: string;
  amount: number;
  description: string;
  benefits: string[];
  icon: 'heart' | 'users' | 'dollar' | 'star';
  popular?: boolean;
  projectId?: string;
  isCustom?: boolean;
  metadata?: Record<string, any>;
}

export interface CMSCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: CMSImage;
}
