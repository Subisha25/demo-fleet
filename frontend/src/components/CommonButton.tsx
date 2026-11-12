import React from 'react';
import LoadingButton, { ButtonVariant, ButtonSize } from './LoadingButton';

export interface CommonButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  text?: string;
  children?: React.ReactNode;
  onClick?: (e?: any) => void | Promise<any>;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'custom'
    | 'darkblue'
    | 'navy'
    | 'clear'
    | 'info'
    | 'edit'
    | 'default'
    | 'outline'
    | 'ghost'
    | 'search';
  loading?: boolean;
  loadingText?: string;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

export const CommonButton: React.FC<CommonButtonProps> = ({
  text,
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  variant = 'primary',
  loading = false,
  loadingText,
  size = 'md',
  icon,
  ...props
}) => {
  // Normalize legacy variants
  let normalizedVariant: ButtonVariant = 'primary';
  if (variant === 'darkblue' || variant === 'navy') {
    normalizedVariant = 'dark';
  } else if (variant === 'custom' || variant === 'search') {
    normalizedVariant = 'primary';
  } else if (
    variant === 'primary' ||
    variant === 'secondary' ||
    variant === 'outline' ||
    variant === 'danger' ||
    variant === 'success' ||
    variant === 'ghost' ||
    variant === 'clear' ||
    variant === 'info' ||
    variant === 'edit' ||
    variant === 'default'
  ) {
    normalizedVariant = variant;
  }

  return (
    <LoadingButton
      {...props}
      type={type}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      loadingText={loadingText}
      variant={normalizedVariant}
      size={size}
      icon={icon}
      text={text}
      className={className}
    >
      {children}
    </LoadingButton>
  );
};

export default CommonButton;
