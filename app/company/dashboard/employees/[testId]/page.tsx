/**
 * Employee Detail Page
 * Detailed view of a specific employee's DISC test results
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/ui/Loading';

interface EmployeeDetailPageProps {
  params: {
    testId: string;
  };
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { user, profile, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            Detalhes do Funcionário
          </h1>
          <p className="text-gray-400">
            Test ID: {params.testId}
          </p>
        </div>

        {/* Placeholder content - will be replaced with actual components */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">
            Detalhes do funcionário em construção...
          </p>
        </div>
      </div>
    </div>
  );
}
