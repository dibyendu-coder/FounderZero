import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out disabled:opacity-40 disabled:pointer-events-none cursor-pointer rounded-lg select-none font-sans active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[34px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[40px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 min-h-[48px] font-semibold'
  };

  const variantStyles = {
    primary: 'bg-[#5E6AD2] hover:bg-[#6872D9] text-[#EDEDEF] shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_0_1px_rgba(94,106,210,0.8),0_6px_20px_rgba(94,106,210,0.4),inset_0_1px_0_0_rgba(255,255,255,0.3)]',
    gradient: 'bg-gradient-to-r from-[#5E6AD2] via-indigo-500 to-[#5E6AD2] text-[#EDEDEF] shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_16px_rgba(94,106,210,0.35),inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:brightness-110',
    secondary: 'bg-white/[0.05] hover:bg-white/[0.08] text-[#EDEDEF] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]',
    outline: 'bg-transparent border border-white/[0.12] hover:border-white/[0.25] text-[#EDEDEF] hover:bg-white/[0.04]',
    ghost: 'bg-transparent text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05]',
    danger: 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]',
    dark: 'bg-[#0a0a0c] border border-white/[0.08] text-[#EDEDEF] hover:bg-[#121216] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span className="truncate">{children}</span>
      {!isLoading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
};
