/**
 * Root Layout - VX DISC Test
 * Layout global com navbar
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import FloatingChatWidget from '@/components/FloatingChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VX DISC Test - Descubra Seu Perfil Comportamental',
  description: 'Teste DISC profissional da VX Consultoria',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <FloatingChatWidget />
      </body>
    </html>
  );
}
