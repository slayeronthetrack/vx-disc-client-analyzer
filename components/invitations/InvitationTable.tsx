/**
 * Invitation Table Component
 * Displays paginated list of invitations
 */

'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Mail, Trash2, Copy, Check } from 'lucide-react';
import type { TestInvitation } from '@/types/invitation';

interface InvitationTableProps {
  invitations: TestInvitation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onInvitationDeleted: () => void;
  onInvitationSent: () => void;
  loading?: boolean;
}

const STATUS_COLORS = {
  pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  sent: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  opened: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  started: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
  completed: 'bg-green-500/20 text-green-500 border-green-500/30',
  expired: 'bg-red-500/20 text-red-500 border-red-500/30',
};

const STATUS_LABELS = {
  pending: 'Pendente',
  sent: 'Enviado',
  opened: 'Aberto',
  started: 'Iniciado',
  completed: 'Concluído',
  expired: 'Expirado',
};

export function InvitationTable({
  invitations,
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onInvitationDeleted,
  onInvitationSent,
  loading,
}: InvitationTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (token: string, id: string) => {
    const link = `${window.location.origin}/test/invite/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (id: string) => {
    try {
      const response = await fetch(`/api/company/dashboard/invitations/${id}/send`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to send');
      
      onInvitationSent();
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este convite?')) return;

    try {
      const response = await fetch(`/api/company/dashboard/invitations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      
      onInvitationDeleted();
    } catch (error) {
      console.error('Error deleting invitation:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-400">Nenhum convite encontrado</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <p className="text-sm text-gray-400">
          Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total} convites
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Cargo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Criado em</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {invitations.map((invitation) => (
              <tr key={invitation.id} className="hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-white font-medium">{invitation.employee_name}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-300 text-sm">{invitation.employee_email}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-300 text-sm">{invitation.employee_position || '-'}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                      STATUS_COLORS[invitation.status]
                    }`}
                  >
                    {STATUS_LABELS[invitation.status]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-300 text-sm">
                    {new Date(invitation.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {invitation.status === 'pending' && (
                      <button
                        onClick={() => handleSend(invitation.id)}
                        className="p-2 text-purple-500 hover:bg-purple-500/20 rounded-lg transition-colors"
                        title="Enviar convite"
                      >
                        <Mail size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleCopyLink(invitation.invitation_token, invitation.id)}
                      className="p-2 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="Copiar link"
                    >
                      {copiedId === invitation.id ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(invitation.id)}
                      className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Deletar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            Anterior
          </button>

          <span className="text-gray-400">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            Próxima
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
