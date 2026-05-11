/**
 * DISC Distribution Chart Component
 * Displays pie chart showing distribution of DISC profiles
 */

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DISCDistributionChartProps {
  distribution: {
    D: { count: number; percentage: number };
    I: { count: number; percentage: number };
    S: { count: number; percentage: number };
    C: { count: number; percentage: number };
  } | null;
  loading?: boolean;
}

const COLORS = {
  D: '#EF4444', // Red
  I: '#F59E0B', // Amber
  S: '#10B981', // Green
  C: '#3B82F6', // Blue
};

const PROFILE_NAMES = {
  D: 'Dominância',
  I: 'Influência',
  S: 'Estabilidade',
  C: 'Conformidade',
};

export function DISCDistributionChart({ distribution, loading }: DISCDistributionChartProps) {
  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Distribuição DISC</h3>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-64 w-64 bg-gray-700 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!distribution) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Distribuição DISC</h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-400">Nenhum dado de teste disponível</p>
        </div>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = [
    { name: 'D', value: distribution.D.count, fullName: PROFILE_NAMES.D, percentage: distribution.D.percentage },
    { name: 'I', value: distribution.I.count, fullName: PROFILE_NAMES.I, percentage: distribution.I.percentage },
    { name: 'S', value: distribution.S.count, fullName: PROFILE_NAMES.S, percentage: distribution.S.percentage },
    { name: 'C', value: distribution.C.count, fullName: PROFILE_NAMES.C, percentage: distribution.C.percentage },
  ].filter(item => item.value > 0); // Only show profiles with data

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{data.name} - {data.fullName}</p>
          <p className="text-gray-300">Quantidade: {data.value}</p>
          <p className="text-gray-300">Percentual: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-300">
              {entry.payload.name} - {entry.payload.fullName} ({entry.payload.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Distribuição DISC</h3>
      
      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-400">Nenhum teste concluído ainda</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
