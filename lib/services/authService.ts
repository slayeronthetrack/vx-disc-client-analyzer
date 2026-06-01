/**
 * Auth Service
 * Serviço de autenticação
 */

import { supabase } from '../supabase/client';

export const authService = {
  /**
   * Criar nova conta
   * Aceita email completo ou username (adiciona @interno.vx automaticamente)
   */
  async signUp(email: string, password: string, fullName: string) {
    // Se não tem @, adicionar sufixo interno
    const normalizedEmail = email.includes('@') ? email : `${email}@interno.vx`;
    console.log('[authService] signUp with normalized email:', normalizedEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: undefined, // Desabilitar confirmação por email
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Login
   * Aceita email completo ou username (adiciona @interno.vx automaticamente)
   */
  async signIn(email: string, password: string) {
    console.log('[authService] Starting signIn...', { email });
    const startTime = Date.now();
    
    // Se não tem @, adicionar sufixo interno
    const normalizedEmail = email.includes('@') ? email : `${email}@interno.vx`;
    console.log('[authService] Normalized email:', normalizedEmail);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      
      const duration = Date.now() - startTime;
      console.log('[authService] signInWithPassword completed in', duration, 'ms');

      if (error) {
        console.error('[authService] signIn error:', error);
        throw error;
      }
      
      console.log('[authService] signIn successful, user:', data.user?.id);
      return data;
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error('[authService] signIn failed after', duration, 'ms:', err);
      throw err;
    }
  },

  /**
   * Logout
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Recuperar senha
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) throw error;
  },

  /**
   * Atualizar senha
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  /**
   * Obter usuário atual
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Obter sessão atual
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
};
