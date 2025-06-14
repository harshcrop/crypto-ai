import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { PriceHistory } from '../types/crypto';

interface PriceChartProps {
  data: PriceHistory[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  const chartData = data.map(point => ({
    date: new Date(point.timestamp).toLocaleDateString(),
    price: point.price
  }));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price);
  };

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
            formatter={(value: number) => [formatPrice(value), 'Price']}
            labelStyle={{ color: '#000' }}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
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

export default PriceChart;