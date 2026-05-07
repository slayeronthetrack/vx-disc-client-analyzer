/**
 * Middleware
 * DESABILITADO TEMPORARIAMENTE - Causando lentidão no login
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Middleware completamente desabilitado
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
