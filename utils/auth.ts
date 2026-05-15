import type { UserRole } from '@/types/database';

export type UserRoleType = UserRole;

/**
 * Mapa de roles → paths de redirecionamento padrão
 */
const ROLE_REDIRECT_MAP: Record<string, string> = {
  super_admin: '/admin',
  admin: '/admin',
  company_admin: '/company/dashboard',
  employee: '/dashboard',
  user: '/dashboard',
};

/**
 * Retorna o path de redirecionamento com base no papel do usuário.
 * Se o perfil não estiver completo, sempre leva para /profile.
 */
export function getRedirectPathByRole(
  role?: UserRoleType | null,
  profileCompleted = false
): string {
  if (!role || !profileCompleted) return '/profile';
  return ROLE_REDIRECT_MAP[role] || '/dashboard';
}

/**
 * Verifica se o papel do usuário tem permissão para acessar um path.
 * Usado no middleware e nas páginas.
 */
export function canAccessPath(
  path: string,
  role?: UserRoleType | null
): boolean {
  // Rotas públicas
  if (
    path === '/' ||
    path === '/login' ||
    path.startsWith('/login/') ||
    path === '/register' ||
    path.startsWith('/register/') ||
    path === '/forgot-password' ||
    path.startsWith('/forgot-password/') ||
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/test/invite/')
  ) {
    return true;
  }

  // /admin → apenas admin e super_admin
  if (path.startsWith('/admin')) {
    return role === 'admin' || role === 'super_admin';
  }

  // /company → apenas company_admin
  if (path.startsWith('/company')) {
    return role === 'company_admin';
  }

  // Rotas protegidas (qualquer autenticado)
  if (
    path.startsWith('/dashboard') ||
    path.startsWith('/test') ||
    path.startsWith('/result') ||
    path.startsWith('/history') ||
    path.startsWith('/profile')
  ) {
    return true;
  }

  return false;
}

/**
 * Verifica se o path está em uma área protegida que exige login mínimo.
 */
export function isProtectedPath(path: string): boolean {
  const publicPaths = ['/login', '/register', '/forgot-password'];

  if (path === '/') {
    return false;
  }

  if (publicPaths.some((p) => path === p || path.startsWith(`${p}/`))) {
    return false;
  }

  if (path.startsWith('/test/invite/')) {
    return false;
  }

  if (path.startsWith('/api/') || path.startsWith('/_next/')) {
    return false;
  }

  return true;
}
