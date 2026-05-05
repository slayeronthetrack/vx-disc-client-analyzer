/**
 * Profile Configuration Page
 * Página para configurar dados do usuário
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { profileService } from '@/lib/services/profileService';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile: userProfile, loading: authLoading, refreshState } = useAuth();
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [testObjective, setTestObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Carregar dados do perfil
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setJobTitle(userProfile.job_title || '');
      setCompany(userProfile.company || '');
      setTestObjective(userProfile.test_objective || '');
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) throw new Error('Usuário não autenticado');

      // Validações
      if (!fullName.trim()) {
        throw new Error('Nome completo é obrigatório');
      }

      if (!jobTitle.trim()) {
        throw new Error('Cargo é obrigatório');
      }

      if (!company.trim()) {
        throw new Error('Empresa é obrigatória');
      }

      // Atualizar perfil
      await profileService.updateProfile(user.id, {
        full_name: fullName,
        job_title: jobTitle,
        company,
        test_objective: testObjective,
      });

      // Atualizar estado global
      await refreshState();

      // Mostrar sucesso
      setShowSuccess(true);

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/test');
      }, 2000);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-white mb-2">
              Perfil salvo com sucesso!
            </h2>
            <p className="text-gray-400 mb-4">
              Redirecionando para o teste...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              Voltar para Home
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">
              Configurar Perfil
            </h1>
            <p className="text-gray-400">
              Complete seus dados para personalizar sua experiência
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-red-500" size={24} />
              <div>
                <p className="text-red-500 font-semibold">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="space-y-6">
              {/* Nome Completo */}
              <div>
                <label htmlFor="fullName" className="block text-white font-medium mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Digite seu nome completo"
                />
              </div>

              {/* Cargo */}
              <div>
                <label htmlFor="jobTitle" className="block text-white font-medium mb-2">
                  Cargo *
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Ex: Gerente de Vendas"
                />
              </div>

              {/* Empresa */}
              <div>
                <label htmlFor="company" className="block text-white font-medium mb-2">
                  Empresa *
                </label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Nome da sua empresa"
                />
              </div>

              {/* Objetivo do Teste */}
              <div>
                <label htmlFor="testObjective" className="block text-white font-medium mb-2">
                  Objetivo do Teste
                </label>
                <textarea
                  id="testObjective"
                  value={testObjective}
                  onChange={(e) => setTestObjective(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  placeholder="Ex: Desenvolvimento pessoal, melhoria de comunicação, autoconhecimento..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={24} />
                    Salvar Perfil
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
