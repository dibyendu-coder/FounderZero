import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'inverted' | 'flat' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-gradient-to-b from-white/[0.07] to-white/[0.02] bg-[#0a0a0c] border border-white/[0.06] text-[#EDEDEF] rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] transition-all duration-200',
    interactive: 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] bg-[#0a0a0c] border border-white/[0.06] hover:border-white/[0.14] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)] transition-all duration-200 hover:-translate-y-1 text-[#EDEDEF] rounded-2xl cursor-pointer',
    inverted: 'bg-[#050506] border border-white/[0.08] text-[#EDEDEF] rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_30px_rgba(0,0,0,0.5)]',
    flat: 'bg-white/[0.03] border border-white/[0.05] text-[#EDEDEF] rounded-2xl',
    bordered: 'bg-[#0a0a0c] border border-[#5E6AD2]/30 text-[#EDEDEF] rounded-2xl shadow-[0_0_0_1px_rgba(94,106,210,0.2),0_4px_24px_rgba(94,106,210,0.1)]'
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`space-y-1.5 pb-4 border-b border-white/[0.06] ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-lg font-semibold tracking-tight text-[#EDEDEF] font-sans ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-[#8A8F98] leading-relaxed font-sans ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`pt-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3 ${className}`} {...props}>
    {children}
  </div>
);
