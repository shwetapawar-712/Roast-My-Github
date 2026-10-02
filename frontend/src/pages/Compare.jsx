import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ArrowLeft, Swords } from 'lucide-react';
import { analyzeTarget } from '../api/client.js';
import { ComparisonHero } from '../components/compare/ComparisonHero.jsx';
import { ComparisonInputForm } from '../components/compare/ComparisonInputForm.jsx';
import { ComparisonLoading } from '../components/compare/ComparisonLoading.jsx';
import { ComparisonRevealAnimation } from '../components/compare/ComparisonRevealAnimation.jsx';
import { ComparisonDashboard } from '../components/compare/ComparisonDashboard.jsx';
import { ComparisonError } from '../components/compare/ComparisonError.jsx';

export default function Compare() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialU1 = searchParams.get('u1') || '';
  const initialU2 = searchParams.get('u2') || '';

  const [url1, setUrl1] = useState(initialU1);
  const [url2, setUrl2] = useState(initialU2);

  // States: 'idle' | 'loading' | 'revealing' | 'results' | 'error'
  const [status, setStatus] = useState('idle');
  const [audit1, setAudit1] = useState(null);
  const [audit2, setAudit2] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-compare if query params are present on first mount
  useEffect(() => {
    if (initialU1 && initialU2 && status === 'idle') {
      executeComparison(initialU1, initialU2);
    }
  }, []);

  const executeComparison = async (targetUrl1, targetUrl2) => {
    setStatus('loading');
    setErrorMessage('');

    // Update query params for shareability
    setSearchParams({
      u1: targetUrl1.replace(/^https?:\/\/github\.com\//i, ''),
      u2: targetUrl2.replace(/^https?:\/\/github\.com\//i, '')
    });

    try {
      // Execute parallel audit using existing analyzeTarget endpoint
      const [res1, res2] = await Promise.allSettled([
        analyzeTarget(targetUrl1, 'brutal'),
        analyzeTarget(targetUrl2, 'brutal')
      ]);

      if (res1.status === 'rejected' && res2.status === 'rejected') {
        const msg1 = res1.reason?.message || 'Failed to fetch Profile 1';
        const msg2 = res2.reason?.message || 'Failed to fetch Profile 2';
        setErrorMessage(`Profile 1 Error: ${msg1}\nProfile 2 Error: ${msg2}`);
        setStatus('error');
        return;
      }

      if (res1.status === 'rejected') {
        const msg = res1.reason?.message || 'Could not analyze profile.';
        setErrorMessage(`Profile 1 could not be analyzed: ${msg} Please verify the GitHub URL.`);
        setStatus('error');
        return;
      }

      if (res2.status === 'rejected') {
        const msg = res2.reason?.message || 'Could not analyze profile.';
        setErrorMessage(`Profile 2 could not be analyzed: ${msg} Please verify the GitHub URL.`);
        setStatus('error');
        return;
      }

      // Both succeeded
      setAudit1(res1.value);
      setAudit2(res2.value);
      setStatus('revealing');
    } catch (err) {
      console.error('Comparison error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while analyzing the GitHub targets.');
      setStatus('error');
    }
  };

  const handleRevealComplete = () => {
    setStatus('results');
  };

  const handleNewComparison = () => {
    setStatus('idle');
    setAudit1(null);
    setAudit2(null);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden text-zinc-100 selection:bg-orange-500/30 selection:text-orange-200">

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[700px] h-[350px] bg-orange-600/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-[700px] h-[350px] bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation Bar */}
        <nav className="flex items-center justify-between py-6 border-b border-zinc-800/80 mb-6">
          <div className="flex items-center gap-4">
            {/* Clearly Visible Back to Roast My GitHub Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              title="Return to single profile roast"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to Roast My GitHub</span>
            </button>

            <Link to="/" className="flex items-center gap-2 group cursor-pointer">
              <Flame className="w-5 h-5 text-orange-500 group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] transition-all" />
              <span className="font-heading font-bold text-base text-white tracking-tight hidden sm:inline">
                ROAST MY GITHUB
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono font-bold">
              <Swords className="w-3.5 h-3.5" />
              Face-Off Mode
            </span>
          </div>
        </nav>

        {/* Page Content based on status */}

        {/* 1. IDLE STATE: Hero + Two Inputs */}
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ComparisonHero />
            <ComparisonInputForm
              url1={url1}
              url2={url2}
              setUrl1={setUrl1}
              setUrl2={setUrl2}
              onCompare={executeComparison}
              isLoading={false}
            />
          </motion.div>
        )}

        {/* 2. LOADING STATE: 9 Stages Checklist */}
        {status === 'loading' && (
          <ComparisonLoading
            profile1Name={url1.replace(/^https?:\/\/github\.com\//i, '') || 'Profile 1'}
            profile2Name={url2.replace(/^https?:\/\/github\.com\//i, '') || 'Profile 2'}
          />
        )}

        {/* 3. REVEALING STATE: Lightweight visual transformation sequence */}
        {status === 'revealing' && (
          <ComparisonRevealAnimation
            profile1={audit1?.profile}
            profile2={audit2?.profile}
            onComplete={handleRevealComplete}
          />
        )}

        {/* 4. RESULTS STATE: Comparison Dashboard */}
        {status === 'results' && audit1 && audit2 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ComparisonDashboard
              audit1={audit1}
              audit2={audit2}
              onNewComparison={handleNewComparison}
            />
          </motion.div>
        )}

        {/* 5. ERROR STATE: Comparison Error Alert & Retry */}
        {status === 'error' && (
          <ComparisonError
            error={errorMessage}
            onRetry={() => executeComparison(url1, url2)}
            onReset={handleNewComparison}
          />
        )}

      </div>
    </div>
  );
}
