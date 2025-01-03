import React from 'react';
import {
  LineChart,
  BarChart,
  ScatterChart,
  PieChart,
  Line,
  Bar,
  Scatter,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

interface ChartProps {
  data: any[];
  type: 'line' | 'bar' | 'scatter' | 'pie';
  xKey: string;
  yKey: string;
  title: string;
  color?: string;
  height?: number;
  animate?: boolean;
}

const defaultColors = [
  '#2563eb', // blue-600
  '#dc2626', // red-600
  '#16a34a', // green-600
  '#ca8a04', // yellow-600
  '#9333ea', // purple-600
  '#0891b2', // cyan-600
];

export const DynamicChart: React.FC<ChartProps> = ({
  data,
  type,
  xKey,
  yKey,
  title,
  color = defaultColors[0],
  height = 400,
  animate = true,
}) => {
  const ChartComponent = {
    line: LineChart,
    bar: BarChart,
    scatter: ScatterChart,
    pie: PieChart,
  }[type];

  const DataComponent = {
    line: Line,
    bar: Bar,
    scatter: Scatter,
    pie: Pie,
  }[type];

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        {type !== 'pie' && (
          <>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
          </>
        )}
        <Tooltip />
        <Legend />
        <DataComponent
          type="monotone"
          dataKey={yKey}
          fill={color}
          stroke={color}
          animationDuration={animate ? 1500 : 0}
        />
      </ChartComponent>
    </ResponsiveContainer>
  );

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {chartContent}
    </motion.div>
  );
};

export const DonorRetentionChart: React.FC<{ data: any[] }> = ({ data }) => (
  <DynamicChart
    data={data}
    type="line"
    xKey="month"
    yKey="retentionRate"
    title="Donor Retention Rate"
    color={defaultColors[0]}
  />
);

export const DonationTrendChart: React.FC<{ data: any[] }> = ({ data }) => (
  <DynamicChart
    data={data}
    type="bar"
    xKey="date"
    yKey="amount"
    title="Donation Trends"
    color={defaultColors[1]}
  />
);

export const DonorSegmentationChart: React.FC<{ data: any[] }> = ({ data }) => (
  <DynamicChart
    data={data}
    type="pie"
    xKey="segment"
    yKey="count"
    title="Donor Segmentation"
    color={defaultColors[2]}
  />
);

export const CampaignComparisonChart: React.FC<{ data: any[] }> = ({ data }) => (
  <DynamicChart
    data={data}
    type="bar"
    xKey="campaign"
    yKey="conversion"
    title="Campaign Performance"
    color={defaultColors[3]}
  />
);

export const PredictionAccuracyChart: React.FC<{ data: any[] }> = ({ data }) => (
  <DynamicChart
    data={data}
    type="scatter"
    xKey="predicted"
    yKey="actual"
    title="Prediction Accuracy"
    color={defaultColors[4]}
  />
);

export const ABTestResultsChart: React.FC<{ data: any[] }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <DynamicChart
      data={data}
      type="bar"
      xKey="variant"
      yKey="conversionRate"
      title="A/B Test Conversion Rates"
      color={defaultColors[0]}
      height={300}
    />
    <DynamicChart
      data={data}
      type="bar"
      xKey="variant"
      yKey="averageValue"
      title="A/B Test Average Values"
      color={defaultColors[1]}
      height={300}
    />
  </div>
);
