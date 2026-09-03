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
    blue: 'bg-[#5E6AD2]/10 border-[#5E6AD2]/30 text-indigo-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    rose: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    dark: 'bg-white/[0.05] border-white/10 text-[#EDEDEF]'
  };

  const dotStyles = {
    blue: 'bg-[#5E6AD2]',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    dark: 'bg-[#5E6AD2]'
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono tracking-widest uppercase ${styles[variant]} ${className}`}
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
