/**
 * Login Page
 * Página de login do sistema
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '@/lib/services/authService';
import { profileService } from '@/lib/services/profileService';
import { discTestService } from '@/lib/services/discTestService';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  getRedirectPathByRole, 
  getRoleLabel,
  isValidRole 
} from '@/lib/auth/permissions';

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshState } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (authLoading || !user || isRedirecting) return;

    if (!profile) {
      console.log('[Login] User already logged in without profile, redirecting to /profile');
      setIsRedirecting(true);
      router.push('/profile');
      return;
    }

    if (!isValidRole(profile.role)) {
      console.warn('[Login] User already logged in with invalid role, redirecting to /profile');
      setIsRedirecting(true);
      router.push('/profile');
      return;
    }

    const redirectPath = getRedirectPathByRole(profile.role, profile.profile_completed);
    console.log('[Login] User already logged in, redirecting by role:', redirectPath);
    setIsRedirecting(true);
    router.push(redirectPath);
  }, [user, profile, authLoading, isRedirecting, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Evitar múltiplos submits
    if (loading) {
      console.log('[Login] Already loading, ignoring submit');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      // Validações
      if (!email || !password) {
        throw new Error('Preencha todos os campos');
      }

      console.log('[Login] Attempting login...', { email });
      const startTime = Date.now();
      
      // 1. Fazer login no Supabase Auth
      const result = await authService.signIn(email, password);
      const loginTime = Date.now() - startTime;
      const userId = result.user?.id;
      
      console.log('[Login] Auth successful in', loginTime, 'ms', { userId });

      // 2. Buscar perfil do usuário para obter role e status
      console.log('[Login] Fetching user profile...');
      const profile = await profileService.getProfile(userId!);
      
      if (!profile) {
        console.warn('[Login] Profile not found for user:', userId);
        // Usuário autenticado mas sem perfil, ir para profile
        router.push('/profile');
        return;
      }

      // 3. Validar role
      const role = profile.role as string;
      const isValidRoleValue = isValidRole(role);
      
      console.log('[Login] User profile loaded', {
        userId,
        role,
        isValidRole: isValidRoleValue,
        profileCompleted: profile.profile_completed,
        companyId: profile.company_id,
      });

      if (!isValidRoleValue) {
        console.warn('[Login] Invalid or missing role for user:', { userId, role });
        // Role inválida, ir para profile para completar
        router.push('/profile');
        return;
      }

      // 4. Determinar redirecionamento baseado na role
      const redirectPath = getRedirectPathByRole(
        role as any,
        profile.profile_completed
      );
      
      console.log('[Login] Login successful - Redirecting', {
        role,
        roleLabel: getRoleLabel(role as any),
        path: redirectPath,
        profileCompleted: profile.profile_completed,
      });

      // 5. Redirecionar
      router.push(redirectPath);
      
    } catch (err: any) {
      console.error('[Login] Login error:', err);
      setError(
        err.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : err.message || 'Erro ao fazer login. Tente novamente.'
      );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 mb-4">
            <span className="text-gray-900 font-bold text-2xl">VX</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-gray-400">
            Entre para continuar seu teste DISC
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                E-mail ou Usuário
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="seu@email.com ou usuario"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Esqueci senha */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-orange-500 hover:text-orange-400 text-sm transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Criar conta */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{' '}
              <Link
                href="/register"
                className="text-orange-500 hover:text-orange-400 font-medium transition-colors"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        {/* Voltar */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
          >
            ← Voltar para Home
          </Link>
        </div>
      </div>
    </div>
  );
}
