import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware
 * Gerencia proteção de rotas e autenticação no servidor
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  console.log('[Middleware] Path:', pathname, 'Authenticated:', !!user)

  // ── ROTAS PÚBLICAS ────────────────────────────────────────────────
  const publicPaths = ['/login', '/register', '/forgot-password']
  const isPublicPath = pathname === '/' || publicPaths.some(p => pathname === p || pathname.startsWith(`${p}/`))

  // ── ROTAS DE CONVITE (PÚBLICAS) ───────────────────────────────────
  const isInvitePath = pathname.startsWith('/test/invite/')

  // ── Se for rota pública ou convite, deixar passar ──────────────────
  if (isPublicPath || isInvitePath) {
    console.log('[Middleware] Public path, allowing:', pathname)
    return supabaseResponse
  }

  // ── Se não está autenticado e a rota não é pública → login ─────────
  if (!user) {
    console.log('[Middleware] Not authenticated, redirecting to login from:', pathname)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Buscar role do perfil para proteger rotas específicas ────────────
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    console.warn('[Middleware] Profile not found for user:', user.id, profileError?.message)
    // Se perfil não existe, usuário precisa completar registro
    // Redirecionar apenas se não estiver em rota de profile
    if (!pathname.startsWith('/profile')) {
      console.log('[Middleware] No profile, redirecting to /profile')
      return NextResponse.redirect(new URL('/profile', request.url))
    }
    return supabaseResponse
  }

  const role = profile.role as string | null
  const companyId = profile.company_id as string | null

  console.log('[Middleware] User authenticated', {
    userId: user.id,
    role,
    companyId,
    requestedPath: pathname,
  })

  // ── PROTEÇÃO: /admin → apenas admin ou super_admin ──────────────────
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin' && role !== 'super_admin') {
      console.log('[Middleware] Unauthorized access to /admin, role:', role)
      
      // Redirecionar baseado na role
      if (role === 'company_admin') {
        return NextResponse.redirect(new URL('/company/dashboard', request.url))
      }
      
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    console.log('[Middleware] Admin access granted for:', role)
    return supabaseResponse
  }

  // ── PROTEÇÃO: /company → apenas company_admin ──────────────────────
  if (pathname.startsWith('/company')) {
    if (role !== 'company_admin') {
      console.log('[Middleware] Unauthorized access to /company, role:', role)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Company admin deve estar vinculado a uma empresa
    if (!companyId) {
      console.warn('[Middleware] company_admin without company_id')
      return NextResponse.redirect(new URL('/profile', request.url))
    }

    console.log('[Middleware] Company dashboard access granted for:', role)
    return supabaseResponse
  }

  // ── PROTEÇÃO: /dashboard → qualquer usuário autenticado ──────────────
  if (pathname.startsWith('/dashboard')) {
    if (!role) {
      console.log('[Middleware] No role, redirecting to /profile')
      return NextResponse.redirect(new URL('/profile', request.url))
    }
    console.log('[Middleware] Dashboard access granted')
    return supabaseResponse
  }

  // ── PROTEÇÃO: /test → qualquer usuário autenticado ──────────────────
  if (pathname.startsWith('/test')) {
    if (!role && !isInvitePath) {
      console.log('[Middleware] Unauthorized test access')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    console.log('[Middleware] Test access granted')
    return supabaseResponse
  }

  // ── PROTEÇÃO: /result → qualquer usuário autenticado ────────────────
  if (pathname.startsWith('/result')) {
    if (!role) {
      console.log('[Middleware] Unauthorized result access')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    console.log('[Middleware] Result access granted')
    return supabaseResponse
  }

  // ── PROTEÇÃO: /history → qualquer usuário autenticado ────────────────
  if (pathname.startsWith('/history')) {
    if (!role) {
      console.log('[Middleware] Unauthorized history access')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  // ── PROTEÇÃO: /profile → qualquer usuário autenticado ────────────────
  if (pathname.startsWith('/profile')) {
    console.log('[Middleware] Profile access granted')
    return supabaseResponse
  }

  console.log('[Middleware] Path allowed:', pathname)
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}