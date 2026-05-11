/**
 * Supabase Server Client
 * For use in Server Components and API Routes
 * Supports both cookie-based auth (SSR) and Bearer token (API calls)
 */

import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // Extract Bearer token from Authorization header (used by apiClient.ts)
  const authHeader = headerStore.get('authorization') ?? headerStore.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: bearerToken
        ? { headers: { Authorization: `Bearer ${bearerToken}` } }
        : undefined,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorado em Server Components — middleware cuida do refresh
          }
        },
      },
    }
  );
}
