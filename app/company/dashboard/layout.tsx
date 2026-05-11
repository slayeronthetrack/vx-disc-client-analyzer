/**
 * Company Dashboard Layout
 * Layout for company admin pages with sidebar navigation
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2,
  LogOut,
  Menu,
  X,
  Briefcase,
  Mail
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/ui/Loading';
import { Logo } from '@/components/ui/Logo';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is company_admin
  const isCompanyAdmin = profile?.role === 'company_admin';

  // Navigation items for company admin
  const navItems = [
    { 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      href: '/company/dashboard' 
    },
    { 
      label: 'Funcionários', 
      icon: Users, 
      href: '/company/dashboard/employees' 
    },
    { 
      label: 'Convites', 
      icon: Mail, 
      href: '/company/dashboard/invitations' 
    },
    { 
      label: 'Perfil da Empresa', 
      icon: Building2, 
      href: '/company/dashboard/profile' 
    },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/company/dashboard');
    }
    
    // Redirect non-company_admin users
    if (!loading && user && !isCompanyAdmin) {
      router.push('/dashboard');
    }
  }, [user, loading, isCompanyAdmin, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return <Loading />;
  }

  if (!user || !isCompanyAdmin) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 h-full w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700
            transform transition-transform duration-200 ease-in-out z-40
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
        >
          <div className="p-6 border-b border-gray-700">
            <Logo />
            <div className="mt-2">
              <p className="text-sm text-gray-400">Painel da Empresa</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 text-orange-500 rounded text-xs font-medium">
                <Briefcase size={12} />
                Company Admin
              </span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-orange-500 text-white font-semibold shadow-lg' 
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
            <div className="mb-3 px-4">
              <p className="text-xs text-gray-500">Logado como</p>
              <p className="text-sm text-gray-300 truncate">{profile?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-white transition-all duration-200 w-full"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-64 min-h-screen">
          {children}
        </main>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
