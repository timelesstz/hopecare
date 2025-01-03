import React from 'react';
import {
  ComposedChart,
  LineChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  FunnelChart,
  Funnel,
  LabelList,
  Scatter,
} from 'recharts';
import { motion } from 'framer-motion';
import { HeatMapGrid } from '@nivo/heatmap';
import { Chord } from '@nivo/chord';
import { Voronoi } from '@nivo/voronoi';
import { NetworkFrame } from 'semiotic';

interface PredictiveChartProps {
  data: any[];
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

export const ModelPerformanceChart: React.FC<PredictiveChartProps> = ({ data, title }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="actual"
          fill="#2563eb"
          stroke="#2563eb"
          fillOpacity={0.3}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="predicted"
          stroke="#dc2626"
          dot={false}
        />
        <Bar
          yAxisId="right"
          dataKey="error"
          fill="#16a34a"
          fillOpacity={0.5}
        />
        <Brush dataKey="timestamp" height={30} stroke="#8884d8" />
      </ComposedChart>
    </ResponsiveContainer>
  </motion.div>
);

export const DonorFunnelChart: React.FC<PredictiveChartProps> = ({ data, title }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={400}>
      <FunnelChart>
        <Tooltip />
        <Funnel
          dataKey="value"
          data={data}
          isAnimationActive
        >
          <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  </motion.div>
);

export const DonorHeatMap: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div style={{ height: 400 }}>
      <HeatMapGrid
        data={data}
        margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
        valueFormat=">-.2s"
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -90,
          legend: '',
          legendOffset: 46
        }}
      />
    </div>
  </motion.div>
);

export const DonorRelationshipChord: React.FC<{ data: number[][]; title: string }> = ({ data, title }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div style={{ height: 400 }}>
      <Chord
        matrix={data}
        margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
        padAngle={0.02}
        innerRadiusRatio={0.96}
        innerRadiusOffset={0.02}
        arcOpacity={1}
        arcBorderWidth={1}
        arcBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
        ribbonOpacity={0.5}
        ribbonBorderWidth={1}
        ribbonBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
        enableLabel={true}
        label="id"
        labelOffset={12}
        labelRotation={-90}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
        colors={{ scheme: 'nivo' }}
        isInteractive={true}
        arcHoverOpacity={1}
        arcHoverOthersOpacity={0.25}
        ribbonHoverOpacity={0.75}
        ribbonHoverOthersOpacity={0.25}
      />
    </div>
  </motion.div>
);

export const DonorClusterVoronoi: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div style={{ height: 400 }}>
      <Voronoi
        data={data}
        margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
        xDomain={[0, 100]}
        yDomain={[0, 100]}
        enableLinks={true}
        linkLineColor="#cccccc"
        cellLineColor="#000000"
        pointSize={8}
        pointColor={{ from: 'color' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
        enableCellLabels={true}
        cellLabel="id"
        cellLabelsTextColor="#333333"
        cellLabelComponent={({ cell, ...props }) => (
          <text
            {...props}
            fill={props.textColor}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontSize: 14 }}
          >
            {cell.data.id}
          </text>
        )}
      />
    </div>
  </motion.div>
);

export const DonorNetworkGraph: React.FC<{ data: any; title: string }> = ({ data, title }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div style={{ height: 400 }}>
      <NetworkFrame
        size={[800, 400]}
        edges={data.edges}
        nodes={data.nodes}
        nodeStyle={(d: any) => ({
          fill: d.color || '#1f77b4',
          stroke: 'white',
          strokeWidth: 1,
        })}
        edgeStyle={() => ({
          stroke: '#999',
          strokeWidth: 1,
          strokeOpacity: 0.5,
        })}
        nodeSizeAccessor={(d: any) => d.size || 5}
        hoverAnnotation={true}
        networkType={{ type: 'force', iterations: 500 }}
        margin={{ left: 50, right: 50, top: 50, bottom: 50 }}
      />
    </div>
  </motion.div>
);
