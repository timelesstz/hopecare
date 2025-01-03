import { prisma } from '@/lib/prisma';
import { subMonths, subYears, startOfMonth, endOfMonth, format } from 'date-fns';
import { exponentialSmoothing } from '@/utils/statistics';

export interface RetentionMetrics {
  retentionRate: number;
  churnRate: number;
  monthlyRetentionTrend: Array<{
    month: string;
    retentionRate: number;
  }>;
  averageDonorLifespan: number;
}

export interface GrowthMetrics {
  monthlyGrowthRate: number;
  projectedDonations: Array<{
    month: string;
    amount: number;
    confidence: number;
  }>;
  yearOverYearGrowth: number;
}

export interface DonorSegment {
  segment: 'new' | 'regular' | 'lapsed' | 'reactivated';
  count: number;
  totalDonations: number;
  averageDonation: number;
}

export const calculateDonorRetention = async (): Promise<RetentionMetrics> => {
  const now = new Date();
  const lastYear = subYears(now, 1);
  
  // Get all donors who made donations in both periods
  const [activeDonors, totalDonors, monthlyRetention] = await Promise.all([
    prisma.donor.count({
      where: {
        donations: {
          some: {
            createdAt: {
              gte: lastYear,
            },
          },
        },
      },
    }),
    prisma.donor.count(),
    // Calculate monthly retention rates for trend
    Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const month = subMonths(now, i);
        const previousMonth = subMonths(month, 1);
        return prisma.$transaction([
          // Donors who donated in both months
          prisma.donor.count({
            where: {
              donations: {
                some: {
                  createdAt: {
                    gte: startOfMonth(month),
                    lte: endOfMonth(month),
                  },
                },
                AND: {
                  some: {
                    createdAt: {
                      gte: startOfMonth(previousMonth),
                      lte: endOfMonth(previousMonth),
                    },
                  },
                },
              },
            },
          }),
          // Total donors in previous month
          prisma.donor.count({
            where: {
              donations: {
                some: {
                  createdAt: {
                    gte: startOfMonth(previousMonth),
                    lte: endOfMonth(previousMonth),
                  },
                },
              },
            },
          }),
        ]).then(([retained, total]) => ({
          month: format(month, 'yyyy-MM'),
          retentionRate: total > 0 ? retained / total : 0,
        }));
      })
    ),
  ]);

  const retentionRate = totalDonors > 0 ? activeDonors / totalDonors : 0;
  
  // Calculate average donor lifespan
  const donorLifespans = await prisma.donor.findMany({
    select: {
      donations: {
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  const averageLifespan = donorLifespans.reduce((acc, donor) => {
    if (donor.donations.length < 2) return acc;
    const firstDonation = new Date(donor.donations[0].createdAt);
    const lastDonation = new Date(donor.donations[donor.donations.length - 1].createdAt);
    return acc + (lastDonation.getTime() - firstDonation.getTime());
  }, 0) / (donorLifespans.length || 1) / (1000 * 60 * 60 * 24); // Convert to days

  return {
    retentionRate,
    churnRate: 1 - retentionRate,
    monthlyRetentionTrend: monthlyRetention.reverse(),
    averageDonorLifespan: averageLifespan,
  };
};

export const predictGrowth = async (): Promise<GrowthMetrics> => {
  const now = new Date();
  const lastYear = subYears(now, 1);

  // Get monthly donation totals for the past year
  const monthlyDonations = await Promise.all(
    Array.from({ length: 12 }, (_, i) => {
      const month = subMonths(now, i);
      return prisma.donation.aggregate({
        where: {
          createdAt: {
            gte: startOfMonth(month),
            lte: endOfMonth(month),
          },
          status: 'completed',
        },
        _sum: {
          amount: true,
        },
      }).then(result => ({
        month: format(month, 'yyyy-MM'),
        amount: result._sum.amount || 0,
      }));
    })
  );

  // Calculate year-over-year growth
  const [thisYearTotal, lastYearTotal] = await Promise.all([
    prisma.donation.aggregate({
      where: {
        createdAt: {
          gte: subYears(now, 1),
        },
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.donation.aggregate({
      where: {
        createdAt: {
          gte: subYears(now, 2),
          lt: subYears(now, 1),
        },
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const yearOverYearGrowth = lastYearTotal._sum.amount && lastYearTotal._sum.amount > 0
    ? ((thisYearTotal._sum.amount || 0) - (lastYearTotal._sum.amount || 0)) / lastYearTotal._sum.amount
    : 0;

  // Calculate monthly growth rate
  const amounts = monthlyDonations.map(d => d.amount);
  const monthlyGrowthRate = amounts.length > 1
    ? (amounts[0] - amounts[amounts.length - 1]) / amounts[amounts.length - 1]
    : 0;

  // Project future donations using exponential smoothing
  const projectedDonations = exponentialSmoothing(amounts, 6).map((amount, index) => ({
    month: format(subMonths(now, -index - 1), 'yyyy-MM'),
    amount,
    confidence: Math.max(0, 1 - index * 0.1), // Confidence decreases with time
  }));

  return {
    monthlyGrowthRate,
    projectedDonations,
    yearOverYearGrowth,
  };
};

export const segmentDonors = async (): Promise<DonorSegment[]> => {
  const now = new Date();
  const threeMonthsAgo = subMonths(now, 3);
  const sixMonthsAgo = subMonths(now, 6);

  const segments = await Promise.all([
    // New donors (first donation within last 3 months)
    prisma.$transaction([
      prisma.donor.count({
        where: {
          donations: {
            every: {
              createdAt: {
                gte: threeMonthsAgo,
              },
            },
          },
        },
      }),
      prisma.donation.aggregate({
        where: {
          donor: {
            donations: {
              every: {
                createdAt: {
                  gte: threeMonthsAgo,
                },
              },
            },
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
    ]),

    // Regular donors (consistent donations)
    prisma.$transaction([
      prisma.donor.count({
        where: {
          donations: {
            some: {
              createdAt: {
                gte: threeMonthsAgo,
              },
            },
            AND: {
              some: {
                createdAt: {
                  lt: threeMonthsAgo,
                  gte: sixMonthsAgo,
                },
              },
            },
          },
        },
      }),
      prisma.donation.aggregate({
        where: {
          donor: {
            donations: {
              some: {
                createdAt: {
                  gte: threeMonthsAgo,
                },
              },
              AND: {
                some: {
                  createdAt: {
                    lt: threeMonthsAgo,
                    gte: sixMonthsAgo,
                  },
                },
              },
            },
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
    ]),

    // Lapsed donors (no donations in last 6 months)
    prisma.$transaction([
      prisma.donor.count({
        where: {
          donations: {
            every: {
              createdAt: {
                lt: sixMonthsAgo,
              },
            },
          },
        },
      }),
      prisma.donation.aggregate({
        where: {
          donor: {
            donations: {
              every: {
                createdAt: {
                  lt: sixMonthsAgo,
                },
              },
            },
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
    ]),

    // Reactivated donors (recent donation after 6+ months gap)
    prisma.$transaction([
      prisma.donor.count({
        where: {
          donations: {
            some: {
              createdAt: {
                gte: threeMonthsAgo,
              },
            },
            AND: {
              every: {
                createdAt: {
                  notIn: [
                    {
                      gte: threeMonthsAgo,
                      lt: sixMonthsAgo,
                    },
                  ],
                },
              },
            },
          },
        },
      }),
      prisma.donation.aggregate({
        where: {
          donor: {
            donations: {
              some: {
                createdAt: {
                  gte: threeMonthsAgo,
                },
              },
              AND: {
                every: {
                  createdAt: {
                    notIn: [
                      {
                        gte: threeMonthsAgo,
                        lt: sixMonthsAgo,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
    ]),
  ]);

  return [
    {
      segment: 'new',
      count: segments[0][0],
      totalDonations: segments[0][1]._sum.amount || 0,
      averageDonation: segments[0][1]._count > 0 ? (segments[0][1]._sum.amount || 0) / segments[0][1]._count : 0,
    },
    {
      segment: 'regular',
      count: segments[1][0],
      totalDonations: segments[1][1]._sum.amount || 0,
      averageDonation: segments[1][1]._count > 0 ? (segments[1][1]._sum.amount || 0) / segments[1][1]._count : 0,
    },
    {
      segment: 'lapsed',
      count: segments[2][0],
      totalDonations: segments[2][1]._sum.amount || 0,
      averageDonation: segments[2][1]._count > 0 ? (segments[2][1]._sum.amount || 0) / segments[2][1]._count : 0,
    },
    {
      segment: 'reactivated',
      count: segments[3][0],
      totalDonations: segments[3][1]._sum.amount || 0,
      averageDonation: segments[3][1]._count > 0 ? (segments[3][1]._sum.amount || 0) / segments[3][1]._count : 0,
    },
  ];
};
