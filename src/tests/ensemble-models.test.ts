import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  XGBoostPredictor,
  LightGBMPredictor,
  RandomForestEnsemble,
  AdaBoostPredictor,
  TimeSeriesPredictor,
  EnsemblePredictor,
} from '../services/ensemble-ml-models';

// Mock data generation utilities
const generateTimeSeriesData = (n: number): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < n; i++) {
    // Generate synthetic time series with trend and seasonality
    const trend = 0.1 * i;
    const seasonality = Math.sin(i * 2 * Math.PI / 12) * 10;
    const noise = Math.random() * 5;
    data.push([trend + seasonality + noise]);
  }
  return data;
};

const generateFeatures = (n: number, dim: number): number[][] => {
  return Array.from({ length: n }, () =>
    Array.from({ length: dim }, () => Math.random())
  );
};

const generateLabels = (n: number): number[] => {
  return Array.from({ length: n }, () => Math.random() * 100);
};

// Mock donor data
const mockDonor = {
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
};

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    donor: {
      findUnique: jest.fn().mockResolvedValue(mockDonor),
    },
  },
}));

describe('Ensemble ML Models Tests', () => {
  describe('XGBoostPredictor', () => {
    let predictor: XGBoostPredictor;
    const features = generateFeatures(100, 5);
    const labels = generateLabels(100);

    beforeEach(() => {
      predictor = new XGBoostPredictor();
    });

    it('should train successfully', async () => {
      await predictor.train(features, labels);
      expect(predictor.predict(features[0])).toBeDefined();
    });

    it('should provide feature importance', async () => {
      await predictor.train(features, labels);
      const importance = predictor.getFeatureImportance();
      expect(importance).toBeDefined();
      expect(Object.keys(importance).length).toBeGreaterThan(0);
    });

    it('should make reasonable predictions', async () => {
      await predictor.train(features, labels);
      const prediction = predictor.predict(features[0]);
      expect(prediction).toBeGreaterThanOrEqual(0);
      expect(prediction).toBeLessThan(1000);
    });
  });

  describe('LightGBMPredictor', () => {
    let predictor: LightGBMPredictor;
    const features = generateFeatures(100, 5);
    const labels = generateLabels(100);

    beforeEach(() => {
      predictor = new LightGBMPredictor();
    });

    it('should train and predict', async () => {
      await predictor.train(features, labels);
      const prediction = predictor.predict(features[0]);
      expect(prediction).toBeDefined();
      expect(typeof prediction).toBe('number');
    });
  });

  describe('RandomForestEnsemble', () => {
    let ensemble: RandomForestEnsemble;
    const features = generateFeatures(100, 5);
    const labels = generateLabels(100);

    beforeEach(() => {
      ensemble = new RandomForestEnsemble();
    });

    it('should train successfully', async () => {
      await ensemble.train(features, labels);
      expect(ensemble.predict(features[0])).toBeDefined();
    });

    it('should provide individual tree predictions', async () => {
      await ensemble.train(features, labels);
      const treePredictions = ensemble.getTreePredictions(features[0]);
      expect(Array.isArray(treePredictions)).toBe(true);
      expect(treePredictions.length).toBeGreaterThan(0);
    });
  });

  describe('TimeSeriesPredictor', () => {
    let predictor: TimeSeriesPredictor;
    const timeSeriesData = generateTimeSeriesData(24); // 2 years of monthly data

    beforeEach(() => {
      predictor = new TimeSeriesPredictor();
    });

    it('should train and forecast', async () => {
      await predictor.train(timeSeriesData, 12);
      const result = predictor.predict(timeSeriesData);
      expect(result.forecast).toBeDefined();
      expect(result.forecast.length).toBe(12);
    });

    it('should provide confidence intervals', async () => {
      await predictor.train(timeSeriesData, 12);
      const result = predictor.predict(timeSeriesData);
      expect(result.confidence).toBeDefined();
      expect(result.confidence.length).toBe(12);
      result.confidence.forEach(interval => {
        expect(interval).toBeGreaterThan(0);
      });
    });

    it('should decompose time series', async () => {
      await predictor.train(timeSeriesData, 12);
      const result = predictor.predict(timeSeriesData);
      expect(result.seasonality).toBeDefined();
      expect(result.trend).toBeDefined();
      expect(result.seasonality.length).toBeGreaterThan(0);
      expect(result.trend.length).toBeGreaterThan(0);
    });
  });

  describe('EnsemblePredictor', () => {
    let predictor: EnsemblePredictor;
    const features = generateFeatures(100, 5);
    const labels = generateLabels(100);
    const timeSeriesData = generateTimeSeriesData(24);

    beforeEach(() => {
      predictor = new EnsemblePredictor();
    });

    it('should train all models successfully', async () => {
      await expect(predictor.trainModels(features, labels, timeSeriesData))
        .resolves.not.toThrow();
    });

    it('should make ensemble predictions', async () => {
      await predictor.trainModels(features, labels, timeSeriesData);
      const result = predictor.predict(features[0], timeSeriesData);
      
      expect(result.predictedAmount).toBeDefined();
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
      expect(Object.keys(result.modelContributions).length).toBe(4);
      expect(result.uncertaintyRange).toHaveLength(2);
      expect(result.uncertaintyRange[0]).toBeLessThan(result.uncertaintyRange[1]);
    });

    it('should predict for specific donor', async () => {
      await predictor.trainModels(features, labels, timeSeriesData);
      const result = await predictor.predictForDonor('1');
      
      expect(result).toBeDefined();
      expect(result.predictedAmount).toBeGreaterThan(0);
      expect(result.confidenceScore).toBeGreaterThan(0);
      expect(result.modelContributions).toBeDefined();
      expect(result.featureImportance).toBeDefined();
    });

    it('should handle missing donor gracefully', async () => {
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      await predictor.trainModels(features, labels, timeSeriesData);
      await expect(predictor.predictForDonor('nonexistent'))
        .rejects.toThrow('Donor not found');
    });

    it('should provide consistent predictions', async () => {
      await predictor.trainModels(features, labels, timeSeriesData);
      const prediction1 = predictor.predict(features[0], timeSeriesData);
      const prediction2 = predictor.predict(features[0], timeSeriesData);
      expect(prediction1.predictedAmount).toBeCloseTo(prediction2.predictedAmount, 5);
    });
  });
});
