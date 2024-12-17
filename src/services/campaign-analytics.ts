import { prisma } from '@/lib/prisma';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export interface CampaignMetrics {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal: number;
  currentAmount: number;
  donorCount: number;
  averageDonation: number;
  conversionRate: number;
  costPerDonation: number;
  roi: number;
  channelPerformance: Array<{
    channel: string;
    donations: number;
    amount: number;
    donors: number;
  }>;
  dailyPerformance: Array<{
    date: string;
    donations: number;
    amount: number;
  }>;
}

export interface CampaignComparison {
  campaigns: Array<{
    id: string;
    name: string;
    performance: number;
    improvement: number;
  }>;
  bestPerforming: {
    name: string;
    metrics: Partial<CampaignMetrics>;
  };
  insights: Array<{
    type: 'success' | 'warning' | 'info';
    message: string;
  }>;
}

export const getCampaignMetrics = async (
  campaignId: string
): Promise<CampaignMetrics> => {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: {
      donations: {
        include: {
          donor: true,
        },
      },
      marketingCosts: true,
    },
  });

  const totalCosts = campaign.marketingCosts.reduce(
    (sum, cost) => sum + cost.amount,
    0
  );

  const channelPerformance = await prisma.donation.groupBy({
    by: ['channel'],
    where: {
      campaignId,
    },
    _sum: {
      amount: true,
    },
    _count: true,
  });

  const dailyPerformance = await Promise.all(
    Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i);
      return prisma.donation.aggregate({
        where: {
          campaignId,
          createdAt: {
            gte: startOfDay(date),
            lte: endOfDay(date),
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }).then(result => ({
        date: date.toISOString().split('T')[0],
        donations: result._count,
        amount: result._sum.amount || 0,
      }));
    })
  );

  const uniqueDonors = new Set(campaign.donations.map(d => d.donorId));
  const totalAmount = campaign.donations.reduce(
    (sum, donation) => sum + donation.amount,
    0
  );

  return {
    id: campaign.id,
    name: campaign.name,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    goal: campaign.goal,
    currentAmount: totalAmount,
    donorCount: uniqueDonors.size,
    averageDonation: totalAmount / campaign.donations.length || 0,
    conversionRate: campaign.donations.length / campaign.impressions,
    costPerDonation: totalCosts / campaign.donations.length || 0,
    roi: (totalAmount - totalCosts) / totalCosts,
    channelPerformance: channelPerformance.map(channel => ({
      channel: channel.channel,
      donations: channel._count,
      amount: channel._sum.amount || 0,
      donors: new Set(
        campaign.donations
          .filter(d => d.channel === channel.channel)
          .map(d => d.donorId)
      ).size,
    })),
    dailyPerformance: dailyPerformance.reverse(),
  };
};

export const compareCampaigns = async (
  campaignIds: string[]
): Promise<CampaignComparison> => {
  const campaigns = await Promise.all(
    campaignIds.map(id => getCampaignMetrics(id))
  );

  const calculatePerformanceScore = (campaign: CampaignMetrics) => {
    const goalProgress = campaign.currentAmount / campaign.goal;
    const conversionScore = campaign.conversionRate * 100;
    const roiScore = campaign.roi * 100;
    return (goalProgress + conversionScore + roiScore) / 3;
  };

  const campaignScores = campaigns.map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    performance: calculatePerformanceScore(campaign),
    improvement:
      campaign.dailyPerformance[campaign.dailyPerformance.length - 1].amount /
        campaign.dailyPerformance[0].amount -
      1,
  }));

  const bestPerforming = campaigns.reduce((best, current) =>
    calculatePerformanceScore(current) > calculatePerformanceScore(best)
      ? current
      : best
  );

  const insights = [];

  // Analyze channel effectiveness
  const bestChannels = campaigns
    .flatMap(c => c.channelPerformance)
    .reduce((acc, channel) => {
      const existing = acc.find(c => c.channel === channel.channel);
      if (existing) {
        existing.amount += channel.amount;
        existing.donations += channel.donations;
      } else {
        acc.push({ ...channel });
      }
      return acc;
    }, [] as typeof campaigns[0]['channelPerformance'])
    .sort((a, b) => b.amount - a.amount);

  insights.push({
    type: 'success',
    message: `${bestChannels[0].channel} is the most effective channel with $${bestChannels[0].amount.toLocaleString()} in donations`,
  });

  // Analyze timing patterns
  const timePatterns = campaigns
    .flatMap(c => c.dailyPerformance)
    .reduce(
      (acc, day) => {
        const dayOfWeek = new Date(day.date).getDay();
        acc.byDay[dayOfWeek].donations += day.donations;
        acc.byDay[dayOfWeek].amount += day.amount;
        return acc;
      },
      {
        byDay: Array.from({ length: 7 }, () => ({
          donations: 0,
          amount: 0,
        })),
      }
    );

  const bestDay = timePatterns.byDay.reduce(
    (best, current, i) => (current.amount > best.amount ? { ...current, day: i } : best),
    { amount: 0, donations: 0, day: 0 }
  );

  insights.push({
    type: 'info',
    message: `Donations are highest on ${
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
        bestDay.day
      ]
    }s`,
  });

  // ROI Analysis
  const averageROI =
    campaigns.reduce((sum, campaign) => sum + campaign.roi, 0) / campaigns.length;
  if (averageROI < 0.5) {
    insights.push({
      type: 'warning',
      message: 'Campaign ROI is below target. Consider optimizing marketing spend.',
    });
  }

  return {
    campaigns: campaignScores,
    bestPerforming: {
      name: bestPerforming.name,
      metrics: {
        currentAmount: bestPerforming.currentAmount,
        donorCount: bestPerforming.donorCount,
        roi: bestPerforming.roi,
        conversionRate: bestPerforming.conversionRate,
      },
    },
    insights,
  };
};
