import React from 'react';

interface CommonButtonProps {
  text?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'custom' | 'darkblue' | 'navy' | 'clear' | 'info' | 'edit' | 'default' | 'outline';
  loading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-sm focus:ring-2 focus:ring-purple-400 focus:outline-none',
  secondary: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm focus:ring-2 focus:ring-purple-400 focus:outline-none',
  navy: 'bg-[#0B0B0F] hover:bg-[#1A1A24] text-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none',
  darkblue: 'bg-[#0B0B0F] hover:bg-[#1A1A24] text-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none',
  custom: 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-sm focus:ring-2 focus:ring-purple-400 focus:outline-none',
  clear: 'bg-slate-100 hover:bg-slate-200 text-slate-800 shadow-sm',
  info: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none',
  edit: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm focus:ring-2 focus:ring-amber-400 focus:outline-none',
  default: 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-sm',
  outline: 'bg-transparent border border-purple-600 text-purple-700 hover:bg-purple-50 shadow-sm focus:ring-2 focus:ring-purple-400 focus:outline-none',
  search: 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-sm',
};

const CommonButton: React.FC<CommonButtonProps> = ({
  text,
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  variant = 'primary',
  loading = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 inline-flex items-center justify-center gap-2
        ${variantClasses[variant] || variantClasses.primary} 
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.99]'} 
        ${className}`}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          <span>Loading...</span>
        </>
      ) : (
        children ?? text
      )}
    </button>
  );
};

export default CommonButton;