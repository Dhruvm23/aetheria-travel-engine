'use client';

// ============================================================================
// ItineraryTimeline — Staggered timeline of days
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayCard } from './DayCard';
import { useAuth } from '@/components/auth/AuthContext';
import { Save, Send, Loader2 } from 'lucide-react';
import type { Itinerary, Activity, AccessibilityNeeds, ChangeRecord } from '@/types/itinerary';

interface ItineraryTimelineProps {
  itinerary: Itinerary;
  selectedActivityId: string | null;
  changesApplied?: ChangeRecord[];
  onSelectActivity: (activity: Activity) => void;
  onHoverActivity: (activityId: string | null) => void;
  onAnalyzeTerrain: (from: Activity, to: Activity) => void;
  accessibilityNeeds?: AccessibilityNeeds;
  tweakItinerary?: (prompt: string) => Promise<void>;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export function ItineraryTimeline({
  itinerary,
  selectedActivityId,
  changesApplied = [],
  onSelectActivity,
  onHoverActivity,
  onAnalyzeTerrain,
  accessibilityNeeds,
  tweakItinerary,
}: ItineraryTimelineProps) {
  const { user, openSignIn } = useAuth();
  const [tweakPrompt, setTweakPrompt] = useState('');
  const [isTweaking, setIsTweaking] = useState(false);

  const handleSave = () => {
    if (!user) {
      openSignIn();
      return;
    }
    localStorage.setItem(`aetheria_vault_${itinerary.id}`, JSON.stringify(itinerary));
    alert('Saved to your Aetheria Cloud Vault!');
  };

  const handleTweakSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweakPrompt.trim() || !tweakItinerary) return;
    setIsTweaking(true);
    await tweakItinerary(tweakPrompt);
    setIsTweaking(false);
    setTweakPrompt('');
  };

  // Build set of disrupted activity IDs from the changesApplied diff
  const disruptedIds = new Set(
    changesApplied
      .filter((c) => c.changeType === 'removed' || c.changeType === 'replaced')
      .map((c) => c.activityId)
  );

  return (
    <section aria-label={`Itinerary for ${itinerary.tripTitle}`}>
      {/* Trip header summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 p-4 glass-panel-strong rounded-2xl"
      >
        <h2 className="text-xl font-bold text-gradient-gold leading-tight">
          {itinerary.tripTitle}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {itinerary.destination}, {itinerary.country} · {itinerary.totalDays} days
        </p>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--accent-gold-subtle)] text-[var(--accent-gold)] font-semibold">
            {itinerary.totalEstimatedCost?.currency ?? 'USD'} {(itinerary.totalEstimatedCost?.amount ?? 0).toLocaleString()} total
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {itinerary.startDate ? new Date(itinerary.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
            {' — '}
            {itinerary.endDate ? new Date(itinerary.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
          </span>
          <button
            onClick={handleSave}
            className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
          >
            <Save size={14} />
            {user ? 'Save Itinerary' : 'Save (Login required)'}
          </button>
        </div>
      </motion.div>

      {/* Staggered day list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={itinerary.id}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
          role="list"
          aria-label="Itinerary days"
        >
          {itinerary.days.map((day, i) => (
            <motion.div key={day.dayNumber} variants={itemVariants} role="listitem">
              <DayCard
                day={day}
                isDefaultOpen={i === 0}
                selectedActivityId={selectedActivityId}
                disruptedActivityIds={disruptedIds}
                onSelectActivity={onSelectActivity}
                onHoverActivity={onHoverActivity}
                onAnalyzeTerrain={onAnalyzeTerrain}
                accessibilityNeeds={accessibilityNeeds}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Packing & phrases footer */}
      {itinerary.packingSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-6 glass-panel p-4 rounded-2xl"
          aria-label="Packing suggestions"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">
            🎒 Packing Essentials
          </h3>
          <div className="flex flex-wrap gap-2">
            {itinerary.packingSuggestions.map((item) => (
              <span
                key={item}
                className="text-xs px-2.5 py-1 rounded-full glass-panel border-white/10 text-[var(--text-secondary)]"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tweak Input */}
      {tweakItinerary && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-6"
        >
          <form onSubmit={handleTweakSubmit} className="relative">
            <input
              type="text"
              value={tweakPrompt}
              onChange={(e) => setTweakPrompt(e.target.value)}
              placeholder="Need to adjust something? Ask Aetheria..."
              disabled={isTweaking}
              className="w-full pl-4 pr-12 py-3 rounded-xl glass-panel text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={!tweakPrompt.trim() || isTweaking}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--accent-gold)] text-white hover:bg-[var(--accent-gold-hover)] disabled:opacity-50 disabled:bg-white/10 disabled:text-white/30 transition-all cursor-pointer"
            >
              {isTweaking ? <Loader2 size={14} className="animate-spin-slow" /> : <Send size={14} />}
            </button>
          </form>
        </motion.div>
      )}
    </section>
  );
}
