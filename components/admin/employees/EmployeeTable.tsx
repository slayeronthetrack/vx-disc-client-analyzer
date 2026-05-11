/**
 * Employee Table Component
 * Displays list of employees who have taken tests for a company
 */

'use client';

import { useState } from 'react';
import { Eye, Download, Search, Filter } from 'lucide-react';
import type { CompanyTest } from '@/types/company-test';

interface EmployeeTableProps {
  companyId: string;
  tests: CompanyTest[];
  onViewDetails: (test: CompanyTest) => void;
}

const profileColors = {
  D: 'bg-red-500/10 border-red-500/30 text-red-500',
  I: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
  S: 'bg-green-500/10 border-green-500/30 text-green-500',
  C: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
};

const profileNames = {
  D: 'Dominância',
  I: 'Influência',
  S: 'Estabilidade',
  C: 'Conformidade',
};

export function EmployeeTable({ companyId, tests, onViewDetails }: EmployeeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProfile, setFilterProfile] = useState<'all' | 'D' | 'I' | 'S' | 'C'>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique departments
  const departments = Array.from(new Set(tests.map(t => t.department).filter(Boolean))) as string[];

  // Filter and sort tests
  const filteredTests = tests
    .filter(test => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          test.name.toLowerCase().includes(term) ||
          test.email.toLowerCase().includes(term) ||
          test.position.toLowerCase().includes(term) ||
          (test.department?.toLowerCase().includes(term) || false);
        if (!matchesSearch) return false;
      }

      // Profile filter
      if (filterProfile !== 'all' && test.disc_result.dominant !== filterProfile) {
        return false;
      }

      // Department filter
      if (filterDepartment !== 'all' && test.department !== filterDepartment) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, email, cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Filter by Profile */}
          <select
            value={filterProfile}
            onChange={(e) => setFilterProfile(e.target.value as any)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
          >
            <option value="all">Todos os Perfis</option>
            <option value="D">Dominância (D)</option>
            <option value="I">Influência (I)</option>
            <option value="S">Estabilidade (S)</option>
            <option value="C">Conformidade (C)</option>
          </select>

          {/* Filter by Department */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
          >
            <option value="all">Todos os Departamentos</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-gray-400 text-sm">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="created_at">Data do Teste</option>
            <option value="name">Nome</option>
            <option value="email">Email</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="desc">Decrescente</option>
            <option value="asc">Crescente</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          Mostrando {filteredTests.length} de {tests.length} funcionários
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
        {filteredTests.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-2">Nenhum funcionário encontrado</p>
            {(searchTerm || filterProfile !== 'all' || filterDepartment !== 'all') && (
              <p className="text-gray-600 text-sm">Tente ajustar os filtros de busca</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Cargo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Departamento</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Perfil Dominante</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Perfil Secundário</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{test.name}</td>
                    <td className="px-6 py-4 text-gray-400">{test.email}</td>
                    <td className="px-6 py-4 text-gray-400">{test.position}</td>
                    <td className="px-6 py-4 text-gray-400">{test.department || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                        profileColors[test.disc_result.dominant]
                      }`}>
                        {test.disc_result.dominant} - {profileNames[test.disc_result.dominant]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                        profileColors[test.disc_result.secondary]
                      }`}>
                        {test.disc_result.secondary}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(test.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDetails(test)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors text-sm"
                        >
                          <Eye size={14} />
                          Ver
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Implement PDF download
                            alert('Download de PDF será implementado em breve');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors text-sm"
                        >
                          <Download size={14} />
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
