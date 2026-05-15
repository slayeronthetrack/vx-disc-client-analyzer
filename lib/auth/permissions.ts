/**
 * Auth Permissions Module
 * Gerencia permissões, redirecionamentos e proteção de rotas
 * 
 * Este módulo centraliza toda a lógica de controle de acesso do sistema.
 */

import type { UserRole } from '@/types/database';

export type UserRoleType = UserRole;

/**
 * Definição de roles do sistema com seus níveis de acesso
 */
export const ROLE_HIERARCHY = {
  'super_admin': 5,   // Acesso total ao sistema
  'admin': 4,         // Acesso admin (sem super)
  'company_admin': 3, // Admin de uma empresa específica
  'employee': 2,      // Funcionário (pode fazer testes)
  'user': 1,          // Usuário comum (pode fazer testes)
} as const;

/**
 * Mapa de roles → paths de redirecionamento padrão
 */
const ROLE_REDIRECT_MAP: Record<string, string> = {
  'super_admin': '/admin',
  'admin': '/admin',
  'company_admin': '/company/dashboard',
  'employee': '/dashboard',
  'user': '/dashboard',
};

/**
 * Retorna o path de redirecionamento com base no papel do usuário
 * 
 * @param role - Papel do usuário
 * @param profileCompleted - Se o perfil do usuário está completo
 * @returns Path para redirecionar
 * 
 * REGRA: Se perfil não está completo, sempre leva para /profile
 */
export function getRedirectPathByRole(
  role?: UserRoleType | null,
  profileCompleted = false
): string {
  // Perfil incompleto sempre vai para /profile
  if (!profileCompleted) return '/profile';
  
  // Role não definida vai para dashboard padrão
  if (!role) return '/dashboard';
  
  // Usar mapa de redirecionamento
  return ROLE_REDIRECT_MAP[role] || '/dashboard';
}

/**
 * Valida se um role é válido
 */
export function isValidRole(role: any): role is UserRoleType {
  return role in ROLE_HIERARCHY;
}

/**
 * ========== FUNÇÕES DE VERIFICAÇÃO DE ACESSO ==========
 */

/**
 * Verifica se é admin (admin ou super_admin)
 */
export function isAdminRole(role?: UserRoleType | null): boolean {
  return role === 'admin' || role === 'super_admin';
}

/**
 * Verifica se é super admin
 */
export function isSuperAdminRole(role?: UserRoleType | null): boolean {
  return role === 'super_admin';
}

/**
 * Verifica se é company admin
 */
export function isCompanyAdminRole(role?: UserRoleType | null): boolean {
  return role === 'company_admin';
}

/**
 * Verifica se é employee
 */
export function isEmployeeRole(role?: UserRoleType | null): boolean {
  return role === 'employee';
}

/**
 * Verifica se é usuário comum
 */
export function isUserRole(role?: UserRoleType | null): boolean {
  return role === 'user';
}

/**
 * Verifica se é employee ou user (funcionário/usuário comum)
 */
export function isEmployeeOrUser(role?: UserRoleType | null): boolean {
  return role === 'employee' || role === 'user';
}

/**
 * ========== FUNÇÕES DE PROTEÇÃO DE ROTA ==========
 */

/**
 * Verifica se pode acessar rota /admin
 * Apenas: super_admin, admin
 */
export function canAccessAdmin(role?: UserRoleType | null): boolean {
  return isAdminRole(role);
}

/**
 * Verifica se pode acessar rota /company/dashboard
 * Apenas: company_admin
 */
export function canAccessCompanyDashboard(role?: UserRoleType | null): boolean {
  return role === 'company_admin';
}

/**
 * Verifica se pode acessar rota /dashboard
 * Qualquer usuário autenticado
 */
export function canAccessUserDashboard(role?: UserRoleType | null): boolean {
  return !!role;
}

/**
 * Verifica se pode acessar rota /test
 * Qualquer usuário autenticado
 */
export function canAccessTest(role?: UserRoleType | null): boolean {
  return !!role;
}

/**
 * Verifica se pode acessar rota /result
 * Qualquer usuário autenticado
 */
export function canAccessResult(role?: UserRoleType | null): boolean {
  return !!role;
}

/**
 * Verifica se pode ver resultados específicos
 * - user/employee: apenas seus próprios resultados
 * - company_admin: resultados da empresa dele
 * - admin/super_admin: todos os resultados
 * 
 * @param userRole - Role do usuário logado
 * @param resultOwnerId - ID do dono do resultado
 * @param resultCompanyId - company_id do resultado
 * @param userCompanyId - company_id do usuário logado
 */
export function canViewResult(
  userRole?: UserRoleType | null,
  resultOwnerId?: string,
  userOwnerId?: string,
  resultCompanyId?: string,
  userCompanyId?: string
): boolean {
  // Admin/super_admin podem ver tudo
  if (isAdminRole(userRole)) {
    return true;
  }

  // Company admin pode ver resultados de sua empresa
  if (isCompanyAdminRole(userRole) && resultCompanyId === userCompanyId) {
    return true;
  }

  // User/employee pode ver apenas seus resultados
  if (isEmployeeOrUser(userRole) && resultOwnerId === userOwnerId) {
    return true;
  }

  return false;
}

/**
 * ========== FUNÇÕES PARA REDIRECIONAR USUÁRIOS DESAUTORIZADOS ==========
 */

/**
 * Retorna o path para redirecionar se usuário não tiver permissão
 * 
 * @param userRole - Role do usuário
 * @param attemptedPath - Rota que o usuário tentou acessar
 * @returns Path para redirecionar ou null se pode acessar
 */
export function getRedirectIfUnauthorized(
  userRole?: UserRoleType | null,
  attemptedPath?: string
): string | null {
  if (!attemptedPath) return null;

  // Rota /admin
  if (attemptedPath.startsWith('/admin')) {
    if (!canAccessAdmin(userRole)) {
      // Redirecionar para dashboard da role do usuário
      return getRedirectPathByRole(userRole);
    }
    return null;
  }

  // Rota /company
  if (attemptedPath.startsWith('/company')) {
    if (!canAccessCompanyDashboard(userRole)) {
      return getRedirectPathByRole(userRole);
    }
    return null;
  }

  // Rota /dashboard
  if (attemptedPath.startsWith('/dashboard')) {
    if (!canAccessUserDashboard(userRole)) {
      return '/login';
    }
    return null;
  }

  // Rota /test
  if (attemptedPath.startsWith('/test')) {
    if (!canAccessTest(userRole)) {
      return '/login';
    }
    return null;
  }

  // Rota /result
  if (attemptedPath.startsWith('/result')) {
    if (!canAccessResult(userRole)) {
      return '/login';
    }
    return null;
  }

  return null;
}

/**
 * ========== FUNÇÕES UTILITÁRIAS ==========
 */

/**
 * Verifica se path está em uma área protegida que exige login
 */
export function isProtectedPath(path: string): boolean {
  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
  ];

  if (path === '/') {
    return false;
  }

  if (publicPaths.some(p => path === p || path.startsWith(`${p}/`))) {
    return false;
  }

  if (path.startsWith('/test/invite/')) {
    return false;
  }

  // APIs internas são públicas (gerenciadas por Next.js)
  if (path.startsWith('/api/') || path.startsWith('/_next/')) {
    return false;
  }

  // Tudo mais que não é público é protegido
  return true;
}

/**
 * Verifica se um usuário tem uma permissão mais alta que outra
 * 
 * @param userRole - Role do usuário
 * @param requiredRole - Role mínima necessária
 */
export function hasHigherOrEqualRole(
  userRole?: UserRoleType | null,
  requiredRole?: UserRoleType | null
): boolean {
  if (!userRole || !requiredRole) return false;
  
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  
  return userLevel >= requiredLevel;
}

/**
 * Retorna descrição legível do role
 */
export function getRoleLabel(role?: UserRoleType | null): string {
  const labels: Record<string, string> = {
    'super_admin': 'Super Admin',
    'admin': 'Admin',
    'company_admin': 'Admin da Empresa',
    'employee': 'Funcionário',
    'user': 'Usuário',
  };
  
  return role ? (labels[role] || 'Desconhecido') : 'Sem role definida';
}
