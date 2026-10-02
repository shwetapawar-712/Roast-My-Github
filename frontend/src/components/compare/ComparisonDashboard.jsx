import React from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink, Users, Globe, Clock, Swords,
  RefreshCw, ArrowLeft, Share2, Copy, Check
} from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { FaceOffSummary } from './FaceOffSummary.jsx';
import { CategoryComparison } from './CategoryComparison.jsx';
import { ProfileSnapshot } from './ProfileSnapshot.jsx';
import { StrengthsComparison } from './StrengthsComparison.jsx';
import { FindingsComparison } from './FindingsComparison.jsx';
import { CompareRoastSection } from './CompareRoastSection.jsx';

export function ComparisonDashboard({
  audit1,
  audit2,
  onNewComparison
}) {
  const [copied, setCopied] = React.useState(false);

  const p1 = audit1?.profile || {};
  const p2 = audit2?.profile || {};

  const name1 = p1.name || p1.username || 'Profile 1';
  const name2 = p2.name || p2.username || 'Profile 2';

  const score1 = audit1?.overallScore;
  const score2 = audit2?.overallScore;

  const isNA1 = score1 === null || score1 === undefined;
  const isNA2 = score2 === null || score2 === undefined;

  const handleShare = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('u1', p1.username || '');
      url.searchParams.set('u2', p2.username || '');
      navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Could not copy link', e);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-16">

      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-mono font-bold mb-2">
            <Swords className="w-3.5 h-3.5" />
            <span>DETERMINISTIC BENCHMARK</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
            ⚔️ PROFILE FACE-OFF
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Auditing and comparing factual GitHub evidence for two public developer profiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={copied ? Check : Share2}
            onClick={handleShare}
            className="text-xs"
          >
            {copied ? 'Link Copied!' : 'Share Face-Off'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={RefreshCw}
            onClick={onNewComparison}
            className="text-xs"
          >
            New Comparison
          </Button>
        </div>
      </div>

      {/* Side-by-Side Contender Identity Banner */}
      <div className="glass-panel rounded-2xl border border-zinc-800 p-5 sm:p-7 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">

          {/* VS Center Divider (Desktop) */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 items-center justify-center font-heading font-black text-xs text-orange-500 shadow-xl">
            VS
          </div>

          {/* PROFILE 1 IDENTITY */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/40 border border-orange-500/20">
            <img
              src={p1.avatarUrl}
              alt={p1.username}
              className="w-16 h-16 rounded-2xl ring-2 ring-orange-500/40 object-cover bg-zinc-900 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  Profile 1
                </span>
                <h3 className="font-heading font-bold text-lg text-white truncate">{name1}</h3>
                {p1.htmlUrl && (
                  <a
                    href={p1.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-orange-400 transition-colors"
                    title="View GitHub Profile"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-zinc-500 text-xs font-mono">@{p1.username}</p>

              {p1.bio && (
                <p className="text-zinc-300 text-xs mt-2 line-clamp-2 italic">
                  "{p1.bio}"
                </p>
              )}

              <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-zinc-500">
                <span>{p1.followers?.toLocaleString() || 0} followers</span>
                <span>·</span>
                <span>Score: <strong className={isNA1 ? 'text-zinc-500' : 'text-orange-400'}>{isNA1 ? 'N/A' : `${score1}/100`}</strong></span>
              </div>
            </div>
          </div>

          {/* PROFILE 2 IDENTITY */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/40 border border-violet-500/20">
            <img
              src={p2.avatarUrl}
              alt={p2.username}
              className="w-16 h-16 rounded-2xl ring-2 ring-violet-500/40 object-cover bg-zinc-900 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  Profile 2
                </span>
                <h3 className="font-heading font-bold text-lg text-white truncate">{name2}</h3>
                {p2.htmlUrl && (
                  <a
                    href={p2.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-violet-400 transition-colors"
                    title="View GitHub Profile"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-zinc-500 text-xs font-mono">@{p2.username}</p>

              {p2.bio && (
                <p className="text-zinc-300 text-xs mt-2 line-clamp-2 italic">
                  "{p2.bio}"
                </p>
              )}

              <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-zinc-500">
                <span>{p2.followers?.toLocaleString() || 0} followers</span>
                <span>·</span>
                <span>Score: <strong className={isNA2 ? 'text-zinc-500' : 'text-violet-400'}>{isNA2 ? 'N/A' : `${score2}/100`}</strong></span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 1. CREATIVE FACE-OFF HIGHLIGHTS */}
      <FaceOffSummary audit1={audit1} audit2={audit2} />

      {/* 2. CATEGORY COMPARISON & DIFFERENCE BARS */}
      <CategoryComparison
        categoryScores1={audit1?.categoryScores || []}
        categoryScores2={audit2?.categoryScores || []}
        profile1Name={name1}
        profile2Name={name2}
      />

      {/* 3. FACTUAL PROFILE SNAPSHOT TABLE */}
      <ProfileSnapshot audit1={audit1} audit2={audit2} />

      {/* 4. VERIFIED STRENGTHS & OPPORTUNITIES */}
      <StrengthsComparison audit1={audit1} audit2={audit2} />

      {/* 5. DETAILED FINDINGS COMPARISON */}
      <FindingsComparison audit1={audit1} audit2={audit2} />

      {/* 6. AI ROAST SECTION */}
      <CompareRoastSection audit1={audit1} audit2={audit2} />

      {/* Bottom return action */}
      <div className="text-center pt-8 border-t border-zinc-800/80">
        <Button
          variant="secondary"
          size="md"
          icon={ArrowLeft}
          onClick={onNewComparison}
          className="cursor-pointer"
        >
          Compare Another Pair
        </Button>
      </div>

    </div>
  );
}

export default ComparisonDashboard;
