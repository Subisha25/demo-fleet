import React, { useRef } from 'react';
import { showToast } from './AlertBox';

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

// Helper to extract plain text recursively from React nodes
function extractButtonText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractButtonText).join(' ');
  if (React.isValidElement(node) && (node.props as any)?.children) {
    return extractButtonText((node.props as any).children);
  }
  return '';
}

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

  const isDemo = typeof window !== 'undefined' && (
    localStorage.getItem('isDemoView') === 'true' ||
    localStorage.getItem('isDemoMode') === 'true' ||
    localStorage.getItem('role') === 'demo'
  );

  const rawButtonText = (typeof text === 'string' ? text : '') ||
    extractButtonText(children) ||
    (props['aria-label'] as string) ||
    (props.title as string) ||
    '';

  const pathname = typeof window !== 'undefined' ? (window.location.pathname || '').toLowerCase() : '';
  const isAuthOrPublicRoute = /^\/(login|adminlogin|forgetpasword|activate|register-fleet|company)/.test(pathname) || pathname.includes('/login');

  const isAuthAction = /^(sign in|login|log in|authenticate|reset password|forgot password|send otp|verify otp|update password|activate account|start free trial|start 7-day|exit demo|register)/i.test(rawButtonText.trim());
  const isModalDismiss = /^(cancel|close|dismiss|back|exit|no|view|view details|inspect|filter|search)/i.test(rawButtonText.trim());
  const isDemoControl = /^(exit demo|register|start free trial|start 7-day)/i.test(rawButtonText.trim());

  // Demo operational mutate action is ONLY applied inside authenticated demo preview workspace,
  // NEVER on public/auth routes (login, forgot password, register, etc.) and NEVER on auth actions (Sign In, Log In, etc.)
  // Complete list of mutate keywords as mandated: Add, Create, Save, Submit, Update, Edit, Delete, Cancel Booking, Assign Driver, Change Status, Approve, Reject, Confirm, Close Trip, Generate Invoice, Process Payment, Upload, Import, Export, and form submit.
  const isMutateAction = !isAuthOrPublicRoute && !isAuthAction && isDemo && !isModalDismiss && !isDemoControl && (
    /^(add|create|new|save|submit|update|edit|delete|remove|cancel booking|cancel order|assign|change status|approve|reject|confirm|close trip|close order|close pending|generate invoice|invoice|process payment|record payment|make payment|upload|import|export|dispatch|terminate|suspend|activate)/i.test(rawButtonText.trim()) ||
    type === 'submit' ||
    variant === 'danger' ||
    variant === 'edit'
  );

  const isActuallyDisabled = disabled || loading || isMutateAction;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isMutateAction) {
      e.preventDefault();
      e.stopPropagation();
      showToast('Demo Preview is read-only. This action is unavailable.', 'warn');
      return;
    }

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
      title={isMutateAction ? 'Demo Preview is read-only. This action is unavailable.' : props.title}
      aria-busy={loading}
      aria-disabled={isActuallyDisabled}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 select-none
        ${sizeStyles[size]}
        ${variantStyles[variant] || variantStyles.primary}
        ${
          isActuallyDisabled
            ? 'opacity-50 cursor-not-allowed transform-none shadow-none pointer-events-auto'
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
