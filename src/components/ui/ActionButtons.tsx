import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface ActionButtonsProps {
  exploreLink?: string;
  codeLink?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  exploreLink = "#",
  codeLink = "https://github.com/niranjan-crypt"
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4 pt-2">
      <a
        href={exploreLink}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#ffffff] text-[#030509] font-medium text-sm transition-all duration-300 hover:bg-[#e2e8f0] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(255,255,255,0.25)] group"
      >
        <span>Explore Project</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </a>
      <a
        href={codeLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0a0f1d]/80 border border-white/15 text-[#f1f5f9] font-medium text-sm transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:-translate-y-0.5"
      >
        <span>Code Repository</span>
        <ArrowUpRight className="w-4 h-4 text-[#94a3b8] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </div>
  );
};
