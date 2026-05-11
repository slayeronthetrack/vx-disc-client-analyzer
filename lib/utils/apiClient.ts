/**
 * API Client Utility
 * Helper functions for making authenticated API requests
 */

import { supabase } from '../supabase/client';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Make an authenticated fetch request
 * Automatically adds Authorization header with JWT token
 */
export async function authenticatedFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { requireAuth = true, headers = {}, ...restOptions } = options;

  // Get session token if authentication is required
  let authHeaders = {};
  if (requireAuth) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Você precisa estar autenticado para realizar esta ação');
    }

    authHeaders = {
      'Authorization': `Bearer ${session.access_token}`,
    };
  }

  // Make the request with auth headers
  return fetch(url, {
    ...restOptions,
    headers: {
      ...headers,
      ...authHeaders,
    },
  });
}

/**
 * Make an authenticated GET request
 */
export async function apiGet(url: string, requireAuth = true): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'GET',
    requireAuth,
  });
}

/**
 * Make an authenticated POST request
 */
export async function apiPost(
  url: string,
  data: any,
  requireAuth = true
): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    requireAuth,
  });
}

/**
 * Make an authenticated PATCH request
 */
export async function apiPatch(
  url: string,
  data: any,
  requireAuth = true
): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    requireAuth,
  });
}

/**
 * Make an authenticated DELETE request
 */
export async function apiDelete(url: string, requireAuth = true): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'DELETE',
    requireAuth,
  });
}
