/**
 * Navbar Component
 * Navegação global do sistema
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ClipboardList, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { authService } from '@/lib/services/authService';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  const isActive = (path: string) => pathname === path;

  // Não mostrar navbar na página admin
  if (pathname?.startsWith('/admin')) {
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
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              <span className="text-gray-900 font-bold text-lg">VX</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">
              DISC Test
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Home size={18} />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {!loading && !user && (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-200"
                >
                  Criar Conta
                </Link>
              </>
            )}

            {!loading && user && (
              <>
                <Link
                  href="/test"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/test')
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <ClipboardList size={18} />
                  <span className="hidden sm:inline">Fazer Teste</span>
                </Link>

                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/profile')
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <User size={18} />
                  <span className="hidden sm:inline">Perfil</span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive('/admin')
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <LayoutDashboard size={18} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
                >
                  <LogOut size={18} />
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
