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
    blue: 'bg-blue-50/80 border-blue-200/80 text-blue-700 shadow-2xs',
    emerald: 'bg-emerald-50/80 border-emerald-200/80 text-emerald-700 shadow-2xs',
    amber: 'bg-amber-50/80 border-amber-200/80 text-amber-800 shadow-2xs',
    rose: 'bg-rose-50/80 border-rose-200/80 text-rose-700 shadow-2xs',
    dark: 'bg-slate-800/90 border-slate-700 text-slate-200 shadow-2xs'
  };

  const dotStyles = {
    blue: 'bg-[#0052FF]',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    dark: 'bg-blue-400'
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono font-bold uppercase tracking-wider backdrop-blur-xs ${styles[variant]} ${className}`}
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
