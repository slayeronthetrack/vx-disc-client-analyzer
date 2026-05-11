/**
 * Create Company Page
 * Form to create a new company
 */

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CompanyForm } from '@/components/admin/companies/CompanyForm';
import type { CreateCompanyInput } from '@/types/company';

export default function CreateCompanyPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateCompanyInput) => {
    try {
      const { apiPost } = await import('@/lib/utils/apiClient');
      const response = await apiPost('/api/companies', data);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar empresa');
      }

      const company = await response.json();
      
      // Show success message
      alert('Empresa criada com sucesso!');
      
      // Redirect to company detail page
      router.push(`/admin/companies/${company.id}`);
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/admin/companies');
  };

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
        <h1 className="text-4xl font-bold text-white mb-2">
          Nova Empresa
        </h1>
        <p className="text-gray-400">
          Cadastre uma nova empresa no sistema
        </p>
      </div>

      {/* Form */}
      <CompanyForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEdit={false}
      />
    </div>
  );
}
