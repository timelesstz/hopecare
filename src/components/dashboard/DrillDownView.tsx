import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { ChartTooltip } from './ChartTooltip';

interface DrillDownData {
  type: 'project' | 'donor' | 'time';
  title: string;
  data: any[];
  metrics: {
    label: string;
    value: string | number;
    change?: number;
  }[];
}

interface DrillDownViewProps {
  isOpen: boolean;
  onClose: () => void;
  data: DrillDownData;
}

const COLORS = {
  positive: '#059669',
  negative: '#e11d48',
  neutral: '#6b7280',
  chart: ['#e11d48', '#4f46e5', '#0891b2', '#059669', '#eab308', '#ec4899'],
};

export function DrillDownView({ isOpen, onClose, data }: DrillDownViewProps) {
  const renderTrendIndicator = (change?: number) => {
    if (!change) return null;
    
    const color = change > 0 ? COLORS.positive : change < 0 ? COLORS.negative : COLORS.neutral;
    const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
    
    return (
      <span className="ml-2 text-sm" style={{ color }}>
        {arrow} {Math.abs(change)}%
      </span>
    );
  };

  const renderChart = () => {
    switch (data.type) {
      case 'project':
        return (
          <div className="h-[300px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.data.map((_, index) => (
                    <Cell key={index} fill={COLORS.chart[index % COLORS.chart.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip type="distribution" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'donor':
      case 'time':
        return (
          <div className="h-[300px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<ChartTooltip type="donation" />} />
                <Bar
                  dataKey="value"
                  fill={COLORS.chart[0]}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{data.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {data.metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg"
            >
              <div className="text-sm text-gray-600">{metric.label}</div>
              <div className="text-xl font-semibold mt-1 flex items-center">
                {metric.value}
                {renderTrendIndicator(metric.change)}
              </div>
            </div>
          ))}
        </div>

        {renderChart()}
      </DialogContent>
    </Dialog>
  );
}
