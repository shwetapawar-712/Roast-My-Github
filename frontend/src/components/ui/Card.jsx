import React from 'react';

export function Card({ children, className = '', glow = false, hover = false, padding = true }) {
  return (
    <div className={`
      glass-panel rounded-2xl
      ${padding ? 'p-6' : ''}
      ${hover ? 'glass-panel-hover cursor-pointer' : ''}
      ${glow ? 'neon-glow-orange' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, icon: Icon, className = '' }) {
  return (
    <h3 className={`font-heading font-semibold text-zinc-100 flex items-center gap-2 ${className}`}>
      {Icon && <Icon className="w-4 h-4 text-orange-400 shrink-0" />}
      {children}
    </h3>
  );
}
