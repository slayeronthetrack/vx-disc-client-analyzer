import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-vx-dark-secondary border border-vx-orange/20 rounded-lg p-8 ${className}`}>
      {children}
    </div>
  );
}
