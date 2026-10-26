import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl p-5 shadow-xs transition-all duration-200 ${
        hoverable ? 'hover:border-slate-300 hover:shadow-sm cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
