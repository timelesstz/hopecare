import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Surface,
  Symbols,
} from 'recharts';
import { motion } from 'framer-motion';
import { ParallelCoordinates } from '@nivo/parallel-coordinates';
import { Stream } from '@nivo/stream';
import { Swarmplot } from '@nivo/swarmplot';
import { Marimekko } from '@nivo/marimekko';

interface DeepLearningVisualsProps {
  data: any;
  title: string;
  type: string;
}

const COLORS = [
  '#2563eb',
  '#dc2626',
  '#16a34a',
  '#ca8a04',
  '#9333ea',
  '#0891b2',
  '#db2777',
  '#84cc16',
];

export const LatentSpaceVisualization: React.FC<{ data: any[]; title: string }> = ({
  data,
  title,
}) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" type="number" />
        <YAxis dataKey="y" type="number" />
        <ZAxis dataKey="z" type="number" range={[50, 400]} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Legend />
        <Scatter
          name="Latent Space"
          data={data}
          fill="#8884d8"
          shape={<Symbols type="circle" />}
        />
      </ScatterChart>
    </ResponsiveContainer>
  </motion.div>
);

export const AttentionHeatmap: React.FC<{ data: any[]; title: string }> = ({
  data,
  title,
}) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div style={{ height: 400 }}>
      <Surface
        width={800}
        height={400}
        viewBox={{ x: 0, y: 0, width: 800, height: 400 }}
      >
        {data.map((row, i) =>
          row.map((value: number, j: number) => (
            <rect
              key={`${i}-${j}`}
              x={j * 20}
              y={i * 20}
              width={20}
              height={20}
              fill={`rgba(37, 99, 235, ${value})`}
            />
          ))
        )}
      </Surface>
    </div>
  </motion.div>
);

export const FeatureImportancePlot: React.FC<{ data: any[]; title: string }> = ({
  data,
  title,
}) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div style={{ height: 400 }}>
      <ParallelCoordinates
        data={data}
        variables={[
          { key: 'feature1', type: 'linear', min: 0, max: 100 },
          { key: 'feature2', type: 'linear', min: 0, max: 100 },
          { key: 'feature3', type: 'linear', min: 0, max: 100 },
        ]}
        margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
        curve="monotoneX"
      />
    </div>
  </motion.div>
);

export const LossLandscape: React.FC<{ data: any[]; title: string }> = ({
  data,
  title,
}) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div style={{ height: 400 }}>
      <Stream
        data={data}
        keys={['loss', 'valLoss']}
        margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Epoch',
          legendOffset: 36,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Loss',
          legendOffset: -40,
        }}
        enableGridX={true}
        enableGridY={true}
        offsetType="none"
        colors={{ scheme: 'nivo' }}
        fillOpacity={0.85}
        dotSize={8}
        dotColor={{ from: 'color' }}
        dotBorderWidth={2}
        dotBorderColor={{ from: 'color', modifiers: [['darker', 0.7]] }}
      />
    </div>
  </motion.div>
);

export const AnomalyDistribution: React.FC<{ data: any[]; title: string }> = ({
  data,
  title,
}) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div style={{ height: 400 }}>
      <Swarmplot
        data={data}
        groups={['normal', 'anomaly']}
        value="value"
        valueFormat=">.2f"
        size={{ key: 'size', values: [4, 20], sizes: [6, 20] }}
        margin={{ top: 60, right: 100, bottom: 60, left: 100 }}
        axisBottom={{
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Distribution',
          legendPosition: 'middle',
          legendOffset: 46,
        }}
        axisLeft={{
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Value',
          legendPosition: 'middle',
          legendOffset: -76,
        }}
      />
    </div>
  </motion.div>
);

export const ModelComparison: React.FC<{ data: any[]; title: string }> = ({
  data,
  title,
}) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div style={{ height: 400 }}>
      <Marimekko
        data={data}
        id="model"
        value="accuracy"
        dimensions={[
          {
            id: 'precision',
            value: 'precision',
          },
          {
            id: 'recall',
            value: 'recall',
          },
        ]}
        margin={{ top: 40, right: 80, bottom: 100, left: 80 }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Model',
          legendPosition: 'middle',
          legendOffset: -60,
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: 'Metrics',
          legendPosition: 'middle',
          legendOffset: 70,
        }}
      />
    </div>
  </motion.div>
);
