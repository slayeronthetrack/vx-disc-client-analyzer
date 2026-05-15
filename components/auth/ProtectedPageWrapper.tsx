/**
 * Protected Page Wrapper
 * Componente para proteger páginas client-side
 * 
 * Uso:
 * <ProtectedPageWrapper requiredRoles={['admin', 'super_admin']}>
 *   <YourPageContent />
 * </ProtectedPageWrapper>
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  isAdminRole,
  isCompanyAdminRole,
  canAccessAdmin,
  canAccessCompanyDashboard,
  type UserRoleType,
} from '@/lib/auth/permissions';

interface ProtectedPageWrapperProps {
  children: React.ReactNode;
  requiredRoles?: UserRoleType[];
  fallbackPath?: string;
  fallbackComponent?: React.ReactNode;
}

/**
 * Wrapper para proteger página client-side
 * O middleware já faz proteção server-side, mas isso garante proteção adicional no cliente
 */
export function ProtectedPageWrapper({
  children,
  requiredRoles,
  fallbackPath = '/dashboard',
  fallbackComponent,
}: ProtectedPageWrapperProps) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Aguardar carregamento da autenticação
    if (loading) {
      return;
    }

    // Se não está logado
    if (!user) {
      console.log('[ProtectedPageWrapper] Not authenticated');
      router.push('/login');
      return;
    }

    // Se não tem role
    if (!profile?.role) {
      console.log('[ProtectedPageWrapper] No role in profile');
      router.push('/profile');
      return;
    }

    // Se tem roles específicos requeridos
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(profile.role as UserRoleType)) {
        console.log('[ProtectedPageWrapper] Unauthorized role:', profile.role, 'Required:', requiredRoles);
        router.push(fallbackPath);
        return;
      }
    }

    // Autorizado
    setAuthorized(true);
  }, [user, profile, loading, requiredRoles, fallbackPath, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Acesso Negado</h1>
          <p className="text-gray-400 mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Wrapper específico para /admin
 */
export function AdminPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedPageWrapper requiredRoles={['admin', 'super_admin']}>
      {children}
    </ProtectedPageWrapper>
  );
}

/**
 * Wrapper específico para /company/dashboard
 */
export function CompanyPageWrapper({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  
  // Company admin deve ter company_id
  if (profile?.role === 'company_admin' && !profile?.company_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Configuração Incompleta</h1>
          <p className="text-gray-400">
            Sua empresa não está configurada corretamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedPageWrapper requiredRoles={['company_admin']}>
      {children}
    </ProtectedPageWrapper>
  );
}
