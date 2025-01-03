import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  type: 'donation' | 'donor' | 'distribution';
}

export function ChartTooltip({ active, payload, label, type }: ChartTooltipProps) {
  if (!active || !payload) return null;

  const renderContent = () => {
    switch (type) {
      case 'donation':
        return (
          <>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="font-medium text-rose-600">
              {formatCurrency(payload[0].value)}
            </p>
            <p className="text-sm text-gray-500">
              {payload[1].value} donations
            </p>
          </>
        );
      case 'donor':
        return (
          <>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="font-medium text-indigo-600">
              {payload[0].value} new donors
            </p>
            <p className="font-medium text-cyan-600">
              {payload[1].value} returning donors
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Total: {payload[0].value + payload[1].value} donors
            </p>
          </>
        );
      case 'distribution':
        return (
          <>
            <p className="text-sm text-gray-600">{payload[0].name}</p>
            <p className="font-medium text-rose-600">
              {formatCurrency(payload[0].value)}
            </p>
            <p className="text-sm text-gray-500">
              {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}% of total
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
      {renderContent()}
    </div>
  );
}
