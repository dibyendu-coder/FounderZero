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
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none cursor-pointer rounded-[6px] select-none font-sans';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[34px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[40px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 min-h-[48px] font-medium'
  };

  const variantStyles = {
    primary: 'bg-transparent border border-[#292d30] text-[#ffffff] hover:border-[#ffffff] hover:bg-white/5 active:bg-white/10',
    gradient: 'bg-[#ffffff] text-[#000000] hover:bg-[#f0f0f0] font-medium shadow-none',
    secondary: 'bg-[#000000] border border-[#292d30] text-[#f0f0f0] hover:text-[#ffffff] hover:border-[#ffffff]',
    outline: 'bg-transparent border border-[#292d30] text-[#f0f0f0] hover:text-[#ffffff] hover:border-[#ffffff]',
    ghost: 'bg-transparent border border-[#292d30] text-[#ffffff] hover:border-[#ffffff] hover:bg-white/5',
    danger: 'bg-[#000000] text-[#ff9592] border border-[#ff9592]/40 hover:border-[#ff9592]',
    dark: 'bg-[#000000] border border-[#292d30] text-[#ffffff] hover:border-[#ffffff]'
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
