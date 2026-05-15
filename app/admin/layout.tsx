/**
 * Admin Layout
 * Layout for admin pages with sidebar navigation
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ClipboardList,
  Mail,
  FileBarChart,
  Gauge,
  BrainCircuit,
  CreditCard,
  Blocks,
  TerminalSquare,
  Bell,
  Search
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/ui/Loading';
import { Logo } from '@/components/ui/Logo';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isSuperAdmin = profile?.role === 'super_admin';
  const isGlobalAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  // Base nav items for all admins
  const baseNavItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin'
    },
    {
      label: 'Empresas',
      icon: Building2,
      href: '/admin/companies'
    },
    {
      label: 'Usuários',
      icon: Users,
      href: '/admin/employees'
    },
    {
      label: 'Testes',
      icon: ClipboardList,
      href: '/admin/analytics'
    },
    {
      label: 'Convites',
      icon: Mail,
      href: '/admin/companies'
    },
    {
      label: 'Relatórios',
      icon: FileBarChart,
      href: '/admin/analytics'
    },
    {
      label: 'Desempenho',
      icon: Gauge,
      href: '/admin/analytics'
    },
    {
      label: 'DISC Insights',
      icon: BrainCircuit,
      href: '/admin/analytics'
    },
    {
      label: 'Configurações',
      icon: Settings,
      href: '/admin/settings'
    },
    {
      label: 'Planos',
      icon: CreditCard,
      href: '/admin/settings'
    },
    {
      label: 'Integrações',
      icon: Blocks,
      href: '/admin/settings'
    },
    {
      label: 'Logs do Sistema',
      icon: TerminalSquare,
      href: '/admin/settings'
    },
  ];

  // Super admin exclusive items
  const superAdminItems = [
    {
      label: 'Admins',
      icon: Shield,
      href: '/admin/admins',
      superAdminOnly: true
    },
  ];

  const navItems = isSuperAdmin
    ? [...baseNavItems.slice(0, 2), ...superAdminItems, ...baseNavItems.slice(2)]
    : baseNavItems;

  const getNavItemKey = (item: { href: string; label: string }) => `${item.href}-${item.label}`;
  const activeNavItem = navItems.find((item) => pathname === item.href) || navItems[0];
  const activeNavItemKey = getNavItemKey(activeNavItem);
  const currentItem = activeNavItem;
  const userInitial = profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A';

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login?redirect=/admin');
      return;
    }

    if (profile?.role === 'company_admin') {
      router.push('/company/dashboard');
      return;
    }

    if (profile && !isGlobalAdmin) {
      router.push('/dashboard');
    }
  }, [user, profile, loading, isGlobalAdmin, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return <Loading />;
  }

  if (!user || (profile && !isGlobalAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#0B0F14] text-[#F9FAFB]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(247,151,30,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.10),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_35%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />

      {/* Mobile Menu Button */}
      <button
        type="button"
        aria-label={sidebarOpen ? 'Fechar menu administrativo' : 'Abrir menu administrativo'}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.06] text-white shadow-2xl shadow-black/30 backdrop-blur-xl transition hover:bg-white/[0.10] lg:hidden"
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col border-r border-white/[0.08]
          bg-[#0B0F14]/90 shadow-[24px_0_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl
          transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="border-b border-white/[0.08] p-6">
          <div className="flex items-center justify-between gap-3">
            <Logo />
            <div className="h-2 w-2 rounded-full bg-vx-orange shadow-glow" />
          </div>
          <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3">
            <p className="text-xs uppercase tracking-[0.24em] text-[#94A3B8]">Admin Panel</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-vx-orange/15 text-xs font-bold text-vx-orange ring-1 ring-vx-orange/25">
                {userInitial.toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{profile?.full_name || 'Administrador'}</p>
                <p className="truncate text-xs text-[#94A3B8]">{user.email}</p>
              </div>
            </div>
            {isSuperAdmin && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-vx-orange/25 bg-vx-orange/10 px-2.5 py-1 text-xs font-medium text-vx-orange">
                <Shield size={12} />
                Super Admin
              </span>
            )}
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = getNavItemKey(item) === activeNavItemKey;
            const Icon = item.icon;

            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm
                  transition-all duration-200
                  ${isActive
                    ? 'bg-vx-orange text-[#0B0F14] font-semibold shadow-glow'
                    : 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-white'
                  }
                `}
              >
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition ${isActive ? 'bg-black/10' : 'bg-white/[0.04] text-inherit group-hover:bg-white/[0.08]'}`}>
                  <Icon size={17} />
                </span>
                <span className="truncate">{item.label}</span>
                {'superAdminOnly' in item && Boolean(item.superAdminOnly) && (
                  <Shield size={14} className="ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.08] p-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#94A3B8] transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative min-h-screen lg:ml-[260px]">
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0B0F14]/72 backdrop-blur-2xl">
          <div className="flex min-h-[76px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="pl-14 lg:pl-0">
              <p className="text-xs uppercase tracking-[0.28em] text-vx-orange">VX DISC Command Center</p>
              <h1 className="mt-1 text-xl font-semibold text-white">{currentItem?.label || 'Admin'}</h1>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="hidden min-w-[260px] items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-[#94A3B8] shadow-inner shadow-black/20 md:flex">
                <Search size={16} />
                <span>Buscar empresas, usuários, testes...</span>
              </div>
              <button
                type="button"
                aria-label="Notificações"
                className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-[#94A3B8] transition hover:bg-white/[0.08] hover:text-white sm:inline-flex"
              >
                <Bell size={18} />
              </button>
              <div className="hidden items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 sm:flex">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-vx-orange to-yellow-300 text-sm font-bold text-[#0B0F14]">
                  {userInitial.toUpperCase()}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-white">{profile?.full_name || 'Admin'}</p>
                  <p className="text-xs text-[#94A3B8]">{isSuperAdmin ? 'Super Admin' : 'Admin'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        {children}
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
