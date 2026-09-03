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
    blue: 'bg-[#5E6AD2]/10 text-indigo-300 border-[#5E6AD2]/30',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    indigo: 'bg-[#5E6AD2]/15 text-[#EDEDEF] border-[#5E6AD2]/40',
    neutral: 'bg-white/[0.04] text-[#8A8F98] border-white/[0.08]',
    dark: 'bg-[#0a0a0c] text-[#EDEDEF] border-white/[0.10]',
    outline: 'bg-transparent text-[#EDEDEF] border-white/[0.12]'
  };

  const dotColors = {
    blue: 'bg-indigo-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    indigo: 'bg-[#5E6AD2]',
    neutral: 'bg-[#8A8F98]',
    dark: 'bg-white',
    outline: 'bg-[#8A8F98]'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-full gap-1.5',
    md: 'text-xs px-2.5 py-1 font-medium rounded-full gap-1.5'
  };

  return (
    <span
      className={`inline-flex items-center border font-mono tracking-widest whitespace-nowrap select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      {children}
    </span>
  );
};
