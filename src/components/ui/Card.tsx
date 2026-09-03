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
    default: 'bg-[#000000] border border-[#292d30] text-[#f0f0f0] rounded-[16px] transition-colors',
    interactive: 'bg-[#000000] border border-[#292d30] hover:border-[#ffffff] transition-colors text-[#f0f0f0] rounded-[16px] cursor-pointer',
    inverted: 'bg-[#0b0e14] border border-[#292d30] text-[#ffffff] rounded-[16px]',
    flat: 'bg-[#000000] border border-[#292d30] text-[#f0f0f0] rounded-[16px]',
    bordered: 'bg-[#000000] border border-[#292d30] text-[#ffffff] rounded-[16px]'
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
  <div className={`space-y-1.5 pb-4 border-b border-[#292d30] ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-lg font-semibold tracking-tight text-[#ffffff] font-sans ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-[#a1a4a5] leading-relaxed font-sans ${className}`} {...props}>
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
  <div className={`pt-4 border-t border-[#292d30] flex items-center justify-between gap-3 ${className}`} {...props}>
    {children}
  </div>
);
