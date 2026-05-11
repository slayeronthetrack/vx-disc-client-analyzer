/**
 * Employee Detail Page
 * Detailed view of a specific employee's DISC test results
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Briefcase, Building2, Calendar, Hash } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/ui/Loading';
import { DISCScoresDisplay } from '@/components/company/DISCScoresDisplay';
import { AIAnalysisSection } from '@/components/company/AIAnalysisSection';
import type { CompanyTest } from '@/types/company-test';

interface EmployeeDetailPageProps {
  params: {
    testId: string;
  };
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [test, setTest] = useState<CompanyTest | null>(null);
  const [testLoading, setTestLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/company/dashboard');
    }
    
    // Redirect non-company_admin users
    if (!loading && user && profile?.role !== 'company_admin') {
      router.push('/dashboard');
    }
  }, [user, loading, profile, router]);

  // Fetch test details
  useEffect(() => {
    if (!user || profile?.role !== 'company_admin') return;

    const fetchTest = async () => {
      try {
        setTestLoading(true);
        setError(null);

        const response = await fetch(`/api/company/dashboard/tests/${params.testId}`);
        
        if (response.status === 404) {
          setError('Teste não encontrado ou você não tem permissão para visualizá-lo.');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch test details');
        }

        const data = await response.json();
        setTest(data);
      } catch (err) {
        console.error('Error fetching test:', err);
        setError(err instanceof Error ? err.message : 'Failed to load test details');
      } finally {
        setTestLoading(false);
      }
    };

    fetchTest();
  }, [user, profile, params.testId]);

  if (!mounted || loading) {
    return <Loading />;
  }

  if (!user || profile?.role !== 'company_admin') {
    return null;
  }

  if (testLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-64" />
            <div className="h-32 bg-gray-700 rounded" />
            <div className="h-96 bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/company/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Voltar ao Dashboard
          </Link>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-500">{error || 'Teste não encontrado'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/company/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Voltar ao Dashboard
        </Link>

        {/* Employee Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{test.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{test.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} />
                  <span>{test.position}</span>
                </div>
                {test.department && (
                  <div className="flex items-center gap-2">
                    <Building2 size={16} />
                    <span>{test.department}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar size={16} />
                <span>Teste realizado em {new Date(test.completed_at).toLocaleDateString('pt-BR')}</span>
              </div>
              {test.attempt_number > 1 && (
                <div className="flex items-center gap-2">
                  <Hash size={16} className="text-orange-500" />
                  <span className="text-sm text-orange-500 font-medium">
                    Tentativa #{test.attempt_number}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DISC Scores */}
        <div className="mb-6">
          <DISCScoresDisplay
            scores={test.disc_result.scores}
            percentages={test.disc_result.percentages}
            dominant={test.disc_result.dominant}
            secondary={test.disc_result.secondary}
          />
        </div>

        {/* AI Analysis */}
        <div className="mb-6">
          <AIAnalysisSection analysis={test.ai_analysis} />
        </div>

        {/* Test History Placeholder */}
        {test.attempt_number > 1 && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Histórico de Testes</h3>
            <p className="text-gray-400 text-center py-4">
              Histórico de testes anteriores será implementado em breve...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
