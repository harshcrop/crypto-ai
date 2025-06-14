import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { PortfolioHistory } from '../types/crypto';

interface PortfolioChartProps {
  data: PortfolioHistory[];
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ data }) => {
  const chartData = data.map(point => ({
    date: new Date(point.date).toLocaleDateString(),
    value: point.totalValue
  }));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-600">No portfolio history available yet. Check back tomorrow!</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatPrice}
          />
          <Tooltip 
            formatter={(value: number) => [formatPrice(value), 'Portfolio Value']}
            labelStyle={{ color: '#000' }}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#000" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#000' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;