import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as tf from '@tensorflow/tfjs';
import {
  TransformerModel,
  AutoEncoder,
  DeepLearningPipeline,
} from '../services/deep-learning-models';

// Mock TensorFlow Vis
jest.mock('@tensorflow/tfjs-vis', () => ({
  show: {
    fitCallbacks: () => [],
  },
}));

// Test data generation utilities
const generateSequenceData = (n: number, seqLength: number): number[][] => {
  return Array.from({ length: n }, () =>
    Array.from({ length: seqLength }, () => Math.random())
  );
};

const generateLabels = (n: number): number[] => {
  return Array.from({ length: n }, () => Math.random() * 100);
};

describe('Deep Learning Models Tests', () => {
  describe('TransformerModel', () => {
    let model: TransformerModel;
    const features = generateSequenceData(100, 10);
    const labels = generateLabels(100);

    beforeEach(() => {
      model = new TransformerModel();
    });

    it('should build model successfully', async () => {
      await expect(model.build()).resolves.not.toThrow();
    });

    it('should train model', async () => {
      await model.build();
      const history = await model.train(features, labels, 5);
      expect(history.history.loss).toBeDefined();
      expect(history.history.loss.length).toBe(5);
    });

    it('should make predictions with attention', async () => {
      await model.build();
      await model.train(features, labels, 2);
      const prediction = await model.predict(features[0]);

      expect(prediction.value).toBeDefined();
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(prediction.attention).toBeDefined();
      expect(prediction.embedding).toBeDefined();
    });

    it('should handle sequences of different lengths', async () => {
      await model.build();
      const shortSeq = generateSequenceData(1, 5)[0];
      const longSeq = generateSequenceData(1, 15)[0];

      await expect(model.predict([shortSeq])).resolves.not.toThrow();
      await expect(model.predict([longSeq])).resolves.not.toThrow();
    });
  });

  describe('AutoEncoder', () => {
    let autoencoder: AutoEncoder;
    const inputDim = 10;
    const data = generateSequenceData(100, inputDim);

    beforeEach(() => {
      autoencoder = new AutoEncoder();
    });

    it('should build autoencoder successfully', async () => {
      await expect(autoencoder.build(inputDim)).resolves.not.toThrow();
    });

    it('should train autoencoder', async () => {
      await autoencoder.build(inputDim);
      const history = await autoencoder.train(data, 5);
      expect(history.history.loss).toBeDefined();
      expect(history.history.loss.length).toBe(5);
    });

    it('should encode and decode data', async () => {
      await autoencoder.build(inputDim);
      await autoencoder.train(data, 2);

      const encoded = await autoencoder.encode(data);
      expect(encoded).toBeDefined();
      expect(encoded.length).toBe(data.length);

      const decoded = await autoencoder.decode(encoded);
      expect(decoded).toBeDefined();
      expect(decoded.length).toBe(data.length);
      expect(decoded[0].length).toBe(inputDim);
    });

    it('should detect anomalies', async () => {
      await autoencoder.build(inputDim);
      await autoencoder.train(data, 2);

      const anomalies = await autoencoder.detectAnomalies(data);
      expect(anomalies).toBeDefined();
      expect(anomalies.length).toBe(data.length);
      expect(typeof anomalies[0]).toBe('boolean');
    });
  });

  describe('DeepLearningPipeline', () => {
    let pipeline: DeepLearningPipeline;
    const inputDim = 10;
    const data = generateSequenceData(100, inputDim);
    const labels = generateLabels(100);

    beforeEach(() => {
      pipeline = new DeepLearningPipeline();
    });

    it('should initialize pipeline successfully', async () => {
      await expect(pipeline.initialize(inputDim)).resolves.not.toThrow();
    });

    it('should train pipeline', async () => {
      await pipeline.initialize(inputDim);
      await expect(pipeline.train(data, labels)).resolves.not.toThrow();
    });

    it('should make predictions', async () => {
      await pipeline.initialize(inputDim);
      await pipeline.train(data, labels);

      const prediction = await pipeline.predict([data[0]]);
      expect(prediction).toBeDefined();
      expect(prediction.value).toBeDefined();
      expect(prediction.confidence).toBeDefined();
      expect(prediction.anomalies).toBeDefined();
      expect(prediction.encoded).toBeDefined();
    });

    it('should analyze features', async () => {
      await pipeline.initialize(inputDim);
      await pipeline.train(data, labels);

      const analysis = await pipeline.analyzeFeatures([data[0]]);
      expect(analysis).toBeDefined();
      expect(analysis.encoded).toBeDefined();
      expect(analysis.decoded).toBeDefined();
      expect(analysis.reconstructionError).toBeDefined();
    });

    it('should handle edge cases', async () => {
      await pipeline.initialize(inputDim);
      await pipeline.train(data, labels);

      // Test with zero values
      const zeroData = Array(inputDim).fill(0);
      await expect(pipeline.predict([zeroData])).resolves.not.toThrow();

      // Test with extreme values
      const extremeData = Array(inputDim).fill(1e6);
      await expect(pipeline.predict([extremeData])).resolves.not.toThrow();
    });
  });

  describe('Model Performance', () => {
    let pipeline: DeepLearningPipeline;
    const inputDim = 10;
    const trainData = generateSequenceData(1000, inputDim);
    const trainLabels = generateLabels(1000);
    const testData = generateSequenceData(100, inputDim);
    const testLabels = generateLabels(100);

    beforeEach(async () => {
      pipeline = new DeepLearningPipeline();
      await pipeline.initialize(inputDim);
    });

    it('should achieve reasonable accuracy', async () => {
      // Train the model
      await pipeline.train(trainData, trainLabels);

      // Make predictions on test data
      const predictions = await Promise.all(
        testData.map(features => pipeline.predict([features]))
      );

      // Calculate MSE
      const mse = predictions.reduce(
        (sum, pred, i) => sum + Math.pow(pred.value - testLabels[i], 2),
        0
      ) / predictions.length;

      // Expect MSE to be below a reasonable threshold
      expect(mse).toBeLessThan(1000);
    });

    it('should be consistent across predictions', async () => {
      await pipeline.train(trainData, trainLabels);

      // Make multiple predictions on the same input
      const input = testData[0];
      const pred1 = await pipeline.predict([input]);
      const pred2 = await pipeline.predict([input]);

      // Check prediction consistency
      expect(pred1.value).toBeCloseTo(pred2.value, 5);
      expect(pred1.confidence).toBeCloseTo(pred2.confidence, 5);
    });

    it('should handle batch predictions efficiently', async () => {
      await pipeline.train(trainData, trainLabels);

      const startTime = Date.now();
      const predictions = await Promise.all(
        testData.map(features => pipeline.predict([features]))
      );
      const endTime = Date.now();

      // Check prediction speed (should be less than 1ms per prediction on average)
      const timePerPrediction = (endTime - startTime) / predictions.length;
      expect(timePerPrediction).toBeLessThan(1);
    });
  });
});
