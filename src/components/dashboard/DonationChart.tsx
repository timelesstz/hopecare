import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan', amount: 1200 },
  { month: 'Feb', amount: 900 },
  { month: 'Mar', amount: 1600 },
  { month: 'Apr', amount: 1400 },
  { month: 'May', amount: 2000 },
  { month: 'Jun', amount: 1800 },
];

export function DonationChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.5rem',
            }}
            formatter={(value) => [`$${value}`, 'Amount']}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#e11d48"
            strokeWidth={2}
            dot={{ fill: '#e11d48', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#e11d48' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
