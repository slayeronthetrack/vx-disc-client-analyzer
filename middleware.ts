/**
 * Middleware
 * Proteção de rotas e redirecionamento
 * Versão simplificada - funciona sem Supabase configurado
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas públicas (sempre acessíveis)
  const publicRoutes = ['/', '/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Rotas privadas (precisam de autenticação)
  const privateRoutes = ['/profile', '/test', '/result'];
  const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));

  // Rota admin
  const isAdminRoute = pathname.startsWith('/admin');

  // Por enquanto, permitir acesso a todas as rotas
  // Quando Supabase estiver configurado, descomentar a lógica abaixo
  
  /*
  // Verificar se tem token de sessão
  const token = req.cookies.get('sb-access-token')?.value;
  const hasSession = !!token;

  // Se não está logado e tenta acessar rota privada
  if (!hasSession && isPrivateRoute) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Se não está logado e tenta acessar admin
  if (!hasSession && isAdminRoute) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Se está logado e tenta acessar login/register
  if (hasSession && (pathname === '/login' || pathname === '/register')) {
    const redirectUrl = new URL('/profile', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/profile',
    '/test',
    '/result',
    '/admin/:path*',
  ],
};
