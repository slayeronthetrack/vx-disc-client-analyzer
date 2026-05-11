/**
 * Export Button Component
 * Dropdown button for exporting employee data as CSV or PDF
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2, ChevronDown } from 'lucide-react';

interface ExportButtonProps {
  filters: {
    search: string;
    dominant_profile: string;
    department: string;
  };
}

export function ExportButton({ filters }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setLoading(true);
      setError(null);
      setIsOpen(false);

      // Prepare filters (only include non-default values)
      const exportFilters: any = {};
      if (filters.search) exportFilters.search = filters.search;
      if (filters.dominant_profile !== 'all') exportFilters.dominant_profile = filters.dominant_profile;
      if (filters.department !== 'all') exportFilters.department = filters.department;

      const response = await fetch('/api/company/dashboard/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          filters: exportFilters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate export');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `export.${format}`;

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Failed to export data');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <Download size={20} />
            Exportar
            <ChevronDown size={16} />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !loading && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FileSpreadsheet size={20} className="text-green-500" />
              <div>
                <p className="font-medium text-white">Exportar como CSV</p>
                <p className="text-xs text-gray-400">Planilha com todos os dados</p>
              </div>
            </button>

            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FileText size={20} className="text-red-500" />
              <div>
                <p className="font-medium text-white">Exportar como PDF</p>
                <p className="text-xs text-gray-400">Relatório formatado</p>
              </div>
            </button>
          </div>

          {/* Active Filters Info */}
          {(filters.search || filters.dominant_profile !== 'all' || filters.department !== 'all') && (
            <div className="border-t border-gray-700 p-3">
              <p className="text-xs text-gray-400">
                ℹ️ Exportação incluirá apenas os dados filtrados
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute right-0 mt-2 w-72 bg-red-500/10 border border-red-500/30 rounded-lg p-3 shadow-lg z-50">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
