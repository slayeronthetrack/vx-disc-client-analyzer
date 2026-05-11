/**
 * Employee Modal Component
 * Displays detailed test results for an employee
 */

'use client';

import { X } from 'lucide-react';
import type { CompanyTest } from '@/types/company-test';

interface EmployeeModalProps {
  test: CompanyTest | null;
  isOpen: boolean;
  onClose: () => void;
}

const profileColors = {
  D: 'text-red-500',
  I: 'text-yellow-500',
  S: 'text-green-500',
  C: 'text-blue-500',
};

const profileNames = {
  D: 'Dominância',
  I: 'Influência',
  S: 'Estabilidade',
  C: 'Conformidade',
};

export function EmployeeModal({ test, isOpen, onClose }: EmployeeModalProps) {
  if (!isOpen || !test) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
          <h3 className="text-2xl font-bold text-white">
            Detalhes do Teste - {test.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-3">Informações do Funcionário</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Nome</p>
                <p className="text-white font-medium">{test.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-medium">{test.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Cargo</p>
                <p className="text-white font-medium">{test.position}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Departamento</p>
                <p className="text-white font-medium">{test.department || '-'}</p>
              </div>
              {test.phone && (
                <div>
                  <p className="text-gray-400 text-sm">Telefone</p>
                  <p className="text-white font-medium">{test.phone}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm">Data do Teste</p>
                <p className="text-white font-medium">
                  {new Date(test.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* DISC Profile */}
          <div>
            <h4 className="text-lg font-bold text-white mb-3">Perfil DISC</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Perfil Dominante</p>
                <p className={`text-2xl font-bold ${profileColors[test.disc_result.dominant]}`}>
                  {test.disc_result.dominant} - {profileNames[test.disc_result.dominant]}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {test.disc_result.percentages[test.disc_result.dominant].toFixed(1)}%
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Perfil Secundário</p>
                <p className={`text-2xl font-bold ${profileColors[test.disc_result.secondary]}`}>
                  {test.disc_result.secondary} - {profileNames[test.disc_result.secondary]}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {test.disc_result.percentages[test.disc_result.secondary].toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Scores */}
          <div>
            <h4 className="text-lg font-bold text-white mb-3">Scores DISC</h4>
            <div className="space-y-3">
              {(Object.keys(test.disc_result.scores) as Array<'D' | 'I' | 'S' | 'C'>).map((key) => {
                const score = test.disc_result.scores[key];
                const percentage = test.disc_result.percentages[key];
                
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        {profileNames[key]} ({key})
                      </span>
                      <span className="text-gray-400">
                        {score} pontos ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          key === 'D' ? 'bg-red-500' :
                          key === 'I' ? 'bg-yellow-500' :
                          key === 'S' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Analysis */}
          {test.ai_analysis && (
            <div>
              <h4 className="text-lg font-bold text-white mb-3">Análise IA</h4>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {test.ai_analysis}
                </p>
              </div>
            </div>
          )}

          {/* Test Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-3">Informações do Teste</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Versão do Teste</p>
                <p className="text-white font-medium">{test.test_version}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Tentativa</p>
                <p className="text-white font-medium">#{test.attempt_number}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-white font-medium">
                  <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full text-sm">
                    {test.status}
                  </span>
                </p>
              </div>
              {test.started_at && (
                <div>
                  <p className="text-gray-400 text-sm">Iniciado em</p>
                  <p className="text-white font-medium">
                    {new Date(test.started_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              // TODO: Implement PDF download
              alert('Download de PDF será implementado em breve');
            }}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Baixar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
