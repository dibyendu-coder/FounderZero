import React from 'react';

interface SectionBadgeProps {
  label: string;
  icon?: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'dark';
  className?: string;
}

export const SectionBadge: React.FC<SectionBadgeProps> = ({
  label,
  icon,
  variant = 'blue',
  className = ''
}) => {
  const styles = {
    blue: 'bg-[#000000] border-[#292d30] text-[#70b8ff]',
    emerald: 'bg-[#000000] border-[#292d30] text-[#3ad389]',
    amber: 'bg-[#000000] border-[#292d30] text-[#ffca16]',
    rose: 'bg-[#000000] border-[#292d30] text-[#ff9592]',
    dark: 'bg-[#000000] border-[#292d30] text-[#ffffff]'
  };

  const dotStyles = {
    blue: 'bg-[#70b8ff]',
    emerald: 'bg-[#3ad389]',
    amber: 'bg-[#ffca16]',
    rose: 'bg-[#ff9592]',
    dark: 'bg-[#9281f7]'
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-commit font-medium tracking-wide ${styles[variant]} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotStyles[variant]} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotStyles[variant]}`}></span>
      </span>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </div>
  );
};
