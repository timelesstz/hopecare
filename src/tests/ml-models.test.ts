import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  LifetimeValuePredictor,
  CampaignResponsePredictor,
  DonorSegmentation,
  AmountRecommender,
  RiskScorer,
  AdvancedDonorPredictor,
} from '../services/advanced-ml-models';

// Mock data
const mockDonors = [
  {
    id: '1',
    donations: [
      { amount: 100, createdAt: '2024-01-01', projectCategory: 'education' },
      { amount: 200, createdAt: '2024-02-01', projectCategory: 'health' },
    ],
    communications: [
      { response: true, createdAt: '2024-01-15' },
      { response: false, createdAt: '2024-02-15' },
    ],
    eventParticipations: [
      { category: 'fundraising', date: '2024-01-20' },
    ],
  },
  // Add more mock donors...
];

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    donor: {
      findMany: jest.fn().mockResolvedValue(mockDonors),
      findUnique: jest.fn().mockResolvedValue(mockDonors[0]),
    },
  },
}));

describe('ML Models Tests', () => {
  describe('LifetimeValuePredictor', () => {
    let predictor: LifetimeValuePredictor;
    const mockFeatures = [[1, 2, 3], [4, 5, 6]];
    const mockValues = [100, 200];

    beforeEach(() => {
      predictor = new LifetimeValuePredictor();
    });

    it('should train successfully', async () => {
      await predictor.train(mockFeatures, mockValues);
      const prediction = predictor.predict(mockFeatures[0]);
      expect(typeof prediction).toBe('number');
      expect(prediction).toBeGreaterThan(0);
    });

    it('should make reasonable predictions', async () => {
      await predictor.train(mockFeatures, mockValues);
      const prediction = predictor.predict([2, 3, 4]);
      expect(prediction).toBeGreaterThanOrEqual(0);
      expect(prediction).toBeLessThan(1000); // Adjust based on your data scale
    });
  });

  describe('CampaignResponsePredictor', () => {
    let predictor: CampaignResponsePredictor;
    const mockFeatures = [[1, 2], [3, 4]];
    const mockLabels = [0, 1];

    beforeEach(() => {
      predictor = new CampaignResponsePredictor();
    });

    it('should train and predict binary outcomes', async () => {
      await predictor.train(mockFeatures, mockLabels);
      const prediction = predictor.predict(mockFeatures[0]);
      expect(prediction).toBeGreaterThanOrEqual(0);
      expect(prediction).toBeLessThanOrEqual(1);
    });
  });

  describe('DonorSegmentation', () => {
    let segmentation: DonorSegmentation;
    const mockFeatures = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12],
      [13, 14, 15],
    ];

    beforeEach(() => {
      segmentation = new DonorSegmentation();
    });

    it('should assign segments to donors', async () => {
      await segmentation.train(mockFeatures);
      const segment = segmentation.predict(mockFeatures[0]);
      expect(typeof segment).toBe('string');
      expect(segment).toMatch(/^(High Value Regular|Potential High Value|Consistent Medium|Occasional Small|At Risk)$/);
    });
  });

  describe('AmountRecommender', () => {
    let recommender: AmountRecommender;
    const mockFeatures = [[1, 2], [3, 4]];
    const mockAmounts = [50, 100];

    beforeEach(() => {
      recommender = new AmountRecommender();
    });

    it('should recommend reasonable amounts', async () => {
      await recommender.train(mockFeatures, mockAmounts);
      const recommendation = recommender.predict(mockFeatures[0]);
      expect(typeof recommendation).toBe('number');
      expect(recommendation).toBeGreaterThan(0);
      expect(recommendation).toBeLessThan(1000); // Adjust based on your data scale
    });
  });

  describe('RiskScorer', () => {
    let scorer: RiskScorer;
    const mockFeatures = [[1, 2], [3, 4]];
    const mockScores = [0.2, 0.8];

    beforeEach(() => {
      scorer = new RiskScorer();
    });

    it('should calculate risk scores between 0 and 1', async () => {
      await scorer.train(mockFeatures, mockScores);
      const risk = scorer.predict(mockFeatures[0]);
      expect(risk).toBeGreaterThanOrEqual(0);
      expect(risk).toBeLessThanOrEqual(1);
    });
  });

  describe('AdvancedDonorPredictor', () => {
    let predictor: AdvancedDonorPredictor;

    beforeEach(() => {
      predictor = new AdvancedDonorPredictor();
    });

    it('should train all models successfully', async () => {
      await expect(predictor.trainModels()).resolves.not.toThrow();
    });

    it('should make comprehensive predictions', async () => {
      await predictor.trainModels();
      const predictions = await predictor.predictDonor('1');
      
      expect(predictions).toHaveProperty('donorSegment');
      expect(predictions).toHaveProperty('lifetimeValue');
      expect(predictions).toHaveProperty('nextCampaignResponse');
      expect(predictions).toHaveProperty('recommendedAmount');
      expect(predictions).toHaveProperty('bestCommunicationTime');
      expect(predictions).toHaveProperty('interestTopics');
      expect(predictions).toHaveProperty('riskScore');

      expect(predictions.lifetimeValue).toBeGreaterThan(0);
      expect(predictions.nextCampaignResponse).toBeGreaterThanOrEqual(0);
      expect(predictions.nextCampaignResponse).toBeLessThanOrEqual(1);
      expect(predictions.recommendedAmount).toBeGreaterThan(0);
      expect(predictions.riskScore).toBeGreaterThanOrEqual(0);
      expect(predictions.riskScore).toBeLessThanOrEqual(1);
    });

    it('should handle missing donor gracefully', async () => {
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      await expect(predictor.predictDonor('nonexistent')).rejects.toThrow('Donor not found');
    });
  });
});
