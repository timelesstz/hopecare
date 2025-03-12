import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp, 
  orderBy, 
  limit 
} from 'firebase/firestore';

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

    try {
      // Get donations within date range
      const donationsCollection = collection(db, 'donations');
      const donationsQuery = query(
        donationsCollection,
        where('created_at', '>=', startDate.toISOString()),
        where('created_at', '<=', endDate.toISOString())
      );
      
      const donationsSnapshot = await getDocs(donationsQuery);
      const donations = [];
      
      // Process donations and fetch related data
      for (const donationDoc of donationsSnapshot.docs) {
        const donationData = donationDoc.data();
        
        // Fetch project data if available
        let projectData = null;
        if (donationData.project_id) {
          const projectsCollection = collection(db, 'projects');
          const projectQuery = query(
            projectsCollection,
            where('id', '==', donationData.project_id)
          );
          const projectSnapshot = await getDocs(projectQuery);
          
          if (!projectSnapshot.empty) {
            projectData = projectSnapshot.docs[0].data();
          }
        }
        
        // Fetch donor data
        let donorData = null;
        if (donationData.donor_id) {
          const donorsCollection = collection(db, 'donors');
          const donorQuery = query(
            donorsCollection,
            where('id', '==', donationData.donor_id)
          );
          const donorSnapshot = await getDocs(donorQuery);
          
          if (!donorSnapshot.empty) {
            donorData = donorSnapshot.docs[0].data();
          }
        }
        
        donations.push({
          ...donationData,
          project: projectData,
          donor: donorData
        });
      }

      // Get projects data
      const projectsCollection = collection(db, 'projects');
      const projectsSnapshot = await getDocs(projectsCollection);
      const projects = projectsSnapshot.docs.map(doc => doc.data());

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
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
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
      const isNewDonor = donation.donor?.first_donation_date === donation.created_at;
      
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
      if (!donation.donor) return;
      
      const donorName = `${donation.donor.first_name || ''} ${donation.donor.last_name || ''}`.trim() || 'Anonymous';
      const current = donorData.get(donorName) || { 
        totalDonated: 0, 
        lastDonation: '', 
        donationCount: 0,
        name: donorName
      };
      
      current.totalDonated += donation.amount;
      current.lastDonation = donation.created_at;
      current.donationCount++;
      donorData.set(donorName, current);
    });

    return Array.from(donorData.values())
      .sort((a, b) => b.totalDonated - a.totalDonated)
      .slice(0, 10); // Limit to top 10 donors
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
    const donorIds = new Set(donations.filter(d => d.donor_id).map(d => d.donor_id));
    const recurringDonors = donations.filter(d => 
      d.donor_id && 
      donorIds.has(d.donor_id) && 
      d.donor?.first_donation_date !== d.created_at
    );
    return recurringDonors.length;
  }

  private calculateDonorGrowth(donations: any[]) {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const currentDonors = new Set(
      donations.filter(d => new Date(d.created_at) >= monthAgo).map(d => d.donor_id)
    ).size;
    
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);
    
    const previousDonors = new Set(
      donations.filter(d => {
        const date = new Date(d.created_at);
        return date >= previousMonthStart && date <= previousMonthEnd;
      }).map(d => d.donor_id)
    ).size;
    
    return previousDonors ? (currentDonors - previousDonors) / previousDonors * 100 : 0;
  }

  async getDrillDownData(type: string, id: string, dateRange: AnalyticsDateRange) {
    const { startDate, endDate } = dateRange;
    
    try {
      let data;
      
      if (type === 'project') {
        // Get project details
        const projectsCollection = collection(db, 'projects');
        const projectQuery = query(
          projectsCollection,
          where('id', '==', id)
        );
        const projectSnapshot = await getDocs(projectQuery);
        
        if (projectSnapshot.empty) {
          throw new Error('Project not found');
        }
        
        const projectData = projectSnapshot.docs[0].data();
        
        // Get donations for this project
        const donationsCollection = collection(db, 'donations');
        const donationsQuery = query(
          donationsCollection,
          where('project_id', '==', id),
          where('created_at', '>=', startDate.toISOString()),
          where('created_at', '<=', endDate.toISOString())
        );
        
        const donationsSnapshot = await getDocs(donationsQuery);
        const donations = donationsSnapshot.docs.map(doc => doc.data());
        
        // Process monthly data
        const monthlyData = this.processMonthlyData(donations);
        
        data = {
          project: projectData,
          donations: {
            total: donations.reduce((sum, d) => sum + d.amount, 0),
            count: donations.length,
            average: donations.length ? donations.reduce((sum, d) => sum + d.amount, 0) / donations.length : 0,
            monthly: monthlyData,
          },
        };
      } else if (type === 'donor') {
        // Get donor details
        const donorsCollection = collection(db, 'donors');
        const donorQuery = query(
          donorsCollection,
          where('id', '==', id)
        );
        const donorSnapshot = await getDocs(donorQuery);
        
        if (donorSnapshot.empty) {
          throw new Error('Donor not found');
        }
        
        const donorData = donorSnapshot.docs[0].data();
        
        // Get donations for this donor
        const donationsCollection = collection(db, 'donations');
        const donationsQuery = query(
          donationsCollection,
          where('donor_id', '==', id),
          where('created_at', '>=', startDate.toISOString()),
          where('created_at', '<=', endDate.toISOString())
        );
        
        const donationsSnapshot = await getDocs(donationsQuery);
        const donations = donationsSnapshot.docs.map(doc => doc.data());
        
        // Process monthly data
        const monthlyData = this.processMonthlyData(donations);
        
        data = {
          donor: donorData,
          donations: {
            total: donations.reduce((sum, d) => sum + d.amount, 0),
            count: donations.length,
            average: donations.length ? donations.reduce((sum, d) => sum + d.amount, 0) / donations.length : 0,
            monthly: monthlyData,
          },
        };
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching drill-down data for ${type} ${id}:`, error);
      throw error;
    }
  }

  private processMonthlyData(data: any[]) {
    const monthlyData = new Map();
    
    data.forEach(item => {
      const date = new Date(item.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      
      const current = monthlyData.get(key) || { amount: 0, count: 0 };
      monthlyData.set(key, {
        amount: current.amount + item.amount,
        count: current.count + 1,
      });
    });
    
    return Array.from(monthlyData, ([month, data]) => ({
      month,
      ...data,
    })).sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      
      if (aYear !== bYear) return Number(aYear) - Number(bYear);
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(aMonth) - months.indexOf(bMonth);
    });
  }

  async getComparisonData(
    dateRange: AnalyticsDateRange,
    comparisonType: 'previous' | 'year' | 'quarter'
  ): Promise<ComparisonData> {
    const { startDate, endDate } = dateRange;
    let comparisonStartDate: Date;
    let comparisonEndDate: Date;
    
    // Calculate comparison date range
    if (comparisonType === 'previous') {
      const duration = endDate.getTime() - startDate.getTime();
      comparisonEndDate = new Date(startDate.getTime() - 1);
      comparisonStartDate = new Date(comparisonEndDate.getTime() - duration);
    } else if (comparisonType === 'year') {
      comparisonStartDate = new Date(startDate);
      comparisonStartDate.setFullYear(startDate.getFullYear() - 1);
      comparisonEndDate = new Date(endDate);
      comparisonEndDate.setFullYear(endDate.getFullYear() - 1);
    } else if (comparisonType === 'quarter') {
      comparisonStartDate = new Date(startDate);
      comparisonStartDate.setMonth(startDate.getMonth() - 3);
      comparisonEndDate = new Date(endDate);
      comparisonEndDate.setMonth(endDate.getMonth() - 3);
    }
    
    const comparisonDateRange = { startDate: comparisonStartDate, endDate: comparisonEndDate };
    const comparisonAnalytics = await this.getDonationAnalytics(comparisonDateRange);
    
    return {
      dateRange: comparisonDateRange,
      analytics: comparisonAnalytics,
    };
  }

  async getTrendData(
    endDate: Date,
    periods: number,
    periodType: 'day' | 'week' | 'month'
  ): Promise<number[]> {
    const result: number[] = [];
    
    try {
      for (let i = 0; i < periods; i++) {
        let periodStart: Date;
        let periodEnd: Date;
        
        if (periodType === 'day') {
          periodEnd = new Date(endDate);
          periodEnd.setDate(endDate.getDate() - i);
          periodStart = new Date(periodEnd);
          periodStart.setHours(0, 0, 0, 0);
          periodEnd.setHours(23, 59, 59, 999);
        } else if (periodType === 'week') {
          periodEnd = new Date(endDate);
          periodEnd.setDate(endDate.getDate() - (i * 7));
          periodStart = new Date(periodEnd);
          periodStart.setDate(periodEnd.getDate() - 6);
          periodStart.setHours(0, 0, 0, 0);
          periodEnd.setHours(23, 59, 59, 999);
        } else {
          periodEnd = new Date(endDate);
          periodEnd.setMonth(endDate.getMonth() - i);
          periodEnd.setDate(new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, 0).getDate());
          periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
          periodStart.setHours(0, 0, 0, 0);
          periodEnd.setHours(23, 59, 59, 999);
        }
        
        // Get donations for this period
        const donationsCollection = collection(db, 'donations');
        const donationsQuery = query(
          donationsCollection,
          where('created_at', '>=', periodStart.toISOString()),
          where('created_at', '<=', periodEnd.toISOString())
        );
        
        const donationsSnapshot = await getDocs(donationsQuery);
        const periodTotal = donationsSnapshot.docs.reduce(
          (sum, doc) => sum + doc.data().amount, 
          0
        );
        
        result.unshift(periodTotal);
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching trend data:', error);
      throw error;
    }
  }

  async exportAnalyticsReport(dateRange: AnalyticsDateRange): Promise<Blob> {
    try {
      const analytics = await this.getDonationAnalytics(dateRange);
      
      // Format the data for CSV export
      const rows = [
        ['HopeCare Analytics Report'],
        [`Date Range: ${dateRange.startDate.toLocaleDateString()} to ${dateRange.endDate.toLocaleDateString()}`],
        [''],
        ['Donation Summary'],
        ['Total Raised', analytics.impactMetrics.totalRaised.toString()],
        ['Average Donation', analytics.averageDonation.toFixed(2)],
        ['Recurring Donors', analytics.recurringDonors.toString()],
        ['Donor Growth', `${analytics.donorGrowth.toFixed(2)}%`],
        [''],
        ['Monthly Donations'],
        ['Month', 'Amount', 'Count'],
        ...analytics.donationsByMonth.map(item => [
          item.month,
          item.amount.toString(),
          item.count.toString(),
        ]),
        [''],
        ['Donations by Project'],
        ['Project', 'Amount'],
        ...analytics.donationsByProject.map(item => [
          item.name,
          item.value.toString(),
        ]),
        [''],
        ['Top Donors'],
        ['Name', 'Total Donated', 'Donation Count', 'Last Donation'],
        ...analytics.topDonors.map(donor => [
          donor.name,
          donor.totalDonated.toString(),
          donor.donationCount.toString(),
          new Date(donor.lastDonation).toLocaleDateString(),
        ]),
      ];
      
      // Convert to CSV
      const csvContent = rows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      return blob;
    } catch (error) {
      console.error('Error exporting analytics report:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
