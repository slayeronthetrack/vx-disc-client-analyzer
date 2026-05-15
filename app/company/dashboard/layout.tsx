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
  Mail,
  ChevronRight,
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

  const isCompanyAdmin = profile?.role === 'company_admin';
  const hasCompanyAccess = isCompanyAdmin && !!profile?.company_id;

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/company/dashboard' },
    { label: 'Funcionários', icon: Users, href: '/company/dashboard/employees' },
    { label: 'Convites', icon: Mail, href: '/company/dashboard/invitations' },
    { label: 'Perfil da Empresa', icon: Building2, href: '/company/dashboard/profile' },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/company/dashboard');
    }
    if (!loading && user && profile?.role === 'super_admin') {
      router.push('/admin');
    }
    if (!loading && user && profile?.role === 'admin') {
      router.push('/admin');
    }
    if (!loading && user && isCompanyAdmin && !profile?.company_id) {
      router.push('/profile');
    }
    if (!loading && user && profile && !isCompanyAdmin) {
      router.push('/dashboard');
    }
  }, [user, profile, loading, isCompanyAdmin, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return <Loading />;
  }

  if (!user || !hasCompanyAccess) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-950">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-3 left-3 z-50 p-2 glass rounded-xl text-gray-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 h-full w-[240px] bg-gray-950/90 backdrop-blur-xl border-r border-white/[0.06]
            transform transition-transform duration-300 ease-out z-40
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
        >
          <div className="p-5 border-b border-white/[0.06]">
            <Logo />
            <div className="mt-3">
              <p className="text-xs text-gray-500">Painel da Empresa</p>
              <span className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-md text-[11px] font-medium">
                <Briefcase size={11} strokeWidth={2} />
                Company Admin
              </span>
            </div>
          </div>

          <nav className="p-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} strokeWidth={2} className="text-orange-400" />}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06] space-y-3">
            <div className="px-3">
              <p className="text-[11px] text-gray-500 mb-0.5">Logado como</p>
              <p className="text-sm text-gray-300 truncate">{profile?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/[0.04] hover:text-gray-200 transition-all duration-200 w-full"
            >
              <LogOut size={18} strokeWidth={1.5} />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-[240px] min-h-screen">
          {children}
        </main>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
