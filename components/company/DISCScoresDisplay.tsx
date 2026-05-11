/**
 * DISC Scores Display Component
 * Shows detailed DISC scores with bar chart and profile badges
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { DISCScores, DISCPercentages, DISCType } from '@/types/database';

interface DISCScoresDisplayProps {
  scores: DISCScores;
  percentages: DISCPercentages;
  dominant: DISCType;
  secondary: DISCType;
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

export function DISCScoresDisplay({ scores, percentages, dominant, secondary }: DISCScoresDisplayProps) {
  // Prepare data for chart
  const chartData = [
    { name: 'D', score: scores.D, percentage: percentages.D, fullName: PROFILE_NAMES.D },
    { name: 'I', score: scores.I, percentage: percentages.I, fullName: PROFILE_NAMES.I },
    { name: 'S', score: scores.S, percentage: percentages.S, fullName: PROFILE_NAMES.S },
    { name: 'C', score: scores.C, percentage: percentages.C, fullName: PROFILE_NAMES.C },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{data.name} - {data.fullName}</p>
          <p className="text-gray-300">Pontuação: {data.score}</p>
          <p className="text-gray-300">Percentual: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Pontuações DISC</h3>

      {/* Profile Badges */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Perfil Dominante:</span>
          <span
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold border-2"
            style={{
              backgroundColor: `${COLORS[dominant]}20`,
              color: COLORS[dominant],
              borderColor: `${COLORS[dominant]}50`,
            }}
          >
            {dominant} - {PROFILE_NAMES[dominant]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Perfil Secundário:</span>
          <span
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border"
            style={{
              backgroundColor: `${COLORS[secondary]}10`,
              color: COLORS[secondary],
              borderColor: `${COLORS[secondary]}30`,
            }}
          >
            {secondary} - {PROFILE_NAMES[secondary]}
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            style={{ fontSize: '14px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '14px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as DISCType]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Score Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="bg-gray-700/30 rounded-lg p-4 border border-gray-600"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: COLORS[item.name as DISCType] }}
              />
              <span className="text-sm font-medium text-gray-300">{item.name}</span>
            </div>
            <p className="text-2xl font-bold text-white">{item.score}</p>
            <p className="text-sm text-gray-400">{item.percentage.toFixed(1)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
