interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className = '', hoverable = true }: CardProps) {
  const hoverStyles = hoverable ? `
    hover:shadow-xl hover:-translate-y-1
    transition-all duration-200 ease-in-out
  ` : '';
  
  return (
    <div className={`
      bg-vx-secondary rounded-xl p-6
      border border-white/[0.08]
      ${hoverStyles}
      ${className}
    `}>
      {children}
    </div>
  );
}
