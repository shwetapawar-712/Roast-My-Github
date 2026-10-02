import React from 'react';
import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';

export function ComparisonHero() {
  return (
    <section className="pt-6 pb-8 text-center">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-5 rounded-full border border-orange-500/25 bg-orange-500/10 text-orange-400 text-xs font-mono font-medium shadow-sm"
      >
        <Swords className="w-3.5 h-3.5 text-orange-400" />
        <span>EVIDENCE-BASED PROFILE BENCHMARK</span>
      </motion.div>

      {/* Main Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white mb-4"
      >
        ⚔️ GITHUB <span className="fire-text drop-shadow-[0_2px_12px_rgba(249,115,22,0.3)]">FACE-OFF</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg sm:text-xl font-medium text-zinc-200 max-w-2xl mx-auto mb-3"
      >
        “Compare two GitHub profiles using the same evidence-based audit.”
      </motion.p>

      {/* Supporting Text */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed"
      >
        Enter two public GitHub profile URLs and see how their documentation, activity, repository quality,
        presentation, and security hygiene differ.
      </motion.p>
    </section>
  );
}

export default ComparisonHero;
