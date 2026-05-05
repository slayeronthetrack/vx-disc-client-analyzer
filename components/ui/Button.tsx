import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  href,
  disabled = false,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseStyles = `
    px-8 py-4 rounded-lg font-semibold text-base
    transition-all duration-200 ease-in-out
    hover:scale-[1.03]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    inline-block text-center
  `;
  
  const variantStyles = {
    primary: `
      bg-vx-orange text-vx-dark
      hover:bg-vx-orange-hover
      hover:shadow-glow
    `,
    secondary: `
      bg-transparent border-2 border-vx-orange text-vx-orange
      hover:bg-vx-orange/10
    `
  };
  
  const styles = `${baseStyles} ${variantStyles[variant]} ${className}`;
  
  if (href && !disabled) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }
  
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled} 
      className={styles}
    >
      {children}
    </button>
  );
}
