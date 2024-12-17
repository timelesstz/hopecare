import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export interface DonationAnalytics {
  totalAmount: number;
  donationCount: number;
  averageDonation: number;
  recurringDonations: number;
  oneTimeDonations: number;
  topProjects: Array<{
    projectId: string;
    projectName: string;
    totalAmount: number;
    donationCount: number;
  }>;
}

export interface DonationTrend {
  date: string;
  amount: number;
  count: number;
}

export const getDonationAnalytics = async (
  startDate: Date,
  endDate: Date
): Promise<DonationAnalytics> => {
  const [
    totalDonations,
    recurringDonations,
    topProjects,
  ] = await Promise.all([
    // Get total donations and counts
    prisma.donation.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
      _count: true,
    }),

    // Get recurring donations count
    prisma.donation.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        frequency: {
          not: 'one-time',
        },
        status: 'completed',
      },
    }),

    // Get top projects
    prisma.donation.groupBy({
      by: ['projectId'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 5,
    }),
  ]);

  // Get project details for top projects
  const projectDetails = await prisma.project.findMany({
    where: {
      id: {
        in: topProjects.map(p => p.projectId),
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const projectMap = new Map(projectDetails.map(p => [p.id, p.name]));

  return {
    totalAmount: totalDonations._sum.amount || 0,
    donationCount: totalDonations._count,
    averageDonation: totalDonations._count > 0 
      ? (totalDonations._sum.amount || 0) / totalDonations._count 
      : 0,
    recurringDonations,
    oneTimeDonations: totalDonations._count - recurringDonations,
    topProjects: topProjects.map(project => ({
      projectId: project.projectId,
      projectName: projectMap.get(project.projectId) || 'Unknown Project',
      totalAmount: project._sum.amount || 0,
      donationCount: project._count,
    })),
  };
};

export const getDonationTrends = async (
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
): Promise<DonationTrend[]> => {
  const now = new Date();
  let startDate: Date;
  let groupByFormat: string;

  switch (period) {
    case 'daily':
      startDate = startOfDay(now);
      groupByFormat = 'HH:00';
      break;
    case 'weekly':
      startDate = startOfWeek(now);
      groupByFormat = 'yyyy-MM-dd';
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      groupByFormat = 'yyyy-MM-dd';
      break;
    case 'yearly':
      startDate = startOfYear(now);
      groupByFormat = 'yyyy-MM';
      break;
    default:
      throw new Error('Invalid period');
  }

  const donations = await prisma.$queryRaw`
    SELECT
      DATE_FORMAT(createdAt, ${groupByFormat}) as date,
      SUM(amount) as amount,
      COUNT(*) as count
    FROM Donation
    WHERE createdAt >= ${startDate}
      AND status = 'completed'
    GROUP BY DATE_FORMAT(createdAt, ${groupByFormat})
    ORDER BY date ASC
  `;

  return donations as DonationTrend[];
};

export const getDonorStats = async () => {
  const [
    totalDonors,
    recurringDonors,
    averageDonationPerDonor,
  ] = await Promise.all([
    // Total unique donors
    prisma.donation.groupBy({
      by: ['donorId'],
      where: {
        status: 'completed',
      },
    }).then(donors => donors.length),

    // Recurring donors
    prisma.donation.groupBy({
      by: ['donorId'],
      where: {
        status: 'completed',
        frequency: {
          not: 'one-time',
        },
      },
    }).then(donors => donors.length),

    // Average donation per donor
    prisma.donation.groupBy({
      by: ['donorId'],
      where: {
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
    }).then(donors => {
      const total = donors.reduce((sum, donor) => sum + (donor._sum.amount || 0), 0);
      return donors.length > 0 ? total / donors.length : 0;
    }),
  ]);

  return {
    totalDonors,
    recurringDonors,
    oneTimeDonors: totalDonors - recurringDonors,
    averageDonationPerDonor,
  };
};
