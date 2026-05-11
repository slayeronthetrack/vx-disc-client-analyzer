/**
 * Company Dashboard Page
 * Main dashboard for company admins showing statistics and employee list
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/ui/Loading';

export default function CompanyDashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

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

  if (!mounted || loading) {
    return <Loading />;
  }

  if (!user || profile?.role !== 'company_admin') {
    return null;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard da Empresa
          </h1>
          <p className="text-gray-400">
            Visão geral dos testes DISC dos seus funcionários
          </p>
        </div>

        {/* Placeholder content - will be replaced with actual components */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">
            Dashboard em construção...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Estatísticas, gráficos e lista de funcionários serão exibidos aqui.
          </p>
        </div>
      </div>
    </div>
  );
}
