import { prisma } from '@/lib/prisma';
import { subMonths, startOfMonth, endOfMonth, addMonths } from 'date-fns';

interface TimeSeriesData {
  date: Date;
  value: number;
}

// ARIMA model parameters
interface ArimaParams {
  p: number; // AR order
  d: number; // Difference order
  q: number; // MA order
}

export interface PredictionModel {
  type: 'linear' | 'exponential' | 'arima' | 'seasonal';
  predictions: Array<{ date: string; amount: number; confidence: number }>;
  accuracy: number;
  rmse: number;
}

// Linear Regression
const calculateLinearRegression = (data: TimeSeriesData[]) => {
  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data.map(d => d.value);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumXX = x.reduce((a, b) => a + b * b, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

// Exponential Smoothing with Seasonality
const calculateHoltWinters = (
  data: TimeSeriesData[],
  seasonalPeriod: number,
  alpha = 0.2,
  beta = 0.1,
  gamma = 0.3
) => {
  const n = data.length;
  const series = data.map(d => d.value);
  const level = new Array(n).fill(0);
  const trend = new Array(n).fill(0);
  const seasonal = new Array(n).fill(0);
  const fitted = new Array(n).fill(0);

  // Initialize
  level[0] = series[0];
  trend[0] = series[1] - series[0];
  for (let i = 0; i < seasonalPeriod; i++) {
    seasonal[i] = series[i] / level[0];
  }

  // Calculate components
  for (let t = 1; t < n; t++) {
    const s = t - seasonalPeriod;
    level[t] = alpha * (series[t] / seasonal[s]) + (1 - alpha) * (level[t - 1] + trend[t - 1]);
    trend[t] = beta * (level[t] - level[t - 1]) + (1 - beta) * trend[t - 1];
    seasonal[t] = gamma * (series[t] / level[t]) + (1 - gamma) * seasonal[s];
    fitted[t] = (level[t - 1] + trend[t - 1]) * seasonal[s];
  }

  return { level, trend, seasonal, fitted };
};

// ARIMA Model (simplified)
const calculateArima = (data: TimeSeriesData[], params: ArimaParams) => {
  const series = data.map(d => d.value);
  const n = series.length;
  const differenced = new Array(n - params.d).fill(0);

  // Difference the series
  for (let d = 0; d < params.d; d++) {
    for (let i = 0; i < n - d - 1; i++) {
      differenced[i] = series[i + 1] - series[i];
    }
  }

  // AR component
  const ar = new Array(n).fill(0);
  for (let i = params.p; i < n; i++) {
    let sum = 0;
    for (let j = 1; j <= params.p; j++) {
      sum += 0.7 * series[i - j]; // Simplified AR coefficient
    }
    ar[i] = sum;
  }

  // MA component
  const ma = new Array(n).fill(0);
  const errors = series.map((v, i) => v - ar[i]);
  for (let i = params.q; i < n; i++) {
    let sum = 0;
    for (let j = 1; j <= params.q; j++) {
      sum += 0.3 * errors[i - j]; // Simplified MA coefficient
    }
    ma[i] = sum;
  }

  return { ar, ma, fitted: ar.map((v, i) => v + ma[i]) };
};

export const generatePredictions = async (
  months: number = 6
): Promise<Record<string, PredictionModel>> => {
  const now = new Date();
  const historicalData = await Promise.all(
    Array.from({ length: 24 }, (_, i) => {
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
        date: month,
        value: result._sum.amount || 0,
      }));
    })
  );

  historicalData.reverse();

  // Linear Model
  const linear = calculateLinearRegression(historicalData);
  const linearPredictions = Array.from({ length: months }, (_, i) => {
    const predictedValue = linear.slope * (historicalData.length + i) + linear.intercept;
    return {
      date: addMonths(now, i).toISOString().substring(0, 7),
      amount: Math.max(0, predictedValue),
      confidence: Math.max(0, 1 - i * 0.1),
    };
  });

  // Exponential Model (Holt-Winters)
  const seasonal = calculateHoltWinters(historicalData, 12);
  const lastLevel = seasonal.level[seasonal.level.length - 1];
  const lastTrend = seasonal.trend[seasonal.trend.length - 1];
  const seasonalPredictions = Array.from({ length: months }, (_, i) => {
    const seasonalIndex = (historicalData.length + i) % 12;
    const predictedValue =
      (lastLevel + lastTrend * (i + 1)) * seasonal.seasonal[seasonalIndex];
    return {
      date: addMonths(now, i).toISOString().substring(0, 7),
      amount: Math.max(0, predictedValue),
      confidence: Math.max(0, 1 - i * 0.15),
    };
  });

  // ARIMA Model
  const arima = calculateArima(historicalData, { p: 2, d: 1, q: 2 });
  const arimaPredictions = Array.from({ length: months }, (_, i) => {
    const lastValues = arima.fitted.slice(-3);
    const predictedValue =
      lastValues.reduce((a, b) => a + b, 0) / lastValues.length +
      (i * lastTrend);
    return {
      date: addMonths(now, i).toISOString().substring(0, 7),
      amount: Math.max(0, predictedValue),
      confidence: Math.max(0, 1 - i * 0.12),
    };
  });

  // Calculate accuracy metrics
  const calculateRMSE = (predicted: number[], actual: number[]) => {
    const n = Math.min(predicted.length, actual.length);
    const sumSquaredErrors = predicted
      .slice(0, n)
      .reduce((sum, pred, i) => sum + Math.pow(pred - actual[i], 2), 0);
    return Math.sqrt(sumSquaredErrors / n);
  };

  const actualValues = historicalData.map(d => d.value);
  const linearFitted = historicalData.map((_, i) => linear.slope * i + linear.intercept);
  const seasonalFitted = seasonal.fitted;
  const arimaFitted = arima.fitted;

  return {
    linear: {
      type: 'linear',
      predictions: linearPredictions,
      accuracy: 1 - calculateRMSE(linearFitted, actualValues) / Math.max(...actualValues),
      rmse: calculateRMSE(linearFitted, actualValues),
    },
    exponential: {
      type: 'exponential',
      predictions: seasonalPredictions,
      accuracy: 1 - calculateRMSE(seasonalFitted, actualValues) / Math.max(...actualValues),
      rmse: calculateRMSE(seasonalFitted, actualValues),
    },
    arima: {
      type: 'arima',
      predictions: arimaPredictions,
      accuracy: 1 - calculateRMSE(arimaFitted, actualValues) / Math.max(...actualValues),
      rmse: calculateRMSE(arimaFitted, actualValues),
    },
  };
};
