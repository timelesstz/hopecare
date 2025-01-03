import { prisma } from '@/lib/prisma';
import { startOfYear, endOfYear, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface DonationGoal {
  id: string;
  name: string;
  targetAmount: number;
  startDate: Date;
  endDate: Date;
  currentAmount: number;
  projectId?: string;
  description?: string;
}

export interface GoalProgress {
  goal: DonationGoal;
  percentageComplete: number;
  daysRemaining: number;
  projectedCompletion: Date;
  recentDonations: Array<{
    amount: number;
    date: Date;
    donorName: string;
  }>;
}

export const createDonationGoal = async (
  data: Omit<DonationGoal, 'id' | 'currentAmount'>
) => {
  return prisma.donationGoal.create({
    data: {
      ...data,
      currentAmount: 0,
    },
  });
};

export const updateDonationGoal = async (
  id: string,
  data: Partial<Omit<DonationGoal, 'id' | 'currentAmount'>>
) => {
  return prisma.donationGoal.update({
    where: { id },
    data,
  });
};

export const getDonationGoal = async (id: string): Promise<DonationGoal> => {
  return prisma.donationGoal.findUniqueOrThrow({
    where: { id },
  });
};

export const listDonationGoals = async (
  includeCompleted = false
): Promise<DonationGoal[]> => {
  return prisma.donationGoal.findMany({
    where: includeCompleted
      ? undefined
      : {
          endDate: {
            gte: new Date(),
          },
          currentAmount: {
            lt: prisma.raw('targetAmount'),
          },
        },
    orderBy: {
      endDate: 'asc',
    },
  });
};

export const getGoalProgress = async (goalId: string): Promise<GoalProgress> => {
  const goal = await getDonationGoal(goalId);
  const now = new Date();

  // Calculate days remaining
  const daysRemaining = Math.max(
    0,
    Math.ceil((goal.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Get recent donations for this goal
  const recentDonations = await prisma.donation.findMany({
    where: {
      goalId,
      createdAt: {
        gte: subMonths(now, 1),
      },
    },
    select: {
      amount: true,
      createdAt: true,
      donor: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  // Calculate projected completion date based on current donation rate
  const monthlyDonations = await prisma.donation.aggregate({
    where: {
      goalId,
      createdAt: {
        gte: startOfMonth(now),
        lte: endOfMonth(now),
      },
    },
    _sum: {
      amount: true,
    },
  });

  const dailyRate =
    ((monthlyDonations._sum.amount || 0) / now.getDate()) || 
    (goal.currentAmount / Math.max(1, Math.floor((now.getTime() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24))));

  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const daysToCompletion = dailyRate > 0 ? Math.ceil(remainingAmount / dailyRate) : Infinity;

  const projectedCompletion = new Date(now.getTime() + daysToCompletion * 24 * 60 * 60 * 1000);

  return {
    goal,
    percentageComplete: (goal.currentAmount / goal.targetAmount) * 100,
    daysRemaining,
    projectedCompletion,
    recentDonations: recentDonations.map(d => ({
      amount: d.amount,
      date: d.createdAt,
      donorName: d.donor.name,
    })),
  };
};

export const updateGoalProgress = async (
  goalId: string,
  donationAmount: number
) => {
  return prisma.donationGoal.update({
    where: { id: goalId },
    data: {
      currentAmount: {
        increment: donationAmount,
      },
    },
  });
};

export const getYearlyGoalProgress = async () => {
  const now = new Date();
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  const [yearlyGoal, totalDonations] = await Promise.all([
    prisma.donationGoal.findFirst({
      where: {
        startDate: {
          gte: yearStart,
        },
        endDate: {
          lte: yearEnd,
        },
        type: 'YEARLY',
      },
    }),
    prisma.donation.aggregate({
      where: {
        createdAt: {
          gte: yearStart,
          lte: now,
        },
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  if (!yearlyGoal) {
    return null;
  }

  const currentAmount = totalDonations._sum.amount || 0;
  const percentageComplete = (currentAmount / yearlyGoal.targetAmount) * 100;
  const daysInYear = 365;
  const daysPassed = Math.floor(
    (now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const expectedProgress = (daysPassed / daysInYear) * 100;

  return {
    goal: yearlyGoal,
    currentAmount,
    percentageComplete,
    expectedProgress,
    isAhead: percentageComplete > expectedProgress,
    projectedTotal:
      (currentAmount / daysPassed) * daysInYear,
  };
};
