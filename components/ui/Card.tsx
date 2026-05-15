interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glass?: boolean;
}

export function Card({ children, className = '', hoverable = true, glass = true }: CardProps) {
  return (
    <div className={`
      rounded-2xl p-6
      ${glass
        ? 'bg-gray-900/40 backdrop-blur-xl border border-white/[0.06]'
        : 'bg-gray-900 border border-gray-800'
      }
      ${hoverable
        ? 'hover:bg-gray-900/60 hover:border-white/[0.10] transition-all duration-300'
        : ''
      }
      ${className}
    `}>
      {children}
    </div>
  );
}
