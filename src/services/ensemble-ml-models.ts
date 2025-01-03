import { prisma } from '@/lib/prisma';
import * as tf from '@tensorflow/tfjs';
import { XGBoost } from 'ml-xgboost';
import { LightGBM } from 'lightgbm';
import { RandomForest } from 'random-forest';
import { AdaBoost } from 'ml-adaboost';
import { Matrix } from 'ml-matrix';

interface EnsemblePredictionResult {
  predictedAmount: number;
  confidenceScore: number;
  modelContributions: Record<string, number>;
  featureImportance: Record<string, number>;
  uncertaintyRange: [number, number];
}

interface TimeSeriesResult {
  forecast: number[];
  confidence: number[];
  seasonality: number[];
  trend: number[];
}

export class XGBoostPredictor {
  private model: XGBoost;

  async train(features: number[][], labels: number[]) {
    this.model = new XGBoost({
      booster: 'gbtree',
      objective: 'reg:squarederror',
      maxDepth: 6,
      eta: 0.1,
      nEstimators: 100,
      colsampleBytree: 0.8,
      subsample: 0.8,
    });

    await this.model.train(features, labels);
  }

  predict(features: number[]): number {
    return this.model.predict([features])[0];
  }

  getFeatureImportance(): Record<string, number> {
    return this.model.getFeatureImportance();
  }
}

export class LightGBMPredictor {
  private model: LightGBM;

  async train(features: number[][], labels: number[]) {
    this.model = new LightGBM({
      objective: 'regression',
      numLeaves: 31,
      learningRate: 0.05,
      nEstimators: 100,
      featureFraction: 0.8,
      baggingFraction: 0.8,
    });

    await this.model.train(features, labels);
  }

  predict(features: number[]): number {
    return this.model.predict([features])[0];
  }
}

export class RandomForestEnsemble {
  private model: RandomForest;

  async train(features: number[][], labels: number[]) {
    this.model = new RandomForest({
      nEstimators: 100,
      maxDepth: 10,
      minSamplesSplit: 2,
      maxFeatures: 'sqrt',
    });

    await this.model.train(features, labels);
  }

  predict(features: number[]): number {
    return this.model.predict([features])[0];
  }

  getTreePredictions(features: number[]): number[] {
    return this.model.predictTrees([features]);
  }
}

export class AdaBoostPredictor {
  private model: AdaBoost;

  async train(features: number[][], labels: number[]) {
    this.model = new AdaBoost({
      nEstimators: 50,
      learningRate: 0.1,
    });

    await this.model.train(new Matrix(features), labels);
  }

  predict(features: number[]): number {
    return this.model.predict(new Matrix([features]))[0];
  }
}

export class TimeSeriesPredictor {
  private model: tf.Sequential;

  async train(timeSeries: number[][], horizon: number) {
    this.model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 64,
          returnSequences: true,
          inputShape: [null, timeSeries[0].length],
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({ units: 32 }),
        tf.layers.dense({ units: horizon }),
      ],
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
    });

    const xs = tf.tensor3d(timeSeries.slice(0, -horizon));
    const ys = tf.tensor2d(timeSeries.slice(-horizon).map(x => x[0]));

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

  predict(timeSeries: number[][]): TimeSeriesResult {
    const prediction = this.model.predict(tf.tensor3d([timeSeries])) as tf.Tensor;
    const forecast = Array.from(prediction.dataSync());
    
    // Calculate confidence intervals
    const std = tf.moments(prediction).variance.sqrt().dataSync();
    const confidence = Array.from(std).map(s => 1.96 * s); // 95% confidence interval
    
    // Decompose time series
    const seasonality = this.calculateSeasonality(timeSeries.map(x => x[0]));
    const trend = this.calculateTrend(timeSeries.map(x => x[0]));

    return {
      forecast,
      confidence,
      seasonality,
      trend,
    };
  }

  private calculateSeasonality(data: number[]): number[] {
    // Simple moving average method
    const period = 7; // Weekly seasonality
    const seasonalityIndices = new Array(period).fill(0);
    const counts = new Array(period).fill(0);

    for (let i = 0; i < data.length; i++) {
      const idx = i % period;
      seasonalityIndices[idx] += data[i];
      counts[idx]++;
    }

    return seasonalityIndices.map((sum, i) => sum / counts[i]);
  }

  private calculateTrend(data: number[]): number[] {
    // Simple linear regression
    const x = Array.from({ length: data.length }, (_, i) => i);
    const y = data;
    
    const n = data.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumXX = x.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return x.map(xi => slope * xi + intercept);
  }
}

export class EnsemblePredictor {
  private xgboost: XGBoostPredictor;
  private lightgbm: LightGBMPredictor;
  private randomForest: RandomForestEnsemble;
  private adaboost: AdaBoostPredictor;
  private timeSeries: TimeSeriesPredictor;

  constructor() {
    this.xgboost = new XGBoostPredictor();
    this.lightgbm = new LightGBMPredictor();
    this.randomForest = new RandomForestEnsemble();
    this.adaboost = new AdaBoostPredictor();
    this.timeSeries = new TimeSeriesPredictor();
  }

  async trainModels(features: number[][], labels: number[], timeSeriesData: number[][]) {
    await Promise.all([
      this.xgboost.train(features, labels),
      this.lightgbm.train(features, labels),
      this.randomForest.train(features, labels),
      this.adaboost.train(features, labels),
      this.timeSeries.train(timeSeriesData, 12), // 12-month forecast
    ]);
  }

  predict(features: number[], timeSeriesData: number[][]): EnsemblePredictionResult {
    const predictions = [
      this.xgboost.predict(features),
      this.lightgbm.predict(features),
      this.randomForest.predict(features),
      this.adaboost.predict(features),
    ];

    const timeSeriesPred = this.timeSeries.predict(timeSeriesData);

    const predictedAmount = predictions.reduce((a, b) => a + b, 0) / predictions.length;
    const variance = predictions.reduce((a, b) => a + Math.pow(b - predictedAmount, 2), 0) / predictions.length;
    const confidenceScore = 1 / (1 + Math.sqrt(variance));

    const modelContributions = {
      xgboost: predictions[0] / predictedAmount,
      lightgbm: predictions[1] / predictedAmount,
      randomForest: predictions[2] / predictedAmount,
      adaboost: predictions[3] / predictedAmount,
    };

    const featureImportance = this.xgboost.getFeatureImportance();

    const uncertaintyRange: [number, number] = [
      predictedAmount - 1.96 * Math.sqrt(variance),
      predictedAmount + 1.96 * Math.sqrt(variance),
    ];

    return {
      predictedAmount,
      confidenceScore,
      modelContributions,
      featureImportance,
      uncertaintyRange,
    };
  }

  async predictForDonor(donorId: string): Promise<EnsemblePredictionResult> {
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
    const timeSeriesData = this.prepareTimeSeriesData(donor);

    return this.predict(features, timeSeriesData);
  }

  private extractFeatures(donor: any): number[] {
    // Extract relevant features for prediction
    return [
      donor.donations.length,
      donor.donations.reduce((sum: number, d: any) => sum + d.amount, 0) / donor.donations.length,
      donor.communications.filter((c: any) => c.response).length / donor.communications.length,
      donor.eventParticipations.length,
      // Add more features as needed
    ];
  }

  private prepareTimeSeriesData(donor: any): number[][] {
    // Prepare time series data for LSTM model
    const monthlyDonations = new Array(12).fill(0);
    donor.donations.forEach((d: any) => {
      const month = new Date(d.createdAt).getMonth();
      monthlyDonations[month] += d.amount;
    });
    
    return monthlyDonations.map(amount => [amount]);
  }
}
