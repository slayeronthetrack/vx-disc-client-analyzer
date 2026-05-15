'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ClipboardList, User, LayoutDashboard, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { authService } from '@/lib/services/authService';
import { Logo } from '@/components/ui/Logo';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/company/dashboard') || pathname?.startsWith('/test/')) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await authService.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="text-gray-950 font-bold text-sm">VX</span>
            </div>
            <span className="text-white font-semibold text-sm hidden sm:block">
              DISC Test
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === '/'
                  ? 'bg-white/[0.08] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Home size={16} strokeWidth={1.5} />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {!loading && !user && (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/20 transition-all duration-200"
                >
                  Criar Conta
                  <ChevronRight size={14} strokeWidth={2} />
                </Link>
              </>
            )}

            {!loading && user && (
              <>
                <Link
                  href="/test"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === '/test'
                      ? 'bg-white/[0.08] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <ClipboardList size={16} strokeWidth={1.5} />
                  <span className="hidden sm:inline">Fazer Teste</span>
                </Link>

                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === '/profile'
                      ? 'bg-white/[0.08] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <User size={16} strokeWidth={1.5} />
                  <span className="hidden sm:inline">Perfil</span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname?.startsWith('/admin')
                        ? 'bg-white/[0.08] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <LayoutDashboard size={16} strokeWidth={1.5} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}

                <div className="w-px h-5 bg-white/[0.06] mx-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
