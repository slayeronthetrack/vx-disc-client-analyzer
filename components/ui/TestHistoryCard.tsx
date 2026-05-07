/**
 * Test History Card Component
 * Card para exibir item do histórico de testes
 */

'use client';

import { Calendar, FileText, Download, Eye } from 'lucide-react';
import type { DISCType } from '@/types/database';

interface TestHistoryCardProps {
  id: string;
  createdAt: string;
  questionCount: number;
  dominantProfile: DISCType;
  dominantValue: string | null;
  psychologicalCode: string | null;
  testObjective: string | null;
  onViewResult: (id: string) => void;
  onDownloadPDF: (id: string) => void;
  isDownloading?: boolean;
}

const profileColors = {
  D: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500', name: 'Dominância' },
  I: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-500', name: 'Influência' },
  S: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-500', name: 'Estabilidade' },
  C: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', name: 'Conformidade' },
};

const valueNames: Record<string, string> = {
  theoretical: 'Teórico',
  economic: 'Econômico',
  aesthetic: 'Estético',
  social: 'Social',
  political: 'Político',
  spiritual: 'Espiritual',
};

export default function TestHistoryCard({
  id,
  createdAt,
  questionCount,
  dominantProfile,
  dominantValue,
  psychologicalCode,
  testObjective,
  onViewResult,
  onDownloadPDF,
  isDownloading = false,
}: TestHistoryCardProps) {
  const profile = profileColors[dominantProfile];
  const date = new Date(createdAt);
  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`bg-white/5 backdrop-blur-lg border ${profile.border} rounded-xl p-6 hover:bg-white/10 transition-all duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Data */}
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Calendar size={16} />
            <span>{formattedDate} às {formattedTime}</span>
          </div>

          {/* Perfil Dominante */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-full ${profile.bg} border ${profile.border} flex items-center justify-center`}>
              <span className={`${profile.text} font-bold text-xl`}>{dominantProfile}</span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">
                Perfil {profile.name}
              </h3>
              <p className="text-gray-400 text-sm">
                {questionCount} perguntas respondidas
              </p>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {dominantValue && (
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Valor Dominante</p>
                <p className="text-orange-400 font-medium text-sm">
                  {valueNames[dominantValue] || dominantValue}
                </p>
              </div>
            )}

            {psychologicalCode && (
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Tipo Psicológico</p>
                <p className="text-purple-400 font-medium text-sm">
                  {psychologicalCode}
                </p>
              </div>
            )}
          </div>

          {/* Objetivo do Teste */}
          {testObjective && (
            <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
              <p className="text-gray-500 text-xs mb-1">Objetivo</p>
              <p className="text-gray-300 text-sm line-clamp-2">
                {testObjective}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <button
          onClick={() => onViewResult(id)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
        >
          <Eye size={18} />
          Ver Resultado
        </button>

        <button
          onClick={() => onDownloadPDF(id)}
          disabled={isDownloading}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Download size={18} />
              PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}
