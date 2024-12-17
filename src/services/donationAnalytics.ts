import { prisma } from '../lib/prisma';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';

export interface DonationAnalytics {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  recurringDonors: number;
  retentionRate: number;
  growthRate: number;
  topCampaigns: Array<{
    id: string;
    name: string;
    amount: number;
    donorCount: number;
  }>;
  donationsByMonth: Array<{
    month: string;
    amount: number;
    donors: number;
  }>;
  donorSegments: Array<{
    segment: string;
    count: number;
    totalAmount: number;
  }>;
  impactMetrics: {
    livesImpacted: number;
    communitiesServed: number;
    programsSupported: number;
    volunteerHours: number;
  };
}

export const donationAnalytics = {
  async getDonationStats(timeframe: 'month' | 'year' | 'all' = 'month'): Promise<DonationAnalytics> {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (timeframe) {
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        startDate = new Date(0); // Beginning of time
    }

    // Get basic donation stats
    const donations = await prisma.donation.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        campaign: true,
        donor: true,
      },
    });

    // Calculate total donations and amount
    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const averageDonation = totalAmount / totalDonations || 0;

    // Get recurring donors
    const recurringDonors = await prisma.donor.count({
      where: {
        isRecurring: true,
      },
    });

    // Calculate retention rate
    const lastMonth = subMonths(now, 1);
    const lastMonthDonors = await prisma.donor.count({
      where: {
        donations: {
          some: {
            createdAt: {
              gte: startOfMonth(lastMonth),
              lte: endOfMonth(lastMonth),
            },
          },
        },
      },
    });

    const thisMonthRetainedDonors = await prisma.donor.count({
      where: {
        donations: {
          some: {
            createdAt: {
              gte: startOfMonth(lastMonth),
              lte: endOfMonth(lastMonth),
            },
          },
          AND: {
            some: {
              createdAt: {
                gte: startOfMonth(now),
                lte: endOfMonth(now),
              },
            },
          },
        },
      },
    });

    const retentionRate = lastMonthDonors ? (thisMonthRetainedDonors / lastMonthDonors) * 100 : 0;

    // Calculate growth rate
    const lastMonthDonations = await prisma.donation.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth(lastMonth),
          lte: endOfMonth(lastMonth),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const thisMonthDonations = await prisma.donation.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const growthRate = lastMonthDonations._sum.amount
      ? ((thisMonthDonations._sum.amount! - lastMonthDonations._sum.amount!) /
          lastMonthDonations._sum.amount!) *
        100
      : 0;

    // Get top campaigns
    const topCampaigns = await prisma.campaign.findMany({
      where: {
        donations: {
          some: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        donations: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        _count: {
          select: {
            donations: true,
          },
        },
      },
      take: 5,
      orderBy: {
        donations: {
          _count: 'desc',
        },
      },
    });

    // Get donations by month
    const donationsByMonth = await prisma.$queryRaw\`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(amount) as amount,
        COUNT(DISTINCT "donorId") as donors
      FROM donations
      WHERE "createdAt" >= \${startDate}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
      LIMIT 12
    \`;

    // Calculate donor segments
    const donorSegments = [
      {
        segment: 'First Time',
        count: await prisma.donor.count({
          where: {
            donations: {
              every: {
                createdAt: {
                  gte: startOfMonth(now),
                },
              },
            },
          },
        }),
      },
      {
        segment: 'Regular',
        count: await prisma.donor.count({
          where: {
            donations: {
              some: {
                createdAt: {
                  lt: startOfMonth(now),
                },
              },
            },
            isRecurring: false,
          },
        }),
      },
      {
        segment: 'Monthly',
        count: await prisma.donor.count({
          where: {
            isRecurring: true,
          },
        }),
      },
      {
        segment: 'Major',
        count: await prisma.donor.count({
          where: {
            donations: {
              some: {
                amount: {
                  gte: 1000,
                },
              },
            },
          },
        }),
      },
    ];

    // Calculate impact metrics (these would typically come from your impact tracking system)
    const impactMetrics = {
      livesImpacted: Math.floor(totalAmount / 100), // Example calculation
      communitiesServed: Math.floor(totalAmount / 1000),
      programsSupported: Math.floor(totalAmount / 5000),
      volunteerHours: Math.floor(totalAmount / 50),
    };

    return {
      totalDonations,
      totalAmount,
      averageDonation,
      recurringDonors,
      retentionRate,
      growthRate,
      topCampaigns: topCampaigns.map((c) => ({
        id: c.id,
        name: c.name,
        amount: c.donations.reduce((sum, d) => sum + d.amount, 0),
        donorCount: c._count.donations,
      })),
      donationsByMonth,
      donorSegments: donorSegments.map((s) => ({
        ...s,
        totalAmount: 0, // This would need to be calculated based on your actual data
      })),
      impactMetrics,
    };
  },

  async getDonorInsights(donorId: string) {
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      include: {
        donations: {
          include: {
            campaign: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!donor) {
      throw new Error('Donor not found');
    }

    const totalDonated = donor.donations.reduce((sum, d) => sum + d.amount, 0);
    const averageDonation = totalDonated / donor.donations.length;
    
    const preferredCauses = await prisma.campaign.groupBy({
      by: ['category'],
      where: {
        donations: {
          some: {
            donorId,
          },
        },
      },
      _count: true,
      orderBy: {
        _count: {
          donations: 'desc',
        },
      },
      take: 3,
    });

    const donationFrequency = await prisma.$queryRaw\`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count,
        SUM(amount) as amount
      FROM donations
      WHERE "donorId" = \${donorId}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
      LIMIT 12
    \`;

    return {
      donor,
      insights: {
        totalDonated,
        averageDonation,
        donationCount: donor.donations.length,
        preferredCauses,
        donationFrequency,
        isRecurring: donor.isRecurring,
        lastDonation: donor.donations[0],
        impactGenerated: {
          livesImpacted: Math.floor(totalDonated / 100),
          communitiesServed: Math.floor(totalDonated / 1000),
          programsSupported: Math.floor(totalDonated / 5000),
        },
      },
    };
  },

  async getCampaignAnalytics(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        donations: {
          include: {
            donor: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const totalRaised = campaign.donations.reduce((sum, d) => sum + d.amount, 0);
    const donorCount = new Set(campaign.donations.map(d => d.donorId)).size;
    const averageDonation = totalRaised / campaign.donations.length;

    const donationTrend = await prisma.$queryRaw\`
      SELECT 
        DATE_TRUNC('day', "createdAt") as day,
        COUNT(*) as count,
        SUM(amount) as amount
      FROM donations
      WHERE "campaignId" = \${campaignId}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY day DESC
      LIMIT 30
    \`;

    const donorTypes = {
      new: await prisma.donor.count({
        where: {
          donations: {
            some: {
              campaignId,
              createdAt: {
                gte: startOfMonth(new Date()),
              },
            },
          },
        },
      }),
      returning: await prisma.donor.count({
        where: {
          donations: {
            some: {
              campaignId,
              createdAt: {
                lt: startOfMonth(new Date()),
              },
            },
          },
        },
      }),
      recurring: await prisma.donor.count({
        where: {
          isRecurring: true,
          donations: {
            some: {
              campaignId,
            },
          },
        },
      }),
    };

    return {
      campaign,
      analytics: {
        totalRaised,
        donorCount,
        averageDonation,
        donationTrend,
        donorTypes,
        progress: (totalRaised / campaign.goal) * 100,
        timeRemaining: Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
        recentDonors: campaign.donations
          .slice(0, 5)
          .map(d => ({
            name: d.donor.name,
            amount: d.amount,
            date: d.createdAt,
          })),
      },
    };
  },
};

export default donationAnalytics;
