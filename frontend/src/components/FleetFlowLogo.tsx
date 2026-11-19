import React from 'react';
import cabzLogoAsset from '../images/cabz_logo.png';

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
  const isDarkBackground = variant === 'light' || variant === 'white';

  const heightClass = {
    sm: 'h-7 sm:h-8',
    md: 'h-9 sm:h-10',
    lg: 'h-11 sm:h-12',
    xl: 'h-14 sm:h-16',
  }[size] || 'h-9 sm:h-10';

  const logoSrc = cabzLogoAsset || '/images/cabz_logo.png';

  const imageElement = (
    <img
      src={logoSrc}
      alt="CABZ – Smart Fleet Mobility"
      style={height ? { height: `${height}px`, width: 'auto' } : undefined}
      className={`${!height ? heightClass : ''} w-auto object-contain select-none transition-transform duration-200 hover:scale-[1.02] drop-shadow-xs`}
    />
  );

  if (isDarkBackground) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white/95 px-2.5 py-1 rounded-xl shadow-sm border border-white/20 select-none ${className}`}
        title="CABZ – Smart Fleet Mobility"
      >
        {imageElement}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      title="CABZ – Smart Fleet Mobility"
    >
      {imageElement}
    </div>
  );
};

export default FleetFlowLogo;
