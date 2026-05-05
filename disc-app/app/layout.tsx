import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VX Consultoria - Diagnóstico DISC',
  description: 'Descubra seu perfil comportamental com o teste DISC profissional da VX Consultoria',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
