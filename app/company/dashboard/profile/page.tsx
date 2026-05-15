/**
 * Company Profile Page
 * Allows company admins to view and edit their company profile
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/ui/Loading';
import { CompanyProfileForm } from '@/components/company/CompanyProfileForm';
import type { Company } from '@/types/company';

export default function CompanyProfilePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/company/dashboard/profile');
    }
    
    // Redirect non-company_admin users
    if (!loading && user && profile?.role !== 'company_admin') {
      router.push('/dashboard');
    }
  }, [user, loading, profile, router]);

  // Fetch company data
  useEffect(() => {
    if (!user || profile?.role !== 'company_admin' || !profile.company_id) return;

    const fetchCompany = async () => {
      try {
        setCompanyLoading(true);
        setError(null);

        const response = await fetch('/api/company/dashboard/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch company data');
        }

        const data = await response.json();
        setCompany(data.company);
      } catch (err) {
        console.error('Error fetching company:', err);
        setError(err instanceof Error ? err.message : 'Failed to load company data');
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchCompany();
  }, [user, profile]);

  const handleUpdate = async (data: Partial<Company>) => {
    if (!profile?.company_id) {
      throw new Error('Company ID not found');
    }

    const response = await fetch('/api/company/dashboard/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }

    const result = await response.json();
    setCompany(result.company);
  };

  if (!mounted || loading) {
    return <Loading />;
  }

  if (!user || profile?.role !== 'company_admin') {
    return null;
  }

  if (companyLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-64" />
            <div className="h-96 bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-500">{error || 'Empresa não encontrada'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Perfil da Empresa
          </h1>
          <p className="text-gray-400">
            Gerencie as informações da sua empresa
          </p>
        </div>

        {/* Company Profile Form */}
        <CompanyProfileForm company={company} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}
