import { supabase } from '@/lib/supabaseClient';

export interface AnalyticsDateRange {
  startDate: Date;
  endDate: Date;
}

export interface DonationAnalytics {
  donationsByMonth: {
    month: string;
    amount: number;
    count: number;
  }[];
  donationsByProject: {
    name: string;
    value: number;
  }[];
  donorRetention: {
    month: string;
    newDonors: number;
    returningDonors: number;
  }[];
  impactMetrics: {
    livesImpacted: number;
    projectsSupported: number;
    communitiesServed: number;
    totalRaised: number;
  };
  topDonors: {
    name: string;
    totalDonated: number;
    lastDonation: string;
    donationCount: number;
  }[];
  donationGrowth: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  averageDonation: number;
  recurringDonors: number;
  donorGrowth: number;
}

export interface ComparisonData {
  dateRange: AnalyticsDateRange;
  analytics: DonationAnalytics;
}

class AnalyticsService {
  async getDonationAnalytics(dateRange: AnalyticsDateRange): Promise<DonationAnalytics> {
    const { startDate, endDate } = dateRange;

    // Get donations within date range
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select(`
        amount,
        created_at,
        project:projects(id, name),
        donor:donors(id, first_donation_date)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (donationsError) {
      console.error('Error fetching donations:', donationsError);
      throw donationsError;
    }

    // Get projects data
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        lives_impacted,
        communities_served
      `);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }

    // Process donations by month
    const donationsByMonth = this.processDonationsByMonth(donations);

    // Process donations by project
    const donationsByProject = this.processDonationsByProject(donations);

    // Process donor retention
    const donorRetention = this.processDonorRetention(donations);

    // Calculate impact metrics
    const impactMetrics = this.calculateImpactMetrics(donations, projects);

    // Calculate top donors
    const topDonors = this.calculateTopDonors(donations);

    // Calculate donation growth
    const donationGrowth = await this.calculateGrowthMetrics(donations);

    // Calculate average donation
    const averageDonation = this.calculateAverageDonation(donations);

    // Calculate recurring donors
    const recurringDonors = this.calculateRecurringDonors(donations);

    // Calculate donor growth
    const donorGrowth = this.calculateDonorGrowth(donations);

    return {
      donationsByMonth,
      donationsByProject,
      donorRetention,
      impactMetrics,
      topDonors,
      donationGrowth,
      averageDonation,
      recurringDonors,
      donorGrowth,
    };
  }

  private processDonationsByMonth(donations: any[]) {
    const monthlyData = new Map();

    donations.forEach(donation => {
      const month = new Date(donation.created_at).toLocaleString('default', { month: 'short' });
      const current = monthlyData.get(month) || { amount: 0, count: 0 };
      
      monthlyData.set(month, {
        amount: current.amount + donation.amount,
        count: current.count + 1,
      });
    });

    return Array.from(monthlyData, ([month, data]) => ({
      month,
      ...data,
    })).sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
  }

  private processDonationsByProject(donations: any[]) {
    const projectData = new Map();

    donations.forEach(donation => {
      const projectName = donation.project?.name || 'General Fund';
      const current = projectData.get(projectName) || 0;
      projectData.set(projectName, current + donation.amount);
    });

    return Array.from(projectData, ([name, value]) => ({
      name,
      value,
    })).sort((a, b) => b.value - a.value);
  }

  private processDonorRetention(donations: any[]) {
    const monthlyDonors = new Map();

    donations.forEach(donation => {
      const month = new Date(donation.created_at).toLocaleString('default', { month: 'short' });
      const isNewDonor = donation.donor.first_donation_date === donation.created_at;
      
      const current = monthlyDonors.get(month) || { newDonors: 0, returningDonors: 0 };
      if (isNewDonor) {
        current.newDonors++;
      } else {
        current.returningDonors++;
      }
      monthlyDonors.set(month, current);
    });

    return Array.from(monthlyDonors, ([month, data]) => ({
      month,
      ...data,
    })).sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
  }

  private calculateImpactMetrics(donations: any[], projects: any[]) {
    const totalRaised = donations.reduce((sum, donation) => sum + donation.amount, 0);
    const livesImpacted = projects.reduce((sum, project) => sum + (project.lives_impacted || 0), 0);
    const communitiesServed = new Set(projects.map(project => project.communities_served)).size;

    return {
      totalRaised,
      livesImpacted,
      projectsSupported: projects.length,
      communitiesServed,
    };
  }

  private calculateTopDonors(donations: any[]) {
    const donorData = new Map();

    donations.forEach(donation => {
      const donorName = `${donation.donor.first_name} ${donation.donor.last_name}`;
      const current = donorData.get(donorName) || { totalDonated: 0, lastDonation: '', donationCount: 0 };
      current.totalDonated += donation.amount;
      current.lastDonation = donation.created_at;
      current.donationCount++;
      donorData.set(donorName, current);
    });

    return Array.from(donorData.values()).sort((a, b) => b.totalDonated - a.totalDonated);
  }

  private async calculateGrowthMetrics(donations: any[]) {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    const monthly = this.calculateGrowth(donations, monthAgo);
    const quarterly = this.calculateGrowth(donations, quarterAgo);
    const yearly = this.calculateGrowth(donations, yearAgo);

    return { monthly, quarterly, yearly };
  }

  private calculateGrowth(donations: any[], startDate: Date) {
    const filtered = donations.filter(d => new Date(d.created_at) >= startDate);
    const total = filtered.reduce((sum, d) => sum + d.amount, 0);
    const count = filtered.length;
    return count ? total / count : 0;
  }

  private calculateAverageDonation(donations: any[]) {
    const total = donations.reduce((sum, d) => sum + d.amount, 0);
    const count = donations.length;
    return count ? total / count : 0;
  }

  private calculateRecurringDonors(donations: any[]) {
    const donorIds = new Set(donations.map(d => d.donor_id));
    const recurringDonors = donations.filter(d => donorIds.has(d.donor_id) && d.donor.first_donation_date !== d.created_at);
    return recurringDonors.length;
  }

  private calculateDonorGrowth(donations: any[]) {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const donorIds = new Set(donations.map(d => d.donor_id));
    const newDonors = donations.filter(d => new Date(d.created_at) >= monthAgo && !donorIds.has(d.donor_id));
    return newDonors.length;
  }

  async getDrillDownData(type: string, id: string, dateRange: AnalyticsDateRange) {
    const { startDate, endDate } = dateRange;

    switch (type) {
      case 'project': {
        const { data: projectData, error } = await supabase
          .from('donations')
          .select(`
            amount,
            created_at,
            project:projects(id, name, description)
          `)
          .eq('project_id', id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (error) throw error;

        const totalAmount = projectData.reduce((sum, d) => sum + d.amount, 0);
        const donationCount = projectData.length;
        const averageDonation = totalAmount / donationCount;

        // Get previous period data for comparison
        const periodLength = endDate.getTime() - startDate.getTime();
        const prevStartDate = new Date(startDate.getTime() - periodLength);
        const prevEndDate = new Date(endDate.getTime() - periodLength);

        const { data: prevData } = await supabase
          .from('donations')
          .select('amount')
          .eq('project_id', id)
          .gte('created_at', prevStartDate.toISOString())
          .lte('created_at', prevEndDate.toISOString());

        const prevTotal = prevData?.reduce((sum, d) => sum + d.amount, 0) || 0;
        const growth = prevTotal ? ((totalAmount - prevTotal) / prevTotal) * 100 : 0;

        // Process monthly data
        const monthlyData = this.processMonthlyData(projectData);

        return {
          type: 'project',
          title: projectData[0]?.project?.name || 'Project Details',
          metrics: [
            { label: 'Total Raised', value: formatCurrency(totalAmount), change: growth },
            { label: 'Donations', value: donationCount },
            { label: 'Average Donation', value: formatCurrency(averageDonation) },
            { label: 'Active Donors', value: new Set(projectData.map(d => d.donor_id)).size },
          ],
          data: monthlyData,
        };
      }

      case 'donor': {
        const { data: donorData, error } = await supabase
          .from('donations')
          .select(`
            amount,
            created_at,
            donor:donors(id, first_name, last_name)
          `)
          .eq('donor_id', id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (error) throw error;

        const totalDonated = donorData.reduce((sum, d) => sum + d.amount, 0);
        const donationCount = donorData.length;
        const averageDonation = totalDonated / donationCount;
        const projectCount = new Set(donorData.map(d => d.project_id)).size;

        return {
          type: 'donor',
          title: `${donorData[0]?.donor?.first_name} ${donorData[0]?.donor?.last_name}`,
          metrics: [
            { label: 'Total Donated', value: formatCurrency(totalDonated) },
            { label: 'Donations', value: donationCount },
            { label: 'Average Donation', value: formatCurrency(averageDonation) },
            { label: 'Projects Supported', value: projectCount },
          ],
          data: this.processMonthlyData(donorData),
        };
      }

      default:
        throw new Error(`Invalid drill-down type: ${type}`);
    }
  }

  private processMonthlyData(data: any[]) {
    const monthlyData = new Map();

    data.forEach(item => {
      const month = new Date(item.created_at).toLocaleString('default', { month: 'short' });
      const current = monthlyData.get(month) || { name: month, value: 0 };
      monthlyData.set(month, {
        ...current,
        value: current.value + item.amount,
      });
    });

    return Array.from(monthlyData.values());
  }

  async getComparisonData(
    dateRange: AnalyticsDateRange,
    comparisonType: 'previous' | 'year' | 'quarter'
  ): Promise<ComparisonData> {
    const { startDate, endDate } = dateRange;
    const periodLength = endDate.getTime() - startDate.getTime();

    let comparisonStart: Date;
    let comparisonEnd: Date;

    switch (comparisonType) {
      case 'previous':
        comparisonStart = new Date(startDate.getTime() - periodLength);
        comparisonEnd = new Date(endDate.getTime() - periodLength);
        break;

      case 'year':
        comparisonStart = new Date(startDate);
        comparisonEnd = new Date(endDate);
        comparisonStart.setFullYear(startDate.getFullYear() - 1);
        comparisonEnd.setFullYear(endDate.getFullYear() - 1);
        break;

      case 'quarter':
        comparisonStart = new Date(startDate);
        comparisonEnd = new Date(endDate);
        comparisonStart.setMonth(startDate.getMonth() - 3);
        comparisonEnd.setMonth(endDate.getMonth() - 3);
        break;
    }

    const analytics = await this.getDonationAnalytics({
      startDate: comparisonStart,
      endDate: comparisonEnd,
    });

    return {
      dateRange: {
        startDate: comparisonStart,
        endDate: comparisonEnd,
      },
      analytics,
    };
  }

  async getTrendData(
    endDate: Date,
    periods: number,
    periodType: 'day' | 'week' | 'month'
  ): Promise<number[]> {
    const trend: number[] = [];
    let currentDate = endDate;

    for (let i = 0; i < periods; i++) {
      let startDate: Date;
      let endDate = new Date(currentDate);

      switch (periodType) {
        case 'day':
          startDate = new Date(currentDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          currentDate.setDate(currentDate.getDate() - 1);
          break;

        case 'week':
          startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() - 7);
          currentDate = startDate;
          break;

        case 'month':
          startDate = new Date(currentDate);
          startDate.setMonth(currentDate.getMonth() - 1);
          currentDate = startDate;
          break;
      }

      const { data, error } = await supabase
        .from('donations')
        .select('amount')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const total = data.reduce((sum, d) => sum + d.amount, 0);
      trend.unshift(total);
    }

    return trend;
  }

  async exportAnalyticsReport(dateRange: AnalyticsDateRange): Promise<Blob> {
    const analytics = await this.getDonationAnalytics(dateRange);
    
    const report = {
      generatedAt: new Date().toISOString(),
      dateRange: {
        from: dateRange.startDate.toISOString(),
        to: dateRange.endDate.toISOString(),
      },
      summary: {
        totalRaised: analytics.impactMetrics.totalRaised,
        totalProjects: analytics.impactMetrics.projectsSupported,
        totalCommunities: analytics.impactMetrics.communitiesServed,
        livesImpacted: analytics.impactMetrics.livesImpacted,
      },
      donationTrends: analytics.donationsByMonth,
      projectDistribution: analytics.donationsByProject,
      donorRetention: analytics.donorRetention,
      topDonors: analytics.topDonors,
      donationGrowth: analytics.donationGrowth,
      averageDonation: analytics.averageDonation,
      recurringDonors: analytics.recurringDonors,
      donorGrowth: analytics.donorGrowth,
    };

    return new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
  }
}

export const analyticsService = new AnalyticsService();
