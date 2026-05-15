'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, BarChart3, Settings } from 'lucide-react';
import { Logo } from './Logo';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Clientes', icon: Users, href: '/dashboard/clients' },
  { label: 'Testes', icon: FileText, href: '/dashboard/tests' },
  { label: 'Resultados', icon: BarChart3, href: '/dashboard/results' },
  { label: 'Configurações', icon: Settings, href: '/dashboard/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900/80 backdrop-blur-xl border-r border-white/[0.06] min-h-screen flex flex-col">
      <div className="p-6 border-b border-white/[0.06]">
        <Logo />
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm'
                  : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200 border border-transparent'
                }
              `}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/[0.06]">
        <p className="text-xs text-gray-500">VX DISC Test v1.0</p>
      </div>
    </aside>
  );
}
