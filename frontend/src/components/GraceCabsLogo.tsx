import React from 'react';

interface GraceCabsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'white' | 'compact' | 'horizontal';
  showTagline?: boolean;
  height?: number;
}

export const GraceCabsLogo: React.FC<GraceCabsLogoProps> = ({
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

  // Palette: Terracotta #C04E24, Charcoal #1C1A18, Warm Cream #FAF8F5
  const isLight = variant === 'light' || variant === 'compact' || variant === 'horizontal' || variant === 'white';
  const isDark = variant === 'dark';

  const titleColor = isLight ? 'text-white' : 'text-[#1C1A18]';
  const taglineColor = isLight ? 'text-[#E9B195]' : 'text-[#C04E24]';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* SVG Mobility Icon */}
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        {/* Rounded Diamond/Shield Badge Background */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="22"
          fill="#C04E24"
        />
        <rect
          x="9"
          y="9"
          width="82"
          height="82"
          rx="19"
          stroke="#FAF8F5"
          strokeOpacity="0.25"
          strokeWidth="3"
        />

        {/* Dynamic Road / Highway Arc representing Mobility */}
        <path
          d="M26 72 C 34 40, 66 40, 74 72"
          stroke="#FAF8F5"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M36 72 C 42 54, 58 54, 64 72"
          stroke="#FAF8F5"
          strokeWidth="4"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />

        {/* Intertwined Stylized 'G' Monogram Header */}
        <path
          d="M68 34 C 64 26, 46 24, 36 34 C 26 44, 28 60, 42 64 C 54 67, 65 60, 65 52 L 48 52"
          stroke="#FFFFFF"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Location / Dispatcher Pin Spark */}
        <circle cx="68" cy="30" r="5" fill="#FAF8F5" />
      </svg>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight ${dimensions.text} ${titleColor} flex items-center gap-1`}>
          <span>GRACE</span>
          <span className="text-[#C04E24] font-extrabold">CABS</span>
        </div>
        {showTagline && (
          <span className={`font-bold tracking-widest uppercase mt-1 ${dimensions.sub} ${taglineColor}`}>
            Mobility & Fleet SaaS
          </span>
        )}
      </div>
    </div>
  );
};

export default GraceCabsLogo;
