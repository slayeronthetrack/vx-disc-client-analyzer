/**
 * Company Employees Page
 * List all employees (test takers) for a specific company
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  Users,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';
import type { CompanyTest } from '@/types/company-test';
import type { Company } from '@/types/company';

export default function CompanyEmployeesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>('');
  const [company, setCompany] = useState<Company | null>(null);
  const [tests, setTests] = useState<CompanyTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProfile, setFilterProfile] = useState<'all' | 'D' | 'I' | 'S' | 'C'>('all');

  useEffect(() => {
    params.then(p => setCompanyId(p.id));
  }, [params]);

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { apiGet } = await import('@/lib/utils/apiClient');

      // Load company info
      const companyResponse = await apiGet(`/api/companies/${companyId}`);
      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        setCompany(companyData);
      }

      // Load tests
      const testsResponse = await apiGet(`/api/companies/${companyId}/tests`);
      if (testsResponse.ok) {
        const testsData = await testsResponse.json();
        setTests(testsData.tests || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = 
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProfile = filterProfile === 'all' || test.disc_result.dominant === filterProfile;

    return matchesSearch && matchesProfile;
  });

  const handleExportCSV = () => {
    if (!company || filteredTests.length === 0) return;
    
    import('@/lib/utils/reportGenerator').then(({ generateEmployeesCSV }) => {
      generateEmployeesCSV(filteredTests, company);
    });
  };

  const handleExportCompanyReport = async () => {
    if (!company || tests.length === 0) return;
    
    try {
      const { apiGet } = await import('@/lib/utils/apiClient');
      const statsResponse = await apiGet(`/api/companies/${companyId}/stats`);
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        
        import('@/lib/utils/reportGenerator').then(({ generateCompanyReportPDF }) => {
          generateCompanyReportPDF(company, tests, {
            total_tests: stats.total_tests || tests.length,
            predominant_profile: stats.predominant_profile || '',
            avg_d: stats.disc_averages?.avg_d || 0,
            avg_i: stats.disc_averages?.avg_i || 0,
            avg_s: stats.disc_averages?.avg_s || 0,
            avg_c: stats.disc_averages?.avg_c || 0,
          });
        });
      }
    } catch (error) {
      console.error('Error generating company report:', error);
      alert('Erro ao gerar relatório consolidado');
    }
  };

  const getProfileColor = (profile: string) => {
    const colors = {
      D: 'text-red-500 bg-red-500/10 border-red-500/30',
      I: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
      S: 'text-green-500 bg-green-500/10 border-green-500/30',
      C: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    };
    return colors[profile as keyof typeof colors] || 'text-gray-500 bg-gray-500/10 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando funcionários...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-500">Empresa não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/companies"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Voltar para Empresas
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Funcionários - {company.name}
            </h1>
            <p className="text-gray-400">
              {filteredTests.length} {filteredTests.length === 1 ? 'funcionário' : 'funcionários'} encontrado{filteredTests.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={filteredTests.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} />
              Exportar CSV
            </button>
            <button
              onClick={handleExportCompanyReport}
              disabled={tests.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} />
              Relatório Consolidado
            </button>
            <Link
              href={`/test/${company.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              <TrendingUp size={20} />
              Portal de Testes
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, email ou cargo..."
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
        </div>
      </div>

      {/* Employees List */}
      {filteredTests.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
          <Users className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum funcionário encontrado</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterProfile !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Ainda não há testes realizados para esta empresa'}
          </p>
          <Link
            href={`/test/${company.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            <TrendingUp size={20} />
            Acessar Portal de Testes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-orange-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-white font-bold text-lg">{test.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getProfileColor(test.disc_result.dominant)}`}>
                      {test.disc_result.dominant}
                    </span>
                    {test.attempt_number > 1 && (
                      <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded text-xs font-medium">
                        Tentativa {test.attempt_number}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail size={16} />
                      <span>{test.email}</span>
                    </div>
                    {test.phone && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone size={16} />
                        <span>{test.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400">
                      <Briefcase size={16} />
                      <span>{test.position}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={16} />
                      <span>{new Date(test.completed_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* DISC Scores */}
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {Object.entries(test.disc_result.percentages).map(([type, percentage]) => (
                      <div key={type} className="text-center">
                        <div className="text-xs text-gray-400 mb-1">{type}</div>
                        <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              type === 'D' ? 'bg-red-500' :
                              type === 'I' ? 'bg-yellow-500' :
                              type === 'S' ? 'bg-green-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-white font-bold mt-1">{percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/admin/companies/${companyId}/employees/${test.id}`}
                  className="ml-4 px-4 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-colors text-sm font-medium"
                >
                  Ver Detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
