import React from 'react';
import {
  Treemap,
  RadialBarChart,
  RadialBar,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Sankey,
  AreaChart,
  Area,
  ComposedChart,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicChart } from './AdvancedCharts';

interface RadarChartProps {
  data: any[];
  domains: string[];
  title: string;
}

interface TreemapProps {
  data: any[];
  title: string;
}

interface RadialBarProps {
  data: any[];
  title: string;
}

interface SankeyProps {
  data: {
    nodes: { name: string }[];
    links: { source: number; target: number; value: number }[];
  };
  title: string;
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

export const DonorRadarChart: React.FC<RadarChartProps> = ({ data, domains, title }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="domain" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        {domains.map((domain, index) => (
          <Radar
            key={domain}
            name={domain}
            dataKey={domain}
            stroke={COLORS[index % COLORS.length]}
            fill={COLORS[index % COLORS.length]}
            fillOpacity={0.6}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  </motion.div>
);

export const DonationTreemap: React.FC<TreemapProps> = ({ data, title }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={400}>
      <Treemap
        data={data}
        dataKey="value"
        aspectRatio={4 / 3}
        stroke="#fff"
        fill="#8884d8"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Treemap>
    </ResponsiveContainer>
  </motion.div>
);

export const DonorProgressChart: React.FC<RadialBarProps> = ({ data, title }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={400}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="10%"
        outerRadius="80%"
        barSize={10}
        data={data}
      >
        <RadialBar
          minAngle={15}
          background
          clockWise
          dataKey="value"
          label={{ position: 'insideStart', fill: '#fff' }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </RadialBar>
      </RadialBarChart>
    </ResponsiveContainer>
  </motion.div>
);

export const DonorFlowChart: React.FC<SankeyProps> = ({ data, title }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={400}>
      <Sankey
        data={data}
        node={{ fill: '#8884d8' }}
        nodePadding={50}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        link={{ stroke: '#77c878' }}
      />
    </ResponsiveContainer>
  </motion.div>
);

export const MLPredictionChart: React.FC<{ data: any[] }> = ({ data }) => (
  <motion.div
    className="grid grid-cols-1 md:grid-cols-2 gap-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, staggerChildren: 0.1 }}
  >
    <DynamicChart
      data={data}
      type="scatter"
      xKey="predicted"
      yKey="actual"
      title="Prediction vs Actual"
      color="#2563eb"
      height={300}
    />
    <DynamicChart
      data={data}
      type="line"
      xKey="timestamp"
      yKey="accuracy"
      title="Model Accuracy Over Time"
      color="#16a34a"
      height={300}
    />
  </motion.div>
);

export const DonorInsightsChart: React.FC<{ data: any[] }> = ({ data }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">Donor Insights</h3>
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <Area
          type="monotone"
          dataKey="donations"
          fill="#2563eb"
          stroke="#2563eb"
          fillOpacity={0.3}
        />
        <Area
          type="monotone"
          dataKey="engagement"
          fill="#16a34a"
          stroke="#16a34a"
          fillOpacity={0.3}
        />
        <Area
          type="monotone"
          dataKey="retention"
          fill="#dc2626"
          stroke="#dc2626"
          fillOpacity={0.3}
        />
      </ComposedChart>
    </ResponsiveContainer>
  </motion.div>
);
