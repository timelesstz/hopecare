import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { chiSquareTest, tTest } from 'simple-statistics';

export interface ABTestResult {
  testId: string;
  variant: 'A' | 'B';
  conversionRate: number;
  averageValue: number;
  sampleSize: number;
  confidence: number;
  winner: 'A' | 'B' | null;
  improvement: number;
  significanceLevel: number;
  metrics: Record<string, number>;
}

export interface ABTestMetrics {
  views: number;
  clicks: number;
  conversions: number;
  totalValue: number;
  bounceRate: number;
  timeOnPage: number;
}

const ABTestSchema = z.object({
  name: z.string(),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  variants: z.object({
    A: z.object({
      name: z.string(),
      description: z.string(),
    }),
    B: z.object({
      name: z.string(),
      description: z.string(),
    }),
  }),
  targetMetric: z.string(),
  minimumSampleSize: z.number().optional(),
  significanceLevel: z.number().default(0.05),
});

export const createABTest = async (testData: z.infer<typeof ABTestSchema>) => {
  const validatedData = ABTestSchema.parse(testData);
  
  return prisma.abTest.create({
    data: {
      ...validatedData,
      status: 'active',
      variants: {
        create: [
          { ...validatedData.variants.A, type: 'A' },
          { ...validatedData.variants.B, type: 'B' },
        ],
      },
    },
  });
};

export const recordTestEvent = async (
  testId: string,
  variant: 'A' | 'B',
  eventType: string,
  value?: number
) => {
  return prisma.abTestEvent.create({
    data: {
      testId,
      variant,
      eventType,
      value,
      timestamp: new Date(),
    },
  });
};

export const calculateTestResults = async (testId: string): Promise<ABTestResult> => {
  const test = await prisma.abTest.findUnique({
    where: { id: testId },
    include: {
      variants: true,
      events: true,
    },
  });

  if (!test) {
    throw new Error('Test not found');
  }

  const variantA = calculateVariantMetrics(test.events.filter(e => e.variant === 'A'));
  const variantB = calculateVariantMetrics(test.events.filter(e => e.variant === 'B'));

  // Statistical calculations
  const pValue = calculatePValue(variantA, variantB, test.targetMetric);
  const improvement = calculateImprovement(variantA, variantB, test.targetMetric);
  const winner = determineWinner(variantA, variantB, pValue, test.significanceLevel);

  return {
    testId,
    variant: winner || null,
    conversionRate: winner === 'A' ? variantA.conversions / variantA.views : variantB.conversions / variantB.views,
    averageValue: winner === 'A' ? variantA.totalValue / variantA.conversions : variantB.totalValue / variantB.conversions,
    sampleSize: variantA.views + variantB.views,
    confidence: (1 - pValue) * 100,
    winner,
    improvement,
    significanceLevel: test.significanceLevel,
    metrics: {
      variantA: variantA.conversions / variantA.views,
      variantB: variantB.conversions / variantB.views,
    },
  };
};

const calculateVariantMetrics = (events: any[]): ABTestMetrics => {
  const views = events.filter(e => e.eventType === 'view').length;
  const clicks = events.filter(e => e.eventType === 'click').length;
  const conversions = events.filter(e => e.eventType === 'conversion').length;
  const totalValue = events
    .filter(e => e.eventType === 'conversion')
    .reduce((sum, e) => sum + (e.value || 0), 0);
  const bounces = events.filter(e => e.eventType === 'bounce').length;
  const timeOnPage = events
    .filter(e => e.eventType === 'timeOnPage')
    .reduce((sum, e) => sum + (e.value || 0), 0);

  return {
    views,
    clicks,
    conversions,
    totalValue,
    bounceRate: bounces / views,
    timeOnPage: timeOnPage / views,
  };
};

const calculatePValue = (
  variantA: ABTestMetrics,
  variantB: ABTestMetrics,
  metric: string
): number => {
  switch (metric) {
    case 'conversion':
      return chiSquareTest([
        [variantA.conversions, variantA.views - variantA.conversions],
        [variantB.conversions, variantB.views - variantB.conversions],
      ]);
    case 'value':
      return tTest(
        variantA.totalValue / variantA.conversions,
        variantB.totalValue / variantB.conversions,
        variantA.conversions,
        variantB.conversions
      );
    default:
      return 1;
  }
};

const calculateImprovement = (
  variantA: ABTestMetrics,
  variantB: ABTestMetrics,
  metric: string
): number => {
  const baselineRate = variantA[metric as keyof ABTestMetrics] as number;
  const testRate = variantB[metric as keyof ABTestMetrics] as number;
  return ((testRate - baselineRate) / baselineRate) * 100;
};

const determineWinner = (
  variantA: ABTestMetrics,
  variantB: ABTestMetrics,
  pValue: number,
  significanceLevel: number
): 'A' | 'B' | null => {
  if (pValue > significanceLevel) {
    return null;
  }

  return variantA.conversions / variantA.views > variantB.conversions / variantB.views
    ? 'A'
    : 'B';
};

export const getTestRecommendations = async (testId: string): Promise<string[]> => {
  const results = await calculateTestResults(testId);
  const recommendations: string[] = [];

  if (!results.winner) {
    recommendations.push('Test needs more data to reach statistical significance');
    return recommendations;
  }

  if (results.improvement > 0) {
    recommendations.push(`Variant ${results.winner} shows a ${results.improvement.toFixed(2)}% improvement`);
  }

  if (results.confidence < 95) {
    recommendations.push('Consider running the test longer to increase confidence');
  }

  return recommendations;
};
