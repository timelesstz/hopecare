import { CMSProject, CMSDonationTier, CMSCategory } from '@/types/cms';

class CMSService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_CMS_API_URL || '';
    this.apiKey = process.env.CMS_API_KEY || '';
  }

  private async fetchFromCMS<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`CMS API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Project Methods
  async getProjects(params: { 
    status?: 'active' | 'completed' | 'draft',
    category?: string,
    limit?: number,
    offset?: number 
  } = {}): Promise<CMSProject[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    return this.fetchFromCMS<CMSProject[]>(`/projects?${queryParams.toString()}`);
  }

  async getProjectBySlug(slug: string): Promise<CMSProject> {
    return this.fetchFromCMS<CMSProject>(`/projects/${slug}`);
  }

  async getProjectById(id: string): Promise<CMSProject> {
    return this.fetchFromCMS<CMSProject>(`/projects/id/${id}`);
  }

  // Donation Tier Methods
  async getDonationTiers(projectId?: string): Promise<CMSDonationTier[]> {
    const endpoint = projectId 
      ? `/donation-tiers?projectId=${projectId}`
      : '/donation-tiers';
    return this.fetchFromCMS<CMSDonationTier[]>(endpoint);
  }

  async getDonationTierById(id: string): Promise<CMSDonationTier> {
    return this.fetchFromCMS<CMSDonationTier>(`/donation-tiers/${id}`);
  }

  // Category Methods
  async getCategories(): Promise<CMSCategory[]> {
    return this.fetchFromCMS<CMSCategory[]>('/categories');
  }

  async getCategoryBySlug(slug: string): Promise<CMSCategory> {
    return this.fetchFromCMS<CMSCategory>(`/categories/${slug}`);
  }

  // Analytics Methods
  async trackProjectView(projectId: string): Promise<void> {
    await this.fetchFromCMS('/analytics/project-view', {
      method: 'POST',
      body: JSON.stringify({ projectId, timestamp: new Date().toISOString() }),
    });
  }

  async updateProjectStats(projectId: string, stats: {
    donorCount?: number;
    raisedAmount?: number;
  }): Promise<void> {
    await this.fetchFromCMS(`/projects/${projectId}/stats`, {
      method: 'PATCH',
      body: JSON.stringify(stats),
    });
  }
}

export const cmsService = new CMSService();
