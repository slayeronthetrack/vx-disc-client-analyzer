/**
 * Create Company Page
 * Form to create a new company
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Copy, Plus } from 'lucide-react';
import Link from 'next/link';
import { CompanyForm } from '@/components/admin/companies/CompanyForm';
import type { CreateCompanyInput, CreateCompanyWithAdminResponse } from '@/types/company';

export default function CreateCompanyPage() {
  const router = useRouter();
  const [createdCompany, setCreatedCompany] = useState<CreateCompanyWithAdminResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const getLoginUrl = (loginUrl?: string) => {
    const path = loginUrl || '/login';
    if (typeof window === 'undefined') {
      return path;
    }

    return new URL(path, window.location.origin).toString();
  };

  const handleSubmit = async (data: CreateCompanyInput) => {
    try {
      const { apiPost } = await import('@/lib/utils/apiClient');
      const response = await apiPost('/api/companies', data);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar empresa');
      }

      const result: CreateCompanyWithAdminResponse = await response.json();
      setCreatedCompany(result);
      setCopied(false);
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  };

  const handleCopyCredentials = async () => {
    if (!createdCompany) return;

    const credentials = [
      `Empresa: ${createdCompany.company.name}`,
      `Email: ${createdCompany.access.admin_email}`,
      `Senha temporária: ${createdCompany.access.temporary_password}`,
      `Login: ${getLoginUrl(createdCompany.access.login_url)}`,
    ].join('\n');

    await navigator.clipboard.writeText(credentials);
    setCopied(true);
  };

  const handleCreateAnother = () => {
    setCreatedCompany(null);
    setCopied(false);
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

      {createdCompany ? (
        <div className="max-w-3xl bg-gray-800/80 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 shadow-2xl shadow-green-500/10">
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <CheckCircle className="text-green-400" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Empresa criada com sucesso
              </h2>
              <p className="text-gray-400">
                Copie as credenciais agora. A senha temporária é exibida somente neste momento.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Empresa</p>
              <p className="text-lg font-semibold text-white">{createdCompany.company.name}</p>
            </div>
            <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Email de acesso</p>
              <p className="text-lg font-semibold text-white break-all">{createdCompany.access.admin_email}</p>
            </div>
            <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Senha temporária</p>
              <p className="text-lg font-semibold text-white break-all">{createdCompany.access.temporary_password}</p>
            </div>
            <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">URL de login</p>
              <p className="text-lg font-semibold text-white break-all">
                {getLoginUrl(createdCompany.access.login_url)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
            >
              <Copy size={20} />
              {copied ? 'Credenciais copiadas' : 'Copiar credenciais'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/companies')}
              className="inline-flex items-center justify-center px-5 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              Ir para empresas
            </button>
            <button
              type="button"
              onClick={handleCreateAnother}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              <Plus size={20} />
              Criar outra empresa
            </button>
          </div>
        </div>
      ) : (
        <CompanyForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={false}
        />
      )}
    </div>
  );
}
