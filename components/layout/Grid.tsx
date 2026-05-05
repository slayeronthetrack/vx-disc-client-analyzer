interface GridProps {
  children: React.ReactNode;
  cols?: 2 | 3;
  className?: string;
}

export function Grid({ children, cols = 2, className = '' }: GridProps) {
  const gridCols = cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';
  
  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-6 ${className}`}>
      {children}
    </div>
  );
}
