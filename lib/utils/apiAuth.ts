/**
 * API Authentication Utilities
 * Helper functions for checking authentication and authorization in API routes
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Check if user is authenticated and has global admin access.
 * Company admins are scoped to /company APIs and are not global admins.
 */
export async function checkAdminAccess() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('[checkAdminAccess] Profile not found:', profileError);
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Forbidden - Profile not found' },
        { status: 403 }
      ),
    };
  }

  const adminRoles = ['admin', 'super_admin'];
  if (!adminRoles.includes(profile.role)) {
    console.error('[checkAdminAccess] User role not authorized:', profile.role);
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: `Forbidden - Admin access required (current role: ${profile.role})` },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    user,
    profile,
    supabase,
  };
}

/**
 * Check if user is authenticated and has super admin access.
 * Returns authorized: true only for super_admin users.
 */
export async function checkSuperAdminAccess() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('[checkSuperAdminAccess] Profile not found:', profileError);
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Forbidden - Profile not found' },
        { status: 403 }
      ),
    };
  }

  if (profile.role !== 'super_admin') {
    console.error('[checkSuperAdminAccess] User role not authorized:', profile.role);
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: `Forbidden - Super admin access required (current role: ${profile.role})` },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    user,
    profile,
    supabase,
  };
}

/**
 * Check if user is authenticated (no admin check)
 * Returns authenticated: true if user exists, or a NextResponse with error
 */
export async function checkAuth() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authenticated: false as const,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  return {
    authenticated: true as const,
    user,
    supabase,
  };
}
