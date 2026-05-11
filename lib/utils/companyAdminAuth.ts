/**
 * Company Admin Authentication Middleware
 * 
 * Provides authentication and authorization checks for company_admin role
 * Ensures users have the correct role and company association
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

interface CompanyAdminProfile {
  role: string;
  company_id: string | null;
}

interface AuthorizedResponse {
  authorized: true;
  user: {
    id: string;
    email?: string;
  };
  profile: CompanyAdminProfile;
  supabase: SupabaseClient;
}

interface UnauthorizedResponse {
  authorized: false;
  response: NextResponse;
}

type AuthCheckResponse = AuthorizedResponse | UnauthorizedResponse;

/**
 * Check if the current user has company_admin access
 * 
 * Validates:
 * 1. User is authenticated
 * 2. User has company_admin role
 * 3. User has a valid company_id association
 * 
 * @returns AuthCheckResponse with user, profile, supabase client, or error response
 */
export async function checkCompanyAdminAccess(): Promise<AuthCheckResponse> {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    };
  }

  // Fetch user profile with role and company_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('[checkCompanyAdminAccess] Profile fetch error:', profileError);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden - Profile not found' },
        { status: 403 }
      ),
    };
  }

  // Check if user has company_admin role
  if (profile.role !== 'company_admin') {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden - Company admin access required' },
        { status: 403 }
      ),
    };
  }

  // Check if user has a company_id association
  if (!profile.company_id) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Bad Request - Company association required. Please contact support.' },
        { status: 400 }
      ),
    };
  }

  // All checks passed - return authorized response
  return {
    authorized: true,
    user: {
      id: user.id,
      email: user.email,
    },
    profile: {
      role: profile.role,
      company_id: profile.company_id,
    },
    supabase,
  };
}

/**
 * Type guard to check if auth response is authorized
 */
export function isAuthorized(
  response: AuthCheckResponse
): response is AuthorizedResponse {
  return response.authorized === true;
}
