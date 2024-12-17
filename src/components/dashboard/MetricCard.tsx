import React from 'react';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  trend?: number[];
  info?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  previousValue,
  change,
  trend,
  info,
  onClick,
}: MetricCardProps) {
  const renderTrendIndicator = () => {
    if (typeof change !== 'number') return null;

    const color = change > 0 ? 'text-green-600' : change < 0 ? 'text-rose-600' : 'text-gray-600';
    const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';

    return (
      <div className="flex items-center gap-2">
        <span className={`${color} text-sm font-medium`}>
          {arrow} {Math.abs(change).toFixed(1)}%
        </span>
        {previousValue && (
          <span className="text-sm text-gray-500">
            from {previousValue}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm ${
        onClick ? 'cursor-pointer hover:bg-gray-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {info && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{info}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="mt-2">
        <div className="flex items-baseline">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {renderTrendIndicator()}
        </div>

        {trend && trend.length > 0 && (
          <div className="mt-3 h-8">
            <Sparklines data={trend} height={32}>
              <SparklinesLine
                style={{
                  stroke: change && change > 0 ? '#059669' : '#e11d48',
                  strokeWidth: 2,
                  fill: 'none',
                }}
              />
              <SparklinesSpots
                size={2}
                style={{
                  fill: change && change > 0 ? '#059669' : '#e11d48',
                }}
              />
            </Sparklines>
          </div>
        )}
      </div>
    </div>
  );
}
