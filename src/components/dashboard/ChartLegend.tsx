import React from 'react';

interface ChartLegendProps {
  data: {
    name: string;
    color: string;
    value?: number;
  }[];
  onItemClick?: (name: string) => void;
  activeItems?: string[];
}

export function ChartLegend({ data, onItemClick, activeItems }: ChartLegendProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {data.map(({ name, color, value }) => (
        <button
          key={name}
          onClick={() => onItemClick?.(name)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
            !activeItems || activeItems.includes(name)
              ? 'opacity-100 bg-gray-50'
              : 'opacity-50 hover:opacity-75'
          }`}
        >
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium text-gray-700">
            {name}
            {value !== undefined && (
              <span className="ml-1 text-gray-500">({value})</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
