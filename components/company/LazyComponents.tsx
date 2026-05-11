/**
 * Lazy-loaded components for better performance
 * Heavy components are loaded only when needed
 */

'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/ui/Loading';

// Lazy load chart components (Recharts is heavy)
export const DISCDistributionChart = dynamic(
  () => import('./DISCDistributionChart').then(mod => ({ default: mod.DISCDistributionChart })),
  {
    loading: () => (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Distribuição DISC</h3>
        <div className="h-80 flex items-center justify-center">
          <Loading />
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for charts
  }
);

export const DISCScoresDisplay = dynamic(
  () => import('./DISCScoresDisplay').then(mod => ({ default: mod.DISCScoresDisplay })),
  {
    loading: () => (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Pontuações DISC</h3>
        <div className="h-96 flex items-center justify-center">
          <Loading />
        </div>
      </div>
    ),
    ssr: false,
  }
);

// Lazy load export functionality (jsPDF is heavy)
export const ExportButton = dynamic(
  () => import('./ExportButton').then(mod => ({ default: mod.ExportButton })),
  {
    loading: () => (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-500 rounded-lg font-medium cursor-not-allowed"
      >
        Carregando...
      </button>
    ),
    ssr: false,
  }
);
