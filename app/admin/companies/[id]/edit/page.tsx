/**
 * Edit Company Page
 * Form to edit an existing company
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CompanyForm } from '@/components/admin/companies/CompanyForm';
import type { Company, UpdateCompanyInput } from '@/types/company';

export default function EditCompanyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompany();
  }, [params.id]);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const { apiGet } = await import('@/lib/utils/apiClient');

      const response = await apiGet(`/api/companies/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Empresa não encontrada');
      }

      const data = await response.json();
      setCompany(data);
    } catch (error) {
      console.error('Error loading company:', error);
      alert('Erro ao carregar empresa');
      router.push('/admin/companies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateCompanyInput) => {
    try {
      const { apiPatch } = await import('@/lib/utils/apiClient');
      const response = await apiPatch(`/api/companies/${params.id}`, data);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar empresa');
      }

      // Show success message
      alert('Empresa atualizada com sucesso!');
      
      // Redirect to company detail page
      router.push(`/admin/companies/${params.id}`);
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push(`/admin/companies/${params.id}`);
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

  if (!company) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/admin/companies/${params.id}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Voltar para Detalhes
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">
          Editar Empresa
        </h1>
        <p className="text-gray-400">
          Atualize as informações de {company.name}
        </p>
      </div>

      {/* Form */}
      <CompanyForm
        company={company}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEdit={true}
      />
    </div>
  );
}
