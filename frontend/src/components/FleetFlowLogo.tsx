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
  const accentColor = isLight ? 'text-[#38BDF8]' : 'text-[#0284C7]';
  const taglineColor = isLight ? 'text-[#94A3B8]' : 'text-[#64748B]';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* FleetFlow Dynamic Fleet Monogram Emblem */}
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <rect x="6" y="6" width="88" height="88" rx="22" fill="#0F766E" />
        <rect x="9" y="9" width="82" height="82" rx="19" stroke="#CCFBF1" strokeOpacity="0.3" strokeWidth="2.5" />
        {/* Dynamic Double F Monogram & Forward Flow */}
        <path d="M28 26 L28 74" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
        <path d="M28 28 L68 28" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
        <path d="M28 48 L56 48" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" />
        <path d="M48 64 L68 46 L76 54 L56 72 Z" fill="#38BDF8" fillOpacity="0.9" />
        <circle cx="72" cy="30" r="5" fill="#F0FDFA" />
      </svg>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight ${dimensions.text} ${titleColor} flex items-center`}>
          <span>Fleet</span>
          <span className={`${accentColor} font-extrabold`}>Flow</span>
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
