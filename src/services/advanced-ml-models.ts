import { prisma } from '@/lib/prisma';
import * as tf from '@tensorflow/tfjs';
import { SVM } from 'ml-svm';
import { KMeans } from 'ml-kmeans';
import { GradientBoostingRegression } from 'ml-gradient-boosting';
import { Matrix } from 'ml-matrix';
import { DecisionTreeRegression } from 'ml-cart';

interface AdvancedPredictionResult {
  donorSegment: string;
  lifetimeValue: number;
  nextCampaignResponse: number;
  recommendedAmount: number;
  bestCommunicationTime: string;
  interestTopics: string[];
  riskScore: number;
}

// Gradient Boosting for Lifetime Value Prediction
export class LifetimeValuePredictor {
  private model: GradientBoostingRegression;

  async train(features: number[][], values: number[]) {
    this.model = new GradientBoostingRegression({
      maxDepth: 4,
      minNumSamples: 5,
      learningRate: 0.1,
      numIterations: 200,
      subsamplingRatio: 0.8,
    });

    await this.model.train(features, values);
  }

  predict(features: number[]): number {
    return this.model.predict([features])[0];
  }
}

// SVM for Campaign Response Prediction
export class CampaignResponsePredictor {
  private model: SVM;

  async train(features: number[][], labels: number[]) {
    this.model = new SVM({
      kernel: 'rbf',
      gamma: 0.5,
      C: 1.0,
    });

    await this.model.train(new Matrix(features), labels);
  }

  predict(features: number[]): number {
    return this.model.predict(new Matrix([features]))[0];
  }
}

// K-Means for Donor Segmentation
export class DonorSegmentation {
  private model: KMeans;
  private readonly numClusters = 5;
  private clusterLabels = [
    'High Value Regular',
    'Potential High Value',
    'Consistent Medium',
    'Occasional Small',
    'At Risk',
  ];

  async train(features: number[][]) {
    this.model = new KMeans(this.numClusters);
    await this.model.train(features);
  }

  predict(features: number[]): string {
    const cluster = this.model.predict([features])[0];
    return this.clusterLabels[cluster];
  }
}

// Decision Tree for Recommended Amount
export class AmountRecommender {
  private model: DecisionTreeRegression;

  async train(features: number[][], values: number[]) {
    this.model = new DecisionTreeRegression({
      maxDepth: 10,
      minNumSamples: 5,
    });

    await this.model.train(new Matrix(features), values);
  }

  predict(features: number[]): number {
    return this.model.predict([features])[0];
  }
}

// Neural Network for Risk Scoring
export class RiskScorer {
  private model: tf.Sequential;

  async train(features: number[][], scores: number[]) {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 32, activation: 'relu', inputShape: [features[0].length] }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }),
      ],
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(scores.map(s => [s]));

    await this.model.fit(xs, ys, {
      epochs: 50,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
        },
      },
    });
  }

  predict(features: number[]): number {
    const prediction = this.model.predict(tf.tensor2d([features])) as tf.Tensor;
    return prediction.dataSync()[0];
  }
}

export class AdvancedDonorPredictor {
  private lifetimePredictor: LifetimeValuePredictor;
  private campaignPredictor: CampaignResponsePredictor;
  private segmentation: DonorSegmentation;
  private amountRecommender: AmountRecommender;
  private riskScorer: RiskScorer;

  constructor() {
    this.lifetimePredictor = new LifetimeValuePredictor();
    this.campaignPredictor = new CampaignResponsePredictor();
    this.segmentation = new DonorSegmentation();
    this.amountRecommender = new AmountRecommender();
    this.riskScorer = new RiskScorer();
  }

  async trainModels() {
    const donors = await prisma.donor.findMany({
      include: {
        donations: true,
        communications: true,
        eventParticipations: true,
      },
    });

    const features = donors.map(donor => this.extractFeatures(donor));
    const lifetimeValues = donors.map(donor => this.calculateLifetimeValue(donor));
    const campaignResponses = donors.map(donor => this.calculateCampaignResponse(donor));
    const amounts = donors.map(donor => this.calculateAverageAmount(donor));
    const riskScores = donors.map(donor => this.calculateRiskScore(donor));

    await Promise.all([
      this.lifetimePredictor.train(features, lifetimeValues),
      this.campaignPredictor.train(features, campaignResponses),
      this.segmentation.train(features),
      this.amountRecommender.train(features, amounts),
      this.riskScorer.train(features, riskScores),
    ]);
  }

  async predictDonor(donorId: string): Promise<AdvancedPredictionResult> {
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      include: {
        donations: true,
        communications: true,
        eventParticipations: true,
      },
    });

    if (!donor) {
      throw new Error('Donor not found');
    }

    const features = this.extractFeatures(donor);

    return {
      donorSegment: this.segmentation.predict(features),
      lifetimeValue: this.lifetimePredictor.predict(features),
      nextCampaignResponse: this.campaignPredictor.predict(features),
      recommendedAmount: this.amountRecommender.predict(features),
      bestCommunicationTime: this.predictBestCommunicationTime(donor),
      interestTopics: this.predictInterestTopics(donor),
      riskScore: this.riskScorer.predict(features),
    };
  }

  private extractFeatures(donor: any): number[] {
    return [
      donor.donations.length,
      this.calculateAverageAmount(donor),
      this.calculateDonationFrequency(donor),
      this.calculateEngagementScore(donor),
      this.calculateResponseRate(donor),
      this.calculateRetentionScore(donor),
    ];
  }

  private calculateLifetimeValue(donor: any): number {
    return donor.donations.reduce((sum: number, d: any) => sum + d.amount, 0);
  }

  private calculateCampaignResponse(donor: any): number {
    const responses = donor.communications.filter((c: any) => c.response).length;
    return responses / Math.max(1, donor.communications.length);
  }

  private calculateAverageAmount(donor: any): number {
    if (donor.donations.length === 0) return 0;
    return this.calculateLifetimeValue(donor) / donor.donations.length;
  }

  private calculateDonationFrequency(donor: any): number {
    if (donor.donations.length <= 1) return 0;
    const firstDonation = new Date(donor.donations[0].createdAt);
    const lastDonation = new Date(donor.donations[donor.donations.length - 1].createdAt);
    const daysDiff = (lastDonation.getTime() - firstDonation.getTime()) / (1000 * 60 * 60 * 24);
    return donor.donations.length / Math.max(1, daysDiff);
  }

  private calculateEngagementScore(donor: any): number {
    return (
      donor.donations.length * 2 +
      donor.communications.length +
      donor.eventParticipations.length * 1.5
    );
  }

  private calculateResponseRate(donor: any): number {
    if (donor.communications.length === 0) return 0;
    return (
      donor.communications.filter((c: any) => c.response).length /
      donor.communications.length
    );
  }

  private calculateRetentionScore(donor: any): number {
    if (donor.donations.length <= 1) return 0;
    const lastDonation = new Date(donor.donations[donor.donations.length - 1].createdAt);
    const daysSinceLastDonation =
      (new Date().getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24);
    return Math.exp(-daysSinceLastDonation / 365);
  }

  private calculateRiskScore(donor: any): number {
    const retentionScore = this.calculateRetentionScore(donor);
    const engagementScore = this.calculateEngagementScore(donor);
    const responseRate = this.calculateResponseRate(donor);
    return 1 - (retentionScore + engagementScore / 10 + responseRate) / 3;
  }

  private predictBestCommunicationTime(donor: any): string {
    const successfulCommunications = donor.communications
      .filter((c: any) => c.response)
      .map((c: any) => new Date(c.createdAt).getHours());

    if (successfulCommunications.length === 0) return '09:00';

    const mostFrequentHour = successfulCommunications.reduce(
      (acc: { hour: number; count: number }, hour: number) => {
        const count = successfulCommunications.filter(h => h === hour).length;
        return count > acc.count ? { hour, count } : acc;
      },
      { hour: 9, count: 0 }
    );

    return `${mostFrequentHour.hour.toString().padStart(2, '0')}:00`;
  }

  private predictInterestTopics(donor: any): string[] {
    const topics = new Set<string>();
    donor.donations
      .filter((d: any) => d.projectCategory)
      .forEach((d: any) => topics.add(d.projectCategory));
    donor.eventParticipations
      .forEach((e: any) => topics.add(e.category));
    return Array.from(topics);
  }
}
