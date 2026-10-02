import React, { useEffect, useState, useRef } from 'react';

export function ProgressRing({
  score,
  size = 120,
  strokeWidth = 10,
  animate = true,
  label = null,
  showScore = true,
  colorOverride = null
}) {
  const isNumeric = typeof score === 'number' && !isNaN(score) && score !== null;
  const [displayScore, setDisplayScore] = useState(animate && isNumeric ? 0 : isNumeric ? score : 'N/A');
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const numericScore = isNumeric ? score : 0;

  const getColor = (s) => {
    if (colorOverride) return colorOverride;
    if (!isNumeric) return '#71717a'; // zinc-500 neutral
    if (s >= 80) return '#10b981'; // emerald
    if (s >= 60) return '#f59e0b'; // amber
    if (s >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const color = getColor(numericScore);

  useEffect(() => {
    if (!isNumeric) {
      setDisplayScore('N/A');
      return;
    }
    if (!animate) {
      setDisplayScore(numericScore);
      return;
    }
    let start = null;
    const duration = 1200;
    const raf = requestAnimationFrame(function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayScore(Math.round(eased * numericScore));
      if (p < 1) requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [numericScore, animate, isNumeric]);

  const strokeDashoffset = isNumeric
    ? circumference * (1 - (displayScore / 100))
    : circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: animate ? 'none' : 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {showScore && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading font-bold leading-none tabular-nums" style={{
            fontSize: size * 0.22,
            color,
            textShadow: `0 0 20px ${color}55`
          }}>
            {typeof score === 'number' ? displayScore : 'N/A'}
          </span>
          {label && (
            <span className="text-zinc-400 font-medium leading-tight text-center px-1"
              style={{ fontSize: size * 0.09, marginTop: 2 }}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
