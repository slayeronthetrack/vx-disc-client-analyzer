'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';

const navItems = [
  { label: 'Dashboard', icon: '📊', href: '/dashboard' },
  { label: 'Clientes', icon: '👥', href: '/dashboard/clients' },
  { label: 'Testes', icon: '📝', href: '/dashboard/tests' },
  { label: 'Resultados', icon: '📈', href: '/dashboard/results' },
  { label: 'Configurações', icon: '⚙️', href: '/dashboard/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-vx-secondary border-r border-white/[0.08] min-h-screen">
      <div className="p-6">
        <Logo />
      </div>
      <nav className="px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg mb-1
                transition-all duration-200
                ${isActive 
                  ? 'bg-vx-orange text-vx-dark font-semibold' 
                  : 'text-vx-gray hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
