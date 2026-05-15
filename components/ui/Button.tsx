import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

const variantStyles = {
  primary: `
    bg-vx-orange text-[#0B0F14] font-semibold
    hover:bg-vx-orange-hover
    active:bg-orange-600
    shadow-lg shadow-orange-500/20
    hover:shadow-orange-500/30
    disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
  `,
  secondary: `
    bg-white/[0.06] text-gray-200 font-medium border border-white/[0.08]
    hover:bg-white/[0.10] hover:border-white/[0.12]
    active:bg-white/[0.04]
    disabled:opacity-40
  `,
  ghost: `
    text-gray-400 font-medium
    hover:text-white hover:bg-white/[0.06]
    active:bg-white/[0.04]
    disabled:opacity-40
  `,
  destructive: `
    bg-red-500/12 text-red-200 font-medium border border-red-500/20
    hover:bg-red-500/18 hover:border-red-500/30
    active:bg-red-500/10
    disabled:opacity-40
  `,
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  href,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const styles = `
    inline-flex items-center justify-center gap-2
    transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vx-orange/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F14]
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  const content = (
    <>
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </>
  );

  if (href && !isDisabled) {
    return (
      <Link href={href} className={styles}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={isDisabled} className={styles}>
      {content}
    </button>
  );
}
