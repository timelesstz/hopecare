import React from 'react';
import { Heart, Users, Globe, Sparkles } from 'lucide-react';

const metrics = [
  {
    label: 'Lives Touched',
    value: '1,234',
    icon: Heart,
    color: 'rose',
    description: 'People directly impacted by your donations',
  },
  {
    label: 'Communities Reached',
    value: '12',
    icon: Users,
    color: 'blue',
    description: 'Different communities benefiting from your support',
  },
  {
    label: 'Countries Impacted',
    value: '5',
    icon: Globe,
    color: 'green',
    description: 'Geographic reach of your contributions',
  },
  {
    label: 'Projects Supported',
    value: '8',
    icon: Sparkles,
    color: 'purple',
    description: 'Number of projects you've contributed to',
  },
];

export function ImpactMetrics() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="p-4 rounded-lg bg-gray-50 space-y-2"
        >
          <div className={`p-2 bg-${metric.color}-50 w-fit rounded-lg`}>
            <metric.icon className={`w-5 h-5 text-${metric.color}-500`} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {metric.value}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {metric.label}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {metric.description}
          </p>
        </div>
      ))}
    </div>
  );
}
