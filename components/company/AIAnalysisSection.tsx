/**
 * AI Analysis Section Component
 * Displays AI-generated analysis of DISC profile
 */

'use client';

import { Brain, Sparkles } from 'lucide-react';

interface AIAnalysisSectionProps {
  analysis: string | null;
}

export function AIAnalysisSection({ analysis }: AIAnalysisSectionProps) {
  if (!analysis) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="text-purple-500" size={24} />
          <h3 className="text-lg font-semibold text-white">Análise por IA</h3>
        </div>
        <p className="text-gray-400">Análise não disponível para este teste.</p>
      </div>
    );
  }

  // Split analysis into paragraphs
  const paragraphs = analysis.split('\n').filter(p => p.trim());

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg">
          <Sparkles className="text-purple-500" size={20} />
          <span className="text-sm font-medium text-purple-500">Análise por IA</span>
        </div>
      </div>

      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-gray-300 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Esta análise foi gerada por inteligência artificial com base nos resultados do teste DISC. 
          Use-a como uma orientação geral sobre o perfil comportamental.
        </p>
      </div>
    </div>
  );
}
