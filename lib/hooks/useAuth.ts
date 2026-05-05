/**
 * useAuth Hook
 * Hook global de autenticação e estado do usuário
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase/client';
import { profileService } from '../services/profileService';
import { discTestService } from '../services/discTestService';
import type { UserState } from '@/types/database';

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<UserState>({
    user: null,
    profile: null,
    isAdmin: false,
    hasProfile: false,
    hasCompletedTest: false,
    latestTestResult: null,
    loading: true,
  });

  useEffect(() => {
    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      console.warn('[useAuth] Loading timeout - forcing loading to false');
      setState((prev) => ({ ...prev, loading: false }));
    }, 10000); // 10 segundos

    // Carregar estado inicial
    loadUserState().finally(() => {
      clearTimeout(timeout);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' && session) {
          await loadUserState();
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            isAdmin: false,
            hasProfile: false,
            hasCompletedTest: false,
            latestTestResult: null,
            loading: false,
          });
        }
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserState = async () => {
    try {
      console.log('[useAuth] Loading user state...');
      setState((prev) => ({ ...prev, loading: true }));

      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('[useAuth] User:', user ? 'Found' : 'Not found', error ? `Error: ${error.message}` : '');

      if (error || !user) {
        console.log('[useAuth] No user, setting empty state');
        setState({
          user: null,
          profile: null,
          isAdmin: false,
          hasProfile: false,
          hasCompletedTest: false,
          latestTestResult: null,
          loading: false,
        });
        return;
      }

      // Buscar perfil
      console.log('[useAuth] Fetching profile...');
      const profile = await profileService.getProfile(user.id);
      console.log('[useAuth] Profile:', profile ? 'Found' : 'Not found');
      
      const isAdmin = profile?.role === 'admin';
      const hasProfile = profile?.profile_completed || false;

      // Buscar último teste (com tratamento de erro)
      console.log('[useAuth] Fetching latest test...');
      let latestTest = null;
      try {
        latestTest = await discTestService.getLatestTest(user.id);
        console.log('[useAuth] Latest test:', latestTest ? 'Found' : 'Not found');
      } catch (testError) {
        console.error('[useAuth] Error fetching test (non-critical):', testError);
        // Não bloquear o carregamento se houver erro ao buscar teste
      }
      
      const hasCompletedTest = !!latestTest;

      console.log('[useAuth] State loaded successfully');
      setState({
        user,
        profile,
        isAdmin,
        hasProfile,
        hasCompletedTest,
        latestTestResult: latestTest,
        loading: false,
      });
    } catch (error) {
      console.error('[useAuth] Error loading user state:', error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const refreshState = async () => {
    await loadUserState();
  };

  const requireAuth = (redirectTo: string = '/login') => {
    if (!state.loading && !state.user) {
      router.push(redirectTo);
      return false;
    }
    return true;
  };

  const requireProfile = (redirectTo: string = '/profile') => {
    if (!state.loading && state.user && !state.hasProfile) {
      router.push(redirectTo);
      return false;
    }
    return true;
  };

  const requireAdmin = (redirectTo: string = '/') => {
    if (!state.loading && (!state.user || !state.isAdmin)) {
      router.push(redirectTo);
      return false;
    }
    return true;
  };

  return {
    ...state,
    refreshState,
    requireAuth,
    requireProfile,
    requireAdmin,
  };
}
