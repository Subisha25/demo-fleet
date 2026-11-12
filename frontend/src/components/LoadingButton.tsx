import React, { useRef } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'success'
  | 'dark'
  | 'navy'
  | 'ghost'
  | 'clear'
  | 'info'
  | 'edit'
  | 'default';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface LoadingButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  loading?: boolean;
  loadingText?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  text?: string;
  autoLockMs?: number;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<any>;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-sm focus:ring-2 focus:ring-purple-400 focus:outline-none border border-transparent',
  secondary:
    'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-2 focus:ring-purple-300 focus:outline-none',
  outline:
    'bg-transparent border border-purple-600 text-purple-700 hover:bg-purple-50 focus:ring-2 focus:ring-purple-400 focus:outline-none',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none border border-transparent',
  success:
    'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none border border-transparent',
  dark:
    'bg-[#0B0B0F] hover:bg-[#1A1A24] text-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none border border-slate-800',
  navy:
    'bg-[#0B0B0F] hover:bg-[#1A1A24] text-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none border border-slate-800',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-2 focus:ring-slate-300 focus:outline-none',
  clear:
    'bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm border border-slate-200',
  info:
    'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none',
  edit:
    'bg-amber-600 hover:bg-amber-700 text-white shadow-sm focus:ring-2 focus:ring-amber-400 focus:outline-none',
  default:
    'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-md gap-1.5',
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-2',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-base font-bold rounded-xl gap-2.5',
};

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon,
  text,
  children,
  onClick,
  className = '',
  type = 'button',
  autoLockMs = 350,
  ...props
}) => {
  const isLockedRef = useRef(false);

  const isActuallyDisabled = disabled || loading;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Synchronous double-click guard
    if (isActuallyDisabled || isLockedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (onClick) {
      isLockedRef.current = true;
      try {
        await Promise.resolve(onClick(e));
      } finally {
        setTimeout(() => {
          isLockedRef.current = false;
        }, autoLockMs);
      }
    }
  };

  return (
    <button
      {...props}
      type={type}
      disabled={isActuallyDisabled}
      onClick={handleClick}
      aria-busy={loading}
      aria-disabled={isActuallyDisabled}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 select-none
        ${sizeStyles[size]}
        ${variantStyles[variant] || variantStyles.primary}
        ${
          isActuallyDisabled
            ? 'opacity-60 cursor-not-allowed transform-none shadow-none pointer-events-none'
            : 'active:scale-[0.98] hover:shadow-md'
        }
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 shrink-0 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="truncate">{loadingText || 'Processing...'}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children ?? text}</span>
        </>
      )}
    </button>
  );
};

export default LoadingButton;
