/**
 * Company Detail Page
 * View company details, statistics, and employee list
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Copy, 
  Download,
  Building2,
  Users,
  ClipboardList,
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { Company, CompanyStats } from '@/types/company';
import type { CompanyTest } from '@/types/company-test';
import { EmployeeTable } from '@/components/admin/employees/EmployeeTable';
import { EmployeeModal } from '@/components/admin/employees/EmployeeModal';
import DISCPieChart from '@/components/ui/DISCPieChart';

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [tests, setTests] = useState<CompanyTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<CompanyTest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingTests, setLoadingTests] = useState(true);

  // Unwrap params Promise
  useEffect(() => {
    params.then(p => setCompanyId(p.id));
  }, [params]);

  useEffect(() => {
    if (!companyId) return;
    loadCompanyData();
    loadCompanyTests();
  }, [companyId]);

  const loadCompanyData = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      const { apiGet } = await import('@/lib/utils/apiClient');

      // Load company
      const companyResponse = await apiGet(`/api/companies/${companyId}`);
      if (!companyResponse.ok) {
        throw new Error('Empresa não encontrada');
      }
      const companyData = await companyResponse.json();
      setCompany(companyData);

      // Load stats
      const statsResponse = await apiGet(`/api/companies/${companyId}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading company:', error);
      alert('Erro ao carregar empresa');
      router.push('/admin/companies');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyTests = async () => {
    if (!companyId) return;
    
    try {
      setLoadingTests(true);
      const { apiGet } = await import('@/lib/utils/apiClient');

      // Load tests with default filters (all completed tests)
      const testsResponse = await apiGet(
        `/api/companies/${companyId}/tests?status=COMPLETED&sortBy=created_at&sortOrder=desc&limit=1000`
      );
      
      if (testsResponse.ok) {
        const testsData = await testsResponse.json();
        setTests(testsData.tests || []);
      }
    } catch (error) {
      console.error('Error loading company tests:', error);
      // Don't show alert for tests loading error, just log it
    } finally {
      setLoadingTests(false);
    }
  };

  const handleDelete = async () => {
    if (!company || !companyId) return;

    if (!confirm(`Tem certeza que deseja deletar a empresa "${company.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const { apiDelete } = await import('@/lib/utils/apiClient');
      const response = await apiDelete(`/api/companies/${companyId}`);

      if (response.ok) {
        alert('Empresa deletada com sucesso!');
        router.push('/admin/companies');
      } else {
        const error = await response.json();
        alert(`Erro ao deletar empresa: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Erro ao deletar empresa');
    }
  };

  const handleCopyLink = () => {
    if (!company) return;
    const link = `${window.location.origin}/test/${company.slug}`;
    navigator.clipboard.writeText(link);
    alert('Link copiado para a área de transferência!');
  };

  const handleViewDetails = (test: CompanyTest) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTest(null);
  };

  // Calculate team DISC averages for the chart
  const calculateTeamAverages = () => {
    if (tests.length === 0) {
      return { D: 0, I: 0, S: 0, C: 0 };
    }

    const totals = tests.reduce(
      (acc, test) => ({
        D: acc.D + test.disc_result.scores.D,
        I: acc.I + test.disc_result.scores.I,
        S: acc.S + test.disc_result.scores.S,
        C: acc.C + test.disc_result.scores.C,
      }),
      { D: 0, I: 0, S: 0, C: 0 }
    );

    return {
      D: Math.round(totals.D / tests.length),
      I: Math.round(totals.I / tests.length),
      S: Math.round(totals.S / tests.length),
      C: Math.round(totals.C / tests.length),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando empresa...</p>
        </div>
      </div>
    );
  }

  if (!company || !companyId) {
    return null;
  }

  const testLink = `${window.location.origin}/test/${company.slug}`;
  const usagePercentage = stats?.usage_percentage || 0;
  const isNearLimit = usagePercentage >= 90;
  const isAtLimit = usagePercentage >= 100;

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

        {/* Company Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Building2 className="text-orange-500" size={32} />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{company.name}</h1>
                  {company.active ? (
                    <CheckCircle className="text-green-500" size={24} />
                  ) : (
                    <XCircle className="text-red-500" size={24} />
                  )}
                </div>
                <p className="text-gray-400">/{company.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/companies/${companyId}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-colors"
              >
                <Edit size={16} />
                Editar
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={16} />
                Deletar
              </button>
            </div>
          </div>

          {/* Test Link */}
          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Link do Teste:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-orange-500 font-mono text-sm">
                {testLink}
              </code>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
              >
                <Copy size={16} />
                Copiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tests */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ClipboardList className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total de Testes</p>
                <p className="text-3xl font-bold text-white">{stats.total_tests}</p>
              </div>
            </div>
          </div>

          {/* Completed Tests */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="text-green-500" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Concluídos</p>
                <p className="text-3xl font-bold text-white">{stats.completed_tests}</p>
              </div>
            </div>
          </div>

          {/* Usage */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isAtLimit ? 'bg-red-500/10' : isNearLimit ? 'bg-yellow-500/10' : 'bg-green-500/10'
              }`}>
                <TrendingUp className={
                  isAtLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-green-500'
                } size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Uso do Limite</p>
                <p className="text-3xl font-bold text-white">{usagePercentage.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          {/* Predominant Profile */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Users className="text-orange-500" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Perfil Predominante</p>
                <p className="text-3xl font-bold text-white">
                  {stats.predominant_profile || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee List */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Funcionários</h2>
          <p className="text-gray-400">
            Lista de funcionários que realizaram o teste DISC
          </p>
        </div>

        {loadingTests ? (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando funcionários...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
            <Users className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum teste realizado</h3>
            <p className="text-gray-400 mb-6">
              Ainda não há funcionários que realizaram o teste DISC para esta empresa
            </p>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
            >
              <Copy size={20} />
              Copiar Link do Teste
            </button>
          </div>
        ) : (
          <EmployeeTable
            companyId={companyId}
            tests={tests}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      {/* Employee Modal */}
      <EmployeeModal
        test={selectedTest}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
