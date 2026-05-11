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
    let isSubscribed = true;
    let loadingInProgress = false;

    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      if (isSubscribed) {
        console.warn('[useAuth] Loading timeout - forcing loading to false');
        setState((prev) => ({ ...prev, loading: false }));
      }
    }, 8000); // 8 segundos

    // Carregar estado inicial
    const initAuth = async () => {
      if (loadingInProgress) {
        console.log('[useAuth] Load already in progress, skipping');
        return;
      }
      
      loadingInProgress = true;
      
      try {
        await loadUserState();
      } finally {
        loadingInProgress = false;
        clearTimeout(timeout);
      }
    };

    initAuth();

    // Escutar APENAS logout - não precisamos escutar SIGNED_IN
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isSubscribed) return;
        
        console.log('[useAuth] Auth state changed:', event);
        
        // Ignorar todos os eventos exceto SIGNED_OUT
        if (event === 'SIGNED_OUT') {
          console.log('[useAuth] User signed out, clearing state');
          setState({
            user: null,
            profile: null,
            isAdmin: false,
            hasProfile: false,
            hasCompletedTest: false,
            latestTestResult: null,
            loading: false,
          });
        } else {
          console.log('[useAuth] Ignoring event:', event);
        }
      }
    );

    return () => {
      isSubscribed = false;
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
      
      // Aceitar admin, super_admin, company_admin como admin
      const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'company_admin';
      const hasProfile = profile?.profile_completed || false;

      // NÃO buscar teste aqui - deixar para as páginas específicas fazerem isso
      // Isso evita lentidão no carregamento inicial
      console.log('[useAuth] Skipping test fetch for performance');
      
      const hasCompletedTest = false; // Será verificado pelas páginas específicas
      const latestTest = null;

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
    console.log('[useAuth] Manual refresh requested');
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

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setState({
        user: null,
        profile: null,
        isAdmin: false,
        hasProfile: false,
        hasCompletedTest: false,
        latestTestResult: null,
        loading: false,
      });
    } catch (error) {
      console.error('[useAuth] Error signing out:', error);
    }
  };

  return {
    ...state,
    refreshState,
    requireAuth,
    requireProfile,
    requireAdmin,
    signOut,
  };
}
