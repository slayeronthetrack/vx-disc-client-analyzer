import Link from 'next/link';
import { Container } from './Container';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';

export function Header() {
  return (
    <header className="border-b border-white/[0.08] bg-vx-dark">
      <Container>
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-vx-gray text-sm hidden md:block">
              Diagnóstico Comportamental
            </span>
          </div>
          <Button variant="secondary" href="/dashboard">
            Área VX
          </Button>
        </div>
      </Container>
    </header>
  );
}
