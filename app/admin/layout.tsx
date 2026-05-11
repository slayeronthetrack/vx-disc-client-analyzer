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
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  Shield
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

  // Check if user is super_admin
  const isSuperAdmin = profile?.role === 'super_admin';

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
      label: 'Analytics', 
      icon: BarChart3, 
      href: '/admin/analytics' 
    },
    { 
      label: 'Configurações', 
      icon: Settings, 
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

  // Combine nav items based on role
  const navItems = isSuperAdmin 
    ? [...baseNavItems.slice(0, 2), ...superAdminItems, ...baseNavItems.slice(2)]
    : baseNavItems;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/admin');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
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
            <p className="text-sm text-gray-400">Admin Panel</p>
            {isSuperAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 text-orange-500 rounded text-xs font-medium">
                <Shield size={12} />
                Super Admin
              </span>
            )}
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
                {'superAdminOnly' in item && item.superAdminOnly && (
                  <Shield size={14} className="ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
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
  );
}
