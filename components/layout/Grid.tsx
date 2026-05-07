interface GridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

export function Grid({ children, cols = 2, className = '' }: GridProps) {
  const gridCols = cols === 2 ? 'md:grid-cols-2' : cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';
  
  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-6 ${className}`}>
      {children}
    </div>
  );
}
