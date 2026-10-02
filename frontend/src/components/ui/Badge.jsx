import React from 'react';
import { ShieldAlert, AlertTriangle, Sparkles, CheckCircle2, Info } from 'lucide-react';

export function Badge({ severity, children, className = '', showIcon = true, size = 'sm' }) {
  const getStyles = () => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/30 shadow-sm shadow-red-500/10',
          icon: ShieldAlert
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-sm shadow-amber-500/10',
          icon: AlertTriangle
        };
      case 'improvement':
        return {
          bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
          icon: Sparkles
        };
      case 'healthy':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2
        };
      case 'info':
      default:
        return {
          bg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          icon: Info
        };
    }
  };

  const { bg, icon: IconComponent } = getStyles();
  const sizeClasses = size === 'xs'
    ? 'px-1.5 py-0.5 text-[11px] gap-1'
    : size === 'md'
    ? 'px-3 py-1 text-sm gap-1.5'
    : 'px-2.5 py-0.5 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full uppercase tracking-wider ${sizeClasses} ${bg} ${className}`}
    >
      {showIcon && <IconComponent className={size === 'xs' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />}
      <span>{children || severity}</span>
    </span>
  );
}
