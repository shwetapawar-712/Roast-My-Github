import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BarChart3, Swords, CheckCircle2, User } from 'lucide-react';

const REVEAL_STEPS = [
  { id: 'profiles', label: 'GitHub Profiles', icon: User, color: 'text-zinc-300' },
  { id: 'auditing', label: '🔍 AUDITING', icon: Search, color: 'text-blue-400' },
  { id: 'comparing', label: '📊 COMPARING', icon: BarChart3, color: 'text-violet-400' },
  { id: 'faceoff', label: '⚔️ FACE-OFF', icon: Swords, color: 'text-orange-400' }
];

export function ComparisonRevealAnimation({
  profile1,
  profile2,
  onComplete
}) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) {
      // Immediate completion if reduced motion is requested
      onComplete?.();
      return;
    }

    const timer1 = setTimeout(() => setCurrentStep(1), 250);
    const timer2 = setTimeout(() => setCurrentStep(2), 550);
    const timer3 = setTimeout(() => setCurrentStep(3), 850);
    const finishTimer = setTimeout(() => {
      onComplete?.();
    }, 1300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div className="w-full max-w-3xl mx-auto my-8 px-4 text-center">
      {/* Transformation Pipeline Sequence */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
        {REVEAL_STEPS.map((step, idx) => {
          const isActive = idx <= currentStep;
          const isCurrent = idx === currentStep;

          return (
            <React.Fragment key={step.id}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0.4 }}
                animate={{
                  scale: isCurrent ? 1.08 : isActive ? 1 : 0.9,
                  opacity: isActive ? 1 : 0.4
                }}
                transition={{ duration: 0.2 }}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold
                  ${isCurrent ? 'bg-orange-500/15 border-orange-500/40 text-orange-300 shadow-md shadow-orange-500/10' : ''}
                  ${isActive && !isCurrent ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : ''}
                  ${!isActive ? 'bg-zinc-950/40 border-zinc-900 text-zinc-600' : ''}
                `}
              >
                <span>{step.label}</span>
              </motion.div>

              {idx < REVEAL_STEPS.length - 1 && (
                <span className={`text-xs font-mono ${idx < currentStep ? 'text-orange-500' : 'text-zinc-700'}`}>
                  →
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Opposing profile cards entering from left and right */}
      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
        {/* Left card entering from left */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel p-4 rounded-2xl border border-orange-500/20 text-center"
        >
          <img
            src={profile1?.avatarUrl}
            alt={profile1?.username}
            className="w-16 h-16 rounded-full mx-auto mb-2.5 ring-2 ring-orange-500/40 object-cover bg-zinc-900"
          />
          <h4 className="font-heading font-bold text-white text-sm truncate">
            {profile1?.name || profile1?.username}
          </h4>
          <p className="text-zinc-500 text-xs font-mono">@{profile1?.username}</p>
        </motion.div>

        {/* Right card entering from right */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel p-4 rounded-2xl border border-violet-500/20 text-center"
        >
          <img
            src={profile2?.avatarUrl}
            alt={profile2?.username}
            className="w-16 h-16 rounded-full mx-auto mb-2.5 ring-2 ring-violet-500/40 object-cover bg-zinc-900"
          />
          <h4 className="font-heading font-bold text-white text-sm truncate">
            {profile2?.name || profile2?.username}
          </h4>
          <p className="text-zinc-500 text-xs font-mono">@{profile2?.username}</p>
        </motion.div>
      </div>

      <p className="text-zinc-500 text-xs mt-4 font-mono">
        Audit evidence synchronized. Assembling comparison view...
      </p>
    </div>
  );
}

export default ComparisonRevealAnimation;
