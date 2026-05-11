/**
 * Invitation Statistics Component
 * Displays overview cards for invitation stats
 */

'use client';

import { 
  Mail, 
  MailOpen, 
  PlayCircle, 
  CheckCircle2, 
  Clock,
  XCircle
} from 'lucide-react';

interface InvitationStatsProps {
  stats: {
    pending: number;
    sent: number;
    opened: number;
    started: number;
    completed: number;
    expired: number;
  };
}

export function InvitationStats({ stats }: InvitationStatsProps) {
  const total = stats.pending + stats.sent + stats.opened + stats.started + stats.completed + stats.expired;
  const sentTotal = stats.sent + stats.opened + stats.started + stats.completed;
  const completionRate = sentTotal > 0 ? Math.round((stats.completed / sentTotal) * 100) : 0;
  const openRate = sentTotal > 0 ? Math.round(((stats.opened + stats.started + stats.completed) / sentTotal) * 100) : 0;

  const cards = [
    {
      label: 'Total de Convites',
      value: total.toString(),
      icon: Mail,
      color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    },
    {
      label: 'Pendentes',
      value: stats.pending.toString(),
      icon: Clock,
      color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    },
    {
      label: 'Enviados',
      value: stats.sent.toString(),
      icon: Mail,
      color: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    },
    {
      label: 'Abertos',
      value: stats.opened.toString(),
      icon: MailOpen,
      color: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    },
    {
      label: 'Iniciados',
      value: stats.started.toString(),
      icon: PlayCircle,
      color: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
    },
    {
      label: 'Concluídos',
      value: stats.completed.toString(),
      icon: CheckCircle2,
      color: 'bg-green-500/20 text-green-500 border-green-500/30',
    },
    {
      label: 'Expirados',
      value: stats.expired.toString(),
      icon: XCircle,
      color: 'bg-red-500/20 text-red-500 border-red-500/30',
    },
    {
      label: 'Taxa de Abertura',
      value: `${openRate}%`,
      icon: MailOpen,
      color: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30',
    },
    {
      label: 'Taxa de Conclusão',
      value: `${completionRate}%`,
      icon: CheckCircle2,
      color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all duration-200"
          >
            <div className={`inline-flex p-2 rounded-lg border ${card.color} mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-sm text-gray-400 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
