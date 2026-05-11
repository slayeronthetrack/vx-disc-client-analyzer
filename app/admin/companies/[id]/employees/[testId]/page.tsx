/**
 * Employee Detail Page
 * Detailed view of employee DISC test results
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar,
  TrendingUp,
  Download,
  RefreshCw,
  Target,
  Users,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import type { CompanyTest } from '@/types/company-test';
import type { Company } from '@/types/company';

export default function EmployeeDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; testId: string }> 
}) {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>('');
  const [testId, setTestId] = useState<string>('');
  const [company, setCompany] = useState<Company | null>(null);
  const [test, setTest] = useState<CompanyTest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => {
      setCompanyId(p.id);
      setTestId(p.testId);
    });
  }, [params]);

  useEffect(() => {
    if (companyId && testId) {
      loadData();
    }
  }, [companyId, testId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { apiGet } = await import('@/lib/utils/apiClient');

      // Load company
      const companyResponse = await apiGet(`/api/companies/${companyId}`);
      if (companyResponse.ok) {
        setCompany(await companyResponse.json());
      }

      // Load test
      const testResponse = await apiGet(`/api/tests/${testId}`);
      if (testResponse.ok) {
        setTest(await testResponse.json());
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileColor = (profile: string) => {
    const colors = {
      D: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
      I: { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' },
      S: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' },
      C: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
    };
    return colors[profile as keyof typeof colors] || colors.D;
  };

  const getProfileDescription = (profile: string) => {
    const descriptions = {
      D: {
        title: 'Dominância',
        traits: ['Direto', 'Orientado a resultados', 'Decisivo', 'Competitivo'],
        strengths: ['Liderança natural', 'Toma decisões rápidas', 'Foco em objetivos', 'Aceita desafios'],
        challenges: ['Pode ser impaciente', 'Às vezes insensível', 'Pode ignorar detalhes', 'Resistente a controle'],
        ideal: 'Cargos de liderança, vendas, empreendedorismo, gestão de projetos',
      },
      I: {
        title: 'Influência',
        traits: ['Comunicativo', 'Entusiasta', 'Persuasivo', 'Otimista'],
        strengths: ['Excelente comunicador', 'Motiva equipes', 'Criativo', 'Networking natural'],
        challenges: ['Pode ser desorganizado', 'Evita conflitos', 'Falta de foco', 'Muito otimista'],
        ideal: 'Vendas, marketing, relações públicas, atendimento ao cliente',
      },
      S: {
        title: 'Estabilidade',
        traits: ['Paciente', 'Leal', 'Cooperativo', 'Confiável'],
        strengths: ['Trabalho em equipe', 'Consistente', 'Bom ouvinte', 'Calmo sob pressão'],
        challenges: ['Resistente a mudanças', 'Evita confrontos', 'Dificuldade em dizer não', 'Ritmo lento'],
        ideal: 'Suporte, recursos humanos, administração, serviços',
      },
      C: {
        title: 'Conformidade',
        traits: ['Analítico', 'Preciso', 'Sistemático', 'Detalhista'],
        strengths: ['Alta qualidade', 'Organizado', 'Segue procedimentos', 'Pensamento crítico'],
        challenges: ['Perfeccionista', 'Crítico demais', 'Lento em decisões', 'Evita riscos'],
        ideal: 'Análise de dados, contabilidade, engenharia, qualidade',
      },
    };
    return descriptions[profile as keyof typeof descriptions] || descriptions.D;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (!test || !company) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <p className="text-red-500 text-lg font-semibold">Teste não encontrado</p>
        </div>
      </div>
    );
  }

  const dominantProfile = test.disc_result.dominant;
  const profileInfo = getProfileDescription(dominantProfile);
  const colors = getProfileColor(dominantProfile);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/admin/companies/${companyId}/employees`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Voltar para Funcionários
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white">
                {test.name}
              </h1>
              <span className={`px-4 py-2 rounded-full text-lg font-bold border-2 ${colors.text} ${colors.border} bg-opacity-10`}>
                Perfil {dominantProfile}
              </span>
            </div>
            <p className="text-gray-400 text-lg">{company.name}</p>
          </div>
          
          <button
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            <Download size={20} />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Mail className="text-orange-500" size={20} />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-white font-medium">{test.email}</p>
            </div>
          </div>
        </div>
        
        {test.phone && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Phone className="text-orange-500" size={20} />
              <div>
                <p className="text-xs text-gray-400">Telefone</p>
                <p className="text-white font-medium">{test.phone}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Briefcase className="text-orange-500" size={20} />
            <div>
              <p className="text-xs text-gray-400">Cargo</p>
              <p className="text-white font-medium">{test.position}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-orange-500" size={20} />
            <div>
              <p className="text-xs text-gray-400">Data do Teste</p>
              <p className="text-white font-medium">
                {new Date(test.completed_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DISC Scores */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-white mb-6">Pontuação DISC</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.entries(test.disc_result.percentages).map(([type, percentage]) => {
            const typeColors = getProfileColor(type);
            const isDominant = type === dominantProfile;
            
            return (
              <div key={type} className={`relative ${isDominant ? 'ring-2 ring-orange-500 rounded-xl' : ''}`}>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 text-center">
                  {isDominant && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                        DOMINANTE
                      </span>
                    </div>
                  )}
                  
                  <div className={`text-6xl font-bold mb-2 ${typeColors.text}`}>
                    {type}
                  </div>
                  <div className="text-4xl font-bold text-white mb-4">
                    {percentage}%
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${typeColors.bg} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <p className="text-sm text-gray-400 mt-3">
                    {getProfileDescription(type).title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Characteristics */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-orange-500" size={24} />
            <h3 className="text-xl font-bold text-white">Características Principais</h3>
          </div>
          <ul className="space-y-2">
            {profileInfo.traits.map((trait, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-300">
                <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
                {trait}
              </li>
            ))}
          </ul>
        </div>

        {/* Strengths */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-green-500" size={24} />
            <h3 className="text-xl font-bold text-white">Pontos Fortes</h3>
          </div>
          <ul className="space-y-2">
            {profileInfo.strengths.map((strength, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Challenges */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-yellow-500" size={24} />
            <h3 className="text-xl font-bold text-white">Áreas de Desenvolvimento</h3>
          </div>
          <ul className="space-y-2">
            {profileInfo.challenges.map((challenge, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-300">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                {challenge}
              </li>
            ))}
          </ul>
        </div>

        {/* Ideal Roles */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold text-white">Funções Ideais</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">
            {profileInfo.ideal}
          </p>
        </div>
      </div>

      {/* AI Analysis */}
      {test.ai_analysis && (
        <div className="bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-orange-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Lightbulb className="text-orange-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Análise por IA</h3>
          </div>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line">
            {test.ai_analysis}
          </div>
        </div>
      )}

      {/* Test History */}
      {test.attempt_number > 1 && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="text-orange-500" size={24} />
            <h3 className="text-xl font-bold text-white">Histórico de Testes</h3>
          </div>
          <div className="flex items-center gap-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <AlertCircle className="text-blue-500" size={20} />
            <p className="text-blue-500">
              Este é o teste #{test.attempt_number} deste funcionário. 
              {test.previous_test_id && ' Houve testes anteriores.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
