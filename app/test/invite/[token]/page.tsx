/**
 * Public Test Page via Invitation
 * Allows employees to take the test using invitation token
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import { AlertCircle, Building2, Calendar, Mail, Briefcase } from 'lucide-react';

interface InvitationData {
  invitation: {
    id: string;
    employee_name: string;
    employee_email: string;
    employee_position: string | null;
    employee_department: string | null;
    expires_at: string;
    status: string;
  };
  company: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string;
  } | null;
}

interface InvitePageProps {
  params: {
    token: string;
  };
}

export default function InviteTestPage({ params }: InvitePageProps) {
  const router = useRouter();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/invitations/${params.token}`);
        
        if (response.status === 404) {
          setError('Convite não encontrado ou expirado');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch invitation');
        }

        const data = await response.json();
        setInvitation(data);
      } catch (err) {
        console.error('Error fetching invitation:', err);
        setError('Erro ao carregar convite');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [params.token]);

  const handleStartTest = () => {
    // Redirect to test page with invitation context
    router.push(`/test/${invitation?.company?.slug}?invitation=${params.token}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-full">
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Convite Inválido
          </h2>
          <p className="text-gray-400 mb-6">
            {error || 'Este convite não foi encontrado ou já expirou.'}
          </p>
          <p className="text-sm text-gray-500">
            Entre em contato com sua empresa para obter um novo convite.
          </p>
        </div>
      </div>
    );
  }

  const expiresAt = new Date(invitation.invitation.expires_at);
  const isExpiringSoon = expiresAt.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Company Header */}
        {invitation.company && (
          <div className="text-center mb-8">
            {invitation.company.logo_url ? (
              <img
                src={invitation.company.logo_url}
                alt={invitation.company.name}
                className="h-16 mx-auto mb-4"
              />
            ) : (
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <Building2 size={32} className="text-orange-500" />
                </div>
              </div>
            )}
            <h1 className="text-3xl font-bold text-white mb-2">
              {invitation.company.name}
            </h1>
            <p className="text-gray-400">
              Teste de Perfil DISC
            </p>
          </div>
        )}

        {/* Invitation Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Você foi convidado!
            </h2>
            <p className="text-gray-400">
              Complete o teste DISC para descobrir seu perfil comportamental
            </p>
          </div>

          {/* Employee Info */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-700/30 rounded-lg">
              <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <Mail size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Nome</p>
                <p className="text-white font-medium">{invitation.invitation.employee_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-700/30 rounded-lg">
              <div className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <Mail size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-medium">{invitation.invitation.employee_email}</p>
              </div>
            </div>

            {invitation.invitation.employee_position && (
              <div className="flex items-center gap-3 p-4 bg-gray-700/30 rounded-lg">
                <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                  <Briefcase size={20} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Cargo</p>
                  <p className="text-white font-medium">{invitation.invitation.employee_position}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-gray-700/30 rounded-lg">
              <div className={`p-2 border rounded-lg ${
                isExpiringSoon 
                  ? 'bg-amber-500/20 border-amber-500/30' 
                  : 'bg-gray-500/20 border-gray-500/30'
              }`}>
                <Calendar size={20} className={isExpiringSoon ? 'text-amber-500' : 'text-gray-400'} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Válido até</p>
                <p className={`font-medium ${isExpiringSoon ? 'text-amber-500' : 'text-white'}`}>
                  {expiresAt.toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Warning if expiring soon */}
          {isExpiringSoon && (
            <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-500 text-sm">
                ⚠️ Este convite expira em breve. Complete o teste o quanto antes!
              </p>
            </div>
          )}

          {/* Test Info */}
          <div className="mb-8 p-6 bg-gray-700/30 rounded-lg border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-3">Sobre o Teste</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Duração aproximada: 10-15 minutos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>24 perguntas sobre comportamento e preferências</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Não existem respostas certas ou erradas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Responda com sinceridade para obter o melhor resultado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Você receberá seu perfil DISC completo ao final</span>
              </li>
            </ul>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartTest}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Iniciar Teste DISC
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Ao iniciar o teste, você concorda em compartilhar seus resultados com {invitation.company?.name}
          </p>
        </div>
      </div>
    </div>
  );
}
