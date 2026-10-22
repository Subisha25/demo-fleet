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
  primary: 'bg-[#C04E24] hover:bg-[#A43D1A] text-white shadow-sm focus:ring-2 focus:ring-[#E9B195] focus:outline-none',
  secondary: 'bg-white hover:bg-[#FAF8F5] text-[#1C1A18] border border-[#E0DAD1] shadow-sm focus:ring-2 focus:ring-[#E0DAD1] focus:outline-none',
  navy: 'bg-[#1C1A18] hover:bg-[#262320] text-white shadow-sm focus:ring-2 focus:ring-[#45403C] focus:outline-none',
  darkblue: 'bg-[#1C1A18] hover:bg-[#262320] text-white shadow-sm focus:ring-2 focus:ring-[#45403C] focus:outline-none',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none',
  custom: 'bg-[#C04E24] hover:bg-[#A43D1A] text-white shadow-sm focus:ring-2 focus:ring-[#E9B195] focus:outline-none',
  clear: 'bg-[#EDE9E3] hover:bg-[#E0DAD1] text-[#1C1A18] shadow-sm',
  info: 'bg-[#C04E24] hover:bg-[#A43D1A] text-white shadow-sm focus:ring-2 focus:ring-[#E9B195] focus:outline-none',
  edit: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm focus:ring-2 focus:ring-amber-400 focus:outline-none',
  default: 'bg-[#FAF8F5] hover:bg-[#EDE9E3] text-[#1C1A18] border border-[#E0DAD1] shadow-sm',
  outline: 'bg-transparent border border-[#C04E24] text-[#C04E24] hover:bg-[#FDF6F0] shadow-sm focus:ring-2 focus:ring-[#E9B195] focus:outline-none',
  search: 'bg-[#C04E24] hover:bg-[#A43D1A] text-white shadow-sm',
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