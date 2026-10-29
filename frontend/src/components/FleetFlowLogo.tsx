import React from 'react';

export interface FleetFlowLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'white' | 'compact' | 'horizontal';
  showTagline?: boolean;
  height?: number;
}

export const FleetFlowLogo: React.FC<FleetFlowLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
  showTagline = true,
  height,
}) => {
  const isCompact = variant === 'compact';
  const shouldShowTagline = isCompact ? false : showTagline;

  const dimensions = {
    sm: { icon: height || 28, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: height || 36, text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: height || 44, text: 'text-xl', sub: 'text-[11px]' },
    xl: { icon: height || 54, text: 'text-2xl', sub: 'text-[12px]' },
  }[size];

  const isLight = variant === 'light' || variant === 'compact' || variant === 'horizontal' || variant === 'white';
  const titleColor = isLight ? 'text-white' : 'text-[#0F172A]';
  const accentColor = 'text-[#A855F7]'; // Vibrant purple
  const taglineColor = isLight ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* FleetFlow Purple Gradient Monogram Emblem */}
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105 drop-shadow-md"
      >
        <defs>
          <linearGradient id="ffLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="88" height="88" rx="22" fill="url(#ffLogoGrad)" />
        <rect x="9" y="9" width="82" height="82" rx="19" stroke="#E9D5FF" strokeOpacity="0.4" strokeWidth="2.5" />
        {/* Dynamic Double F Monogram & Forward Flow */}
        <path d="M28 26 L28 74" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
        <path d="M28 28 L68 28" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
        <path d="M28 48 L58 48" stroke="#E9D5FF" strokeWidth="7" strokeLinecap="round" />
        <path d="M48 64 L68 46 L76 54 L56 72 Z" fill="#E9D5FF" fillOpacity="0.9" />
        <circle cx="72" cy="30" r="5" fill="#FFFFFF" />
      </svg>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight ${dimensions.text} ${titleColor} flex items-center`}>
          <span>Fleet</span>
          <span className={`${accentColor} font-extrabold ml-0.5`}>Flow</span>
        </div>
        {shouldShowTagline && (
          <span className={`font-bold tracking-widest uppercase mt-1 ${dimensions.sub} ${taglineColor}`}>
            Mobility Cloud SaaS
          </span>
        )}
      </div>
    </div>
  );
};

export default FleetFlowLogo;
