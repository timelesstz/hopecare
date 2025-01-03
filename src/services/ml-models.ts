import { prisma } from '@/lib/prisma';
import * as tf from '@tensorflow/tfjs';
import { LogisticRegression } from 'ml-logistic-regression';
import { RandomForestClassifier } from 'ml-random-forest';
import { Matrix } from 'ml-matrix';

interface DonorFeatures {
  donationFrequency: number;
  averageDonationAmount: number;
  daysSinceLastDonation: number;
  totalDonations: number;
  engagementScore: number;
  seasonalityScore: number;
}

interface PredictionResult {
  probability: number;
  confidence: number;
  features: string[];
  importance: number[];
}

export interface DonorBehaviorPrediction {
  nextDonationAmount: number;
  churnProbability: number;
  upgradeProbability: number;
  bestContactTime: string;
  preferredChannel: string;
  interests: string[];
  suggestedCampaigns: string[];
}

// Feature engineering
const calculateEngagementScore = (
  donations: any[],
  events: any[],
  communications: any[]
) => {
  const donationScore = donations.length * 2;
  const eventScore = events.length;
  const communicationScore = communications.length * 0.5;
  return donationScore + eventScore + communicationScore;
};

const calculateSeasonalityScore = (donations: any[]) => {
  const monthlyDonations = new Array(12).fill(0);
  donations.forEach(donation => {
    const month = new Date(donation.createdAt).getMonth();
    monthlyDonations[month]++;
  });
  const variance = calculateVariance(monthlyDonations);
  return variance / Math.max(...monthlyDonations);
};

const calculateVariance = (array: number[]) => {
  const mean = array.reduce((a, b) => a + b, 0) / array.length;
  return array.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / array.length;
};

// Neural Network for Next Donation Amount Prediction
const createDonationAmountModel = () => {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [6] }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1 }));
  
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
  });
  
  return model;
};

// Random Forest for Churn Prediction
const createChurnModel = async (features: DonorFeatures[], labels: number[]) => {
  const rf = new RandomForestClassifier({
    nEstimators: 100,
    maxDepth: 10,
    minSamplesSplit: 2,
  });
  
  const X = new Matrix(features.map(f => Object.values(f)));
  await rf.train(X, labels);
  return rf;
};

// Logistic Regression for Upgrade Probability
const createUpgradeModel = (features: DonorFeatures[], labels: number[]) => {
  const lr = new LogisticRegression({
    numSteps: 1000,
    learningRate: 0.1,
  });
  
  const X = new Matrix(features.map(f => Object.values(f)));
  lr.train(X, labels);
  return lr;
};

export const trainModels = async () => {
  // Fetch training data
  const donors = await prisma.donor.findMany({
    include: {
      donations: true,
      eventParticipations: true,
      communications: true,
    },
  });

  const features: DonorFeatures[] = donors.map(donor => ({
    donationFrequency: donor.donations.length / Math.max(1, donor.daysActive),
    averageDonationAmount: donor.donations.reduce((sum, d) => sum + d.amount, 0) / donor.donations.length,
    daysSinceLastDonation: Math.floor(
      (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
    ),
    totalDonations: donor.donations.length,
    engagementScore: calculateEngagementScore(
      donor.donations,
      donor.eventParticipations,
      donor.communications
    ),
    seasonalityScore: calculateSeasonalityScore(donor.donations),
  }));

  // Prepare labels
  const churnLabels = donors.map(d => (d.status === 'churned' ? 1 : 0));
  const upgradeLabels = donors.map(d => (d.hasUpgraded ? 1 : 0));

  // Train models
  const amountModel = createDonationAmountModel();
  const churnModel = await createChurnModel(features, churnLabels);
  const upgradeModel = createUpgradeModel(features, upgradeLabels);

  return {
    amountModel,
    churnModel,
    upgradeModel,
  };
};

export const predictDonorBehavior = async (
  donorId: string
): Promise<DonorBehaviorPrediction> => {
  const donor = await prisma.donor.findUnique({
    where: { id: donorId },
    include: {
      donations: true,
      eventParticipations: true,
      communications: true,
    },
  });

  if (!donor) {
    throw new Error('Donor not found');
  }

  const features: DonorFeatures = {
    donationFrequency: donor.donations.length / Math.max(1, donor.daysActive),
    averageDonationAmount: donor.donations.reduce((sum, d) => sum + d.amount, 0) / donor.donations.length,
    daysSinceLastDonation: Math.floor(
      (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
    ),
    totalDonations: donor.donations.length,
    engagementScore: calculateEngagementScore(
      donor.donations,
      donor.eventParticipations,
      donor.communications
    ),
    seasonalityScore: calculateSeasonalityScore(donor.donations),
  };

  const models = await trainModels();

  // Predict next donation amount
  const tensorFeatures = tf.tensor2d([Object.values(features)]);
  const predictedAmount = models.amountModel.predict(tensorFeatures) as tf.Tensor;
  const nextDonationAmount = (await predictedAmount.data())[0];

  // Predict churn probability
  const churnProbability = models.churnModel.predict(new Matrix([Object.values(features)]))[0];

  // Predict upgrade probability
  const upgradeProbability = models.upgradeModel.predict(new Matrix([Object.values(features)]))[0];

  // Determine best contact time based on past interactions
  const interactions = [...donor.donations, ...donor.communications]
    .map(i => new Date(i.createdAt).getHours())
    .reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  
  const bestHour = Object.entries(interactions)
    .sort(([, a], [, b]) => b - a)[0][0];
  
  // Determine preferred channel based on response rates
  const channels = donor.communications
    .filter(c => c.response)
    .reduce((acc, comm) => {
      acc[comm.channel] = (acc[comm.channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const preferredChannel = Object.entries(channels)
    .sort(([, a], [, b]) => b - a)[0][0];

  // Analyze interests based on donation patterns and event participation
  const interests = new Set<string>();
  donor.donations
    .filter(d => d.projectId)
    .forEach(d => interests.add(d.projectCategory));
  donor.eventParticipations
    .forEach(e => interests.add(e.category));

  // Suggest campaigns based on interests and behavior
  const suggestedCampaigns = await prisma.campaign.findMany({
    where: {
      OR: [...interests].map(interest => ({
        category: interest,
      })),
      status: 'active',
    },
    take: 3,
  });

  return {
    nextDonationAmount,
    churnProbability,
    upgradeProbability,
    bestContactTime: `${bestHour}:00`,
    preferredChannel,
    interests: [...interests],
    suggestedCampaigns: suggestedCampaigns.map(c => c.id),
  };
};
