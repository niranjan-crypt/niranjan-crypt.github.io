import React from 'react';

interface PillBadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'spec';
  dot?: boolean;
}

export const PillBadge: React.FC<PillBadgeProps> = ({ label, variant = 'primary', dot = false }) => {
  if (variant === 'primary') {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#120f24]/80 border border-[#a855f7]/30 text-[#d8b4fe] text-xs font-mono font-medium tracking-wider uppercase">
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] animate-pulse" />}
        <span>{label}</span>
      </div>
    );
  }

  if (variant === 'secondary') {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#1e2230]/70 border border-white/10 text-[#94a3b8] text-xs font-medium tracking-wide">
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-2.5 rounded-xl bg-[#090d16]/90 border border-white/10 font-mono text-xs text-[#94a3b8] leading-relaxed">
      {label}
    </div>
  );
};
