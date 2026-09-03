import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'neutral' | 'dark' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    blue: 'bg-[#000000] text-[#70b8ff] border-[#292d30]',
    emerald: 'bg-[#000000] text-[#3ad389] border-[#292d30]',
    amber: 'bg-[#000000] text-[#ffca16] border-[#292d30]',
    rose: 'bg-[#000000] text-[#ff9592] border-[#292d30]',
    indigo: 'bg-[#000000] text-[#9281f7] border-[#292d30]',
    neutral: 'bg-[#000000] text-[#a1a4a5] border-[#292d30]',
    dark: 'bg-[#000000] text-[#ffffff] border-[#292d30]',
    outline: 'bg-transparent text-[#f0f0f0] border-[#292d30]'
  };

  const dotColors = {
    blue: 'bg-[#70b8ff]',
    emerald: 'bg-[#3ad389]',
    amber: 'bg-[#ffca16]',
    rose: 'bg-[#ff9592]',
    indigo: 'bg-[#9281f7]',
    neutral: 'bg-[#a1a4a5]',
    dark: 'bg-[#ffffff]',
    outline: 'bg-[#a1a4a5]'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-[6px] gap-1.5',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-[6px] gap-1.5'
  };

  return (
    <span
      className={`inline-flex items-center border font-commit whitespace-nowrap select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      {children}
    </span>
  );
};
