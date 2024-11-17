import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { ChartData } from '../types';

interface ResultChartProps {
  data: ChartData[];
  regressionLine: ChartData[];
  maxPoint: { uprofit: number; hprofit: number };
}

export const ResultChart: React.FC<ResultChartProps> = ({
  data,
  regressionLine,
  maxPoint,
}) => {
  return (
    <div className="w-full h-[400px] mt-8">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="uprofit"
            name="Unit Profit"
            unit="$"
          />
          <YAxis
            type="number"
            dataKey="hprofit"
            name="Hourly Profit"
            unit="$/hr"
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter
            name="Data Points"
            data={data}
            fill="#8884d8"
            shape="circle"
          />
          <Scatter
            name="Regression Line"
            data={regressionLine}
            line
            shape="none"
            legendType="none"
            stroke="#ff7300"
          />
          <Scatter
            name="Maximum Point"
            data={[maxPoint]}
            fill="#ff0000"
            shape="star"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};