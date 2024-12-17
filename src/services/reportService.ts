import { analyticsService, AnalyticsDateRange } from './analyticsService';
import { formatCurrency } from '@/lib/utils';

interface ReportOptions {
  format: 'json' | 'csv';
  sections: string[];
  includeComparison?: boolean;
}

export class ReportService {
  private static readonly REPORT_SECTIONS = {
    summary: 'Summary Metrics',
    trends: 'Donation Trends',
    projects: 'Project Distribution',
    donors: 'Donor Analysis',
    retention: 'Donor Retention',
    growth: 'Growth Analysis',
  };

  async generateReport(dateRange: AnalyticsDateRange, options: ReportOptions): Promise<Blob> {
    const analytics = await analyticsService.getDonationAnalytics(dateRange);
    
    // If comparison is requested, get previous period data
    let comparisonData;
    if (options.includeComparison) {
      const periodLength = dateRange.endDate.getTime() - dateRange.startDate.getTime();
      const prevStartDate = new Date(dateRange.startDate.getTime() - periodLength);
      const prevEndDate = new Date(dateRange.endDate.getTime() - periodLength);
      
      comparisonData = await analyticsService.getDonationAnalytics({
        startDate: prevStartDate,
        endDate: prevEndDate,
      });
    }

    // Generate report based on format
    if (options.format === 'csv') {
      return this.generateCSV(analytics, comparisonData, options.sections);
    }
    
    return this.generateJSON(analytics, comparisonData, options.sections);
  }

  private async generateJSON(analytics: any, comparisonData: any | undefined, sections: string[]): Promise<Blob> {
    const report: any = {
      metadata: {
        generatedAt: new Date().toISOString(),
        reportType: 'Analytics Report',
        sections: sections.map(s => this.REPORT_SECTIONS[s as keyof typeof this.REPORT_SECTIONS]),
      },
    };

    // Add requested sections
    if (sections.includes('summary')) {
      report.summary = {
        totalRaised: analytics.impactMetrics.totalRaised,
        totalDonations: analytics.donationsByMonth.reduce((sum: number, m: any) => sum + m.count, 0),
        averageDonation: analytics.averageDonation,
        recurringDonors: analytics.recurringDonors,
        projectsSupported: analytics.impactMetrics.projectsSupported,
        livesImpacted: analytics.impactMetrics.livesImpacted,
      };

      if (comparisonData) {
        report.summary.comparison = {
          totalRaisedGrowth: this.calculateGrowth(
            comparisonData.impactMetrics.totalRaised,
            analytics.impactMetrics.totalRaised
          ),
          donationCountGrowth: this.calculateGrowth(
            comparisonData.donationsByMonth.reduce((sum: number, m: any) => sum + m.count, 0),
            analytics.donationsByMonth.reduce((sum: number, m: any) => sum + m.count, 0)
          ),
        };
      }
    }

    if (sections.includes('trends')) {
      report.trends = {
        monthly: analytics.donationsByMonth,
        growth: analytics.donationGrowth,
      };
    }

    if (sections.includes('projects')) {
      report.projects = {
        distribution: analytics.donationsByProject,
        topProjects: analytics.donationsByProject
          .sort((a: any, b: any) => b.value - a.value)
          .slice(0, 5),
      };
    }

    if (sections.includes('donors')) {
      report.donors = {
        topDonors: analytics.topDonors,
        newDonors: analytics.donorGrowth,
        recurringDonors: analytics.recurringDonors,
      };
    }

    if (sections.includes('retention')) {
      report.retention = {
        monthly: analytics.donorRetention,
        retentionRate: this.calculateRetentionRate(analytics.donorRetention),
      };
    }

    if (sections.includes('growth')) {
      report.growth = {
        ...analytics.donationGrowth,
        yearOverYear: comparisonData
          ? this.calculateGrowth(
              comparisonData.impactMetrics.totalRaised,
              analytics.impactMetrics.totalRaised
            )
          : null,
      };
    }

    return new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
  }

  private async generateCSV(analytics: any, comparisonData: any | undefined, sections: string[]): Promise<Blob> {
    const rows: string[] = [];
    
    // Add headers
    rows.push('Report Generated At,' + new Date().toISOString());
    rows.push('');

    if (sections.includes('summary')) {
      rows.push('Summary Metrics');
      rows.push('Metric,Value,Previous Period,Growth');
      rows.push(`Total Raised,${formatCurrency(analytics.impactMetrics.totalRaised)},${
        comparisonData ? formatCurrency(comparisonData.impactMetrics.totalRaised) : 'N/A'
      },${
        comparisonData
          ? this.calculateGrowth(
              comparisonData.impactMetrics.totalRaised,
              analytics.impactMetrics.totalRaised
            ) + '%'
          : 'N/A'
      }`);
      rows.push('');
    }

    if (sections.includes('trends')) {
      rows.push('Monthly Trends');
      rows.push('Month,Amount,Count');
      analytics.donationsByMonth.forEach((m: any) => {
        rows.push(`${m.month},${m.amount},${m.count}`);
      });
      rows.push('');
    }

    if (sections.includes('projects')) {
      rows.push('Project Distribution');
      rows.push('Project,Amount,Percentage');
      analytics.donationsByProject.forEach((p: any) => {
        const total = analytics.donationsByProject.reduce((sum: number, p: any) => sum + p.value, 0);
        const percentage = ((p.value / total) * 100).toFixed(1);
        rows.push(`${p.name},${formatCurrency(p.value)},${percentage}%`);
      });
      rows.push('');
    }

    if (sections.includes('donors')) {
      rows.push('Top Donors');
      rows.push('Name,Total Donated,Donations,Last Donation');
      analytics.topDonors.slice(0, 5).forEach((d: any) => {
        rows.push(
          `${d.name},${formatCurrency(d.totalDonated)},${d.donationCount},${new Date(
            d.lastDonation
          ).toLocaleDateString()}`
        );
      });
      rows.push('');
    }

    return new Blob([rows.join('\n')], {
      type: 'text/csv',
    });
  }

  private calculateGrowth(previous: number, current: number): number {
    if (!previous) return 0;
    return Number(((current - previous) / previous * 100).toFixed(1));
  }

  private calculateRetentionRate(retention: any[]): number {
    const total = retention.reduce(
      (sum, month) => sum + month.newDonors + month.returningDonors,
      0
    );
    const returning = retention.reduce((sum, month) => sum + month.returningDonors, 0);
    return total ? Number(((returning / total) * 100).toFixed(1)) : 0;
  }
}

export const reportService = new ReportService();
