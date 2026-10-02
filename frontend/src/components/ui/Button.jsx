import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 hover:border-zinc-600',
  ghost: 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
  danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white',
  outline: 'border border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400'
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5'
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  id,
  fullWidth = false
}) {
  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 active:scale-95 select-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-4 h-4'} />
      )}
      {children}
      {!loading && IconRight && <IconRight className={size === 'xs' ? 'w-3 h-3' : 'w-4 h-4'} />}
    </button>
  );
}
