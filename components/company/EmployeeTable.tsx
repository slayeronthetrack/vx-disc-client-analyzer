/**
 * Employee Table Component
 * Displays paginated list of employee test results
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Eye, ArrowUpDown } from 'lucide-react';
import type { CompanyTest } from '@/types/company-test';

interface EmployeeTableProps {
  tests: CompanyTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  loading?: boolean;
}

const PROFILE_COLORS = {
  D: 'bg-red-500/20 text-red-500 border-red-500/30',
  I: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  S: 'bg-green-500/20 text-green-500 border-green-500/30',
  C: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
};

export function EmployeeTable({
  tests,
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onSortChange,
  loading,
}: EmployeeTableProps) {
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: string) => {
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newOrder);
    onSortChange(column, newOrder);
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-400">Nenhum funcionário encontrado com os critérios selecionados</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="p-4 border-b border-gray-700">
        <p className="text-sm text-gray-400">
          Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total} resultados
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Nome
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-semibold text-gray-300">Email</span>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('position')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Cargo
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-semibold text-gray-300">Departamento</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-semibold text-gray-300">Perfil</span>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Data do Teste
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-sm font-semibold text-gray-300">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {tests.map((test) => (
              <tr
                key={test.id}
                className="hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <p className="text-white font-medium">{test.name}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-300 text-sm">{test.email}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-300 text-sm">{test.position}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-300 text-sm">{test.department || '-'}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                      PROFILE_COLORS[test.disc_result.dominant]
                    }`}
                  >
                    {test.disc_result.dominant}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-300 text-sm">
                    {new Date(test.completed_at).toLocaleDateString('pt-BR')}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/company/dashboard/employees/${test.id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Eye size={16} />
                    Ver Detalhes
                  </Link>
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

          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Show first, last, current, and adjacent pages
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= page - 1 && pageNum <= page + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      pageNum === page
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === page - 2 || pageNum === page + 2) {
                return (
                  <span key={pageNum} className="text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

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
