/**
 * Analytics Page
 * Detailed analytics and metrics (Phase 2)
 */

'use client';

import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Analytics
        </h1>
        <p className="text-gray-400">
          Métricas detalhadas e análises avançadas
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
        <BarChart3 className="mx-auto text-gray-600 mb-4" size={48} />
        <h3 className="text-xl font-bold text-white mb-2">Em Desenvolvimento</h3>
        <p className="text-gray-400 mb-6">
          A página de analytics detalhado será implementada na Fase 2
        </p>
        <div className="inline-block px-4 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-lg text-sm">
          Fase 2: Dashboard & Analytics
        </div>
      </div>
    </div>
  );
}
