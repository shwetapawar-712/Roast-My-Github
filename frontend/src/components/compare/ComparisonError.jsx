import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function ComparisonError({ error, onRetry, onReset }) {
  const isProfile1 = error?.toLowerCase().includes('profile 1');
  const isProfile2 = error?.toLowerCase().includes('profile 2');

  return (
    <div className="w-full max-w-xl mx-auto my-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-2xl border border-red-500/30 p-6 sm:p-8 text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="font-heading font-bold text-lg text-white mb-2">
          Comparison Audit Could Not Complete
        </h3>

        <p className="text-xs sm:text-sm text-red-300 bg-red-500/10 p-3 rounded-xl border border-red-500/20 mb-6 font-mono leading-relaxed">
          {error || 'An unexpected error occurred while analyzing the profiles.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <Button
              variant="primary"
              size="md"
              icon={RefreshCw}
              onClick={onRetry}
              className="w-full sm:w-auto"
            >
              Retry Comparison
            </Button>
          )}

          {onReset && (
            <Button
              variant="secondary"
              size="md"
              icon={ArrowLeft}
              onClick={onReset}
              className="w-full sm:w-auto"
            >
              Edit Target URLs
            </Button>
          )}
        </div>

        <p className="text-[11px] text-zinc-500 font-mono mt-4">
          Ensure both profiles are public, exist on github.com, and have not hit rate limits.
        </p>
      </motion.div>
    </div>
  );
}

export default ComparisonError;
