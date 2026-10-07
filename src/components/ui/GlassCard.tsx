import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`relative w-full rounded-[32px] bg-[#0a0c14]/70 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden ${className}`}
    >
      {/* Subtle glass reflection highlight */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.04] via-transparent to-black/40 rounded-[32px]" />
      {children}
    </div>
  );
};
