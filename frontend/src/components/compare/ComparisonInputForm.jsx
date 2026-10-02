import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Swords, AlertTriangle, Lock, Sparkles } from 'lucide-react';
import { Github } from '../ui/GithubIcon.jsx';
import { Button } from '../ui/Button.jsx';

const SAMPLE_PAIRS = [
  { label: 'torvalds vs gaearon', u1: 'https://github.com/torvalds', u2: 'https://github.com/gaearon' },
  { label: 'shadcn vs leerob', u1: 'https://github.com/shadcn', u2: 'https://github.com/leerob' },
  { label: 'octocat vs defunkt', u1: 'https://github.com/octocat', u2: 'https://github.com/defunkt' }
];

export function validateGitHubUrl(val, profileNumber) {
  const trimmed = (val || '').trim();
  if (!trimmed) {
    return `Profile ${profileNumber}: Please enter a public GitHub URL (e.g. https://github.com/username).`;
  }
  if (trimmed.includes('://') && !trimmed.toLowerCase().includes('github.com')) {
    return `Profile ${profileNumber}: Only public GitHub URLs are supported (e.g. https://github.com/username).`;
  }
  return '';
}

export function ComparisonInputForm({
  url1,
  url2,
  setUrl1,
  setUrl2,
  onCompare,
  isLoading,
  initialErrors = {}
}) {
  const [error1, setError1] = useState(initialErrors.profile1 || '');
  const [error2, setError2] = useState(initialErrors.profile2 || '');

  const handleUrl1Change = (e) => {
    setUrl1(e.target.value);
    if (error1) setError1('');
  };

  const handleUrl2Change = (e) => {
    setUrl2(e.target.value);
    if (error2) setError2('');
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    const err1 = validateGitHubUrl(url1, 1);
    const err2 = validateGitHubUrl(url2, 2);

    setError1(err1);
    setError2(err2);

    if (err1 || err2) return;

    onCompare(url1.trim(), url2.trim());
  };

  const handleSelectSample = (sample) => {
    if (isLoading) return;
    setUrl1(sample.u1);
    setUrl2(sample.u2);
    setError1('');
    setError2('');
    onCompare(sample.u1, sample.u2);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-10">
      <form onSubmit={handleSubmit} noValidate>
        {/* Two side-by-side cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">

          {/* LEFT: PROFILE 1 */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className={`
              glass-panel rounded-2xl p-5 sm:p-6 border transition-all duration-200
              ${error1 ? 'border-red-500/50 shadow-[0_0_20px_-5px_rgba(239,68,68,0.25)]' : 'border-zinc-800 hover:border-zinc-700/80'}
            `}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-heading font-bold text-sm text-orange-400 tracking-wider">
                  👤 PROFILE 1
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                Primary Contender
              </span>
            </div>

            <label htmlFor="profile1-url-input" className="block text-xs font-medium text-zinc-300 mb-2">
              GitHub Profile URL
            </label>

            <div className="relative flex items-center rounded-xl bg-zinc-950/80 border border-zinc-800 focus-within:border-orange-500/60 focus-within:ring-1 focus-within:ring-orange-500/30 transition-all">
              <div className="pl-3.5 pr-1 text-zinc-500">
                <Github className="w-4 h-4" />
              </div>
              <input
                id="profile1-url-input"
                type="text"
                value={url1}
                onChange={handleUrl1Change}
                disabled={isLoading}
                placeholder="https://github.com/username"
                autoComplete="off"
                spellCheck="false"
                className="w-full bg-transparent text-white placeholder:text-zinc-600 text-xs sm:text-sm font-mono py-3 px-2 outline-none"
                aria-label="Profile 1 GitHub URL"
                aria-describedby={error1 ? 'profile1-error' : undefined}
              />
            </div>

            <AnimatePresence>
              {error1 && (
                <motion.div
                  id="profile1-error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-2.5 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span>{error1}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* RIGHT: PROFILE 2 */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className={`
              glass-panel rounded-2xl p-5 sm:p-6 border transition-all duration-200
              ${error2 ? 'border-red-500/50 shadow-[0_0_20px_-5px_rgba(239,68,68,0.25)]' : 'border-zinc-800 hover:border-zinc-700/80'}
            `}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-heading font-bold text-sm text-violet-400 tracking-wider">
                  👤 PROFILE 2
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                Opponent Benchmark
              </span>
            </div>

            <label htmlFor="profile2-url-input" className="block text-xs font-medium text-zinc-300 mb-2">
              GitHub Profile URL
            </label>

            <div className="relative flex items-center rounded-xl bg-zinc-950/80 border border-zinc-800 focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
              <div className="pl-3.5 pr-1 text-zinc-500">
                <Github className="w-4 h-4" />
              </div>
              <input
                id="profile2-url-input"
                type="text"
                value={url2}
                onChange={handleUrl2Change}
                disabled={isLoading}
                placeholder="https://github.com/username"
                autoComplete="off"
                spellCheck="false"
                className="w-full bg-transparent text-white placeholder:text-zinc-600 text-xs sm:text-sm font-mono py-3 px-2 outline-none"
                aria-label="Profile 2 GitHub URL"
                aria-describedby={error2 ? 'profile2-error' : undefined}
              />
            </div>

            <AnimatePresence>
              {error2 && (
                <motion.div
                  id="profile2-error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-2.5 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span>{error2}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>

        {/* Action Button & Helper */}
        <div className="text-center">
          <Button
            type="submit"
            size="lg"
            id="compare-profiles-cta"
            icon={isLoading ? undefined : Swords}
            loading={isLoading}
            disabled={isLoading || !url1.trim() || !url2.trim()}
            className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 font-heading font-bold text-base shadow-lg shadow-orange-500/20 cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {isLoading ? 'Benchmarking Both Profiles...' : '⚔️ COMPARE PROFILES'}
          </Button>

          <p className="text-zinc-500 text-xs mt-3 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            Public GitHub profiles only. No GitHub login required.
          </p>

          {/* Preset Sample Pairs */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 mt-4">
            <span className="font-mono text-zinc-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-400" /> Quick face-offs:
            </span>
            {SAMPLE_PAIRS.map((pair) => (
              <button
                key={pair.label}
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectSample(pair)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {pair.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

export default ComparisonInputForm;
