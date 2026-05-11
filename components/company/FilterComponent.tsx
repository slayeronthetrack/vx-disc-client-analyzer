/**
 * Filter Component
 * Provides filtering controls for employee list
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterComponentProps {
  onFilterChange: (filters: {
    search: string;
    dominant_profile: string;
    department: string;
  }) => void;
  departments: string[];
}

export function FilterComponent({ onFilterChange, departments }: FilterComponentProps) {
  const [search, setSearch] = useState('');
  const [dominantProfile, setDominantProfile] = useState('all');
  const [department, setDepartment] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange({
      search: debouncedSearch,
      dominant_profile: dominantProfile,
      department: department,
    });
  }, [debouncedSearch, dominantProfile, department, onFilterChange]);

  const handleClearFilters = () => {
    setSearch('');
    setDominantProfile('all');
    setDepartment('all');
  };

  const hasActiveFilters = search || dominantProfile !== 'all' || department !== 'all';

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden flex items-center gap-2 text-white mb-4 w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Filter size={20} />
          <span>Filtros</span>
        </span>
        {hasActiveFilters && (
          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            Ativos
          </span>
        )}
      </button>

      {/* Filters */}
      <div className={`space-y-4 ${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, email ou cargo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* DISC Profile Filter */}
          <div>
            <select
              value={dominantProfile}
              onChange={(e) => setDominantProfile(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="all">Todos os Perfis</option>
              <option value="D">D - Dominância</option>
              <option value="I">I - Influência</option>
              <option value="S">S - Estabilidade</option>
              <option value="C">C - Conformidade</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="all">Todos os Departamentos</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
              <span>Limpar Filtros</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
