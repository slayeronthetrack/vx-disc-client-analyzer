/**
 * Overview Cards Component
 * Displays key statistics for company dashboard
 */

'use client';

import { 
  Users, 
  ClipboardCheck, 
  TrendingUp, 
  CheckCircle,
  Calendar
} from 'lucide-react';

interface OverviewCardsProps {
  stats: {
    totalTests: number;
    uniqueEmployees: number;
    averageScores: {
      D: number;
      I: number;
      S: number;
      C: number;
    };
    completionRate: number;
    testsThisMonth: number;
  } | null;
  loading?: boolean;
}

export function OverviewCards({ stats, loading }: OverviewCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 animate-pulse"
          >
            <div className="h-12 w-12 bg-gray-700 rounded-lg mb-4" />
            <div className="h-4 bg-gray-700 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-700 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 text-center">
        <p className="text-gray-400">Nenhum dado disponível</p>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total de Testes',
      value: stats.totalTests.toString(),
      icon: ClipboardCheck,
      color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    },
    {
      label: 'Funcionários Únicos',
      value: stats.uniqueEmployees.toString(),
      icon: Users,
      color: 'bg-green-500/20 text-green-500 border-green-500/30',
    },
    {
      label: 'Média DISC',
      value: `D:${stats.averageScores.D.toFixed(1)} I:${stats.averageScores.I.toFixed(1)} S:${stats.averageScores.S.toFixed(1)} C:${stats.averageScores.C.toFixed(1)}`,
      icon: TrendingUp,
      color: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      small: true,
    },
    {
      label: 'Taxa de Conclusão',
      value: `${stats.completionRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    },
    {
      label: 'Testes Este Mês',
      value: stats.testsThisMonth.toString(),
      icon: Calendar,
      color: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all duration-200"
          >
            <div className={`inline-flex p-3 rounded-lg border ${card.color} mb-4`}>
              <Icon size={24} />
            </div>
            <p className="text-sm text-gray-400 mb-1">{card.label}</p>
            <p className={`font-bold text-white ${card.small ? 'text-lg' : 'text-3xl'}`}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
