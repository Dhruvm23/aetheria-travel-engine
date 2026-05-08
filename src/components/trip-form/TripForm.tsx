'use client';

// ============================================================================
// TripForm — Hero input form for trip planning
// ============================================================================

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Users, Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { InterestGrid } from './InterestGrid';
import { AccessibilityForm } from './AccessibilityForm';
import { usePromptParser } from '@/hooks/usePromptParser';
import type { TripRequest, BudgetLevel, AccessibilityNeeds } from '@/types/itinerary';

interface TripFormProps {
  onSubmit: (request: TripRequest) => void;
  isLoading: boolean;
  error: string | null;
}

const BUDGET_OPTIONS: { value: BudgetLevel; label: string; desc: string; emoji: string }[] = [
  { value: 'budget', label: 'Budget', desc: 'Hostels, street food', emoji: '🎒' },
  { value: 'moderate', label: 'Moderate', desc: 'Mid-range hotels', emoji: '✈️' },
  { value: 'luxury', label: 'Luxury', desc: 'Premium & fine dining', emoji: '👑' },
];

const DEFAULT_ACCESSIBILITY: AccessibilityNeeds = {
  wheelchairRequired: false,
  limitedMobility: false,
  visualImpairment: false,
  hearingImpairment: false,
  elderlyTraveler: false,
};

export function TripForm({ onSubmit, isLoading, error }: TripFormProps) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState<BudgetLevel>('moderate');
  const [interests, setInterests] = useState<string[]>(['history', 'food']);
  const [groupSize, setGroupSize] = useState(2);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<AccessibilityNeeds>(DEFAULT_ACCESSIBILITY);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  usePromptParser({ prompt, setBudget, setInterests, setGroupSize });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      destination,
      startDate,
      endDate,
      budget,
      interests,
      accessibilityNeeds,
      groupSize,
      specialRequirements: prompt + (specialRequirements ? `\n\nAdditional Requirements: ${specialRequirements}` : ''),
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
      }}
    >
      {/* Hero header */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
        }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold-subtle)] flex items-center justify-center">
            <Sparkles size={16} className="text-[var(--accent-gold)]" aria-hidden="true" />
          </div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[var(--accent-gold)]">
            AI Trip Planner
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
          Where does your
          <span className="text-gradient-gold"> journey begin?</span>
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Share your vision. Aetheria crafts a personalized, time-blocked itinerary in seconds.
        </p>
      </motion.div>

      <form
        onSubmit={handleSubmit}
        aria-label="Trip planning form"
        noValidate
        className="space-y-5"
      >
        {/* Destination */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
          }}
        >
          <label
            htmlFor="prompt"
            className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2"
          >
            Where does your journey begin?
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A budget trip to Paris for 4 people interested in art, history, and food..."
            rows={3}
            aria-label="Describe your travel vision"
            tabIndex={0}
            className="
              w-full px-4 py-3 rounded-xl
              glass-panel text-[var(--text-primary)] placeholder-[var(--text-muted)]
              text-sm resize-none
              focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]
              transition-all duration-200
            "
          />
        </motion.div>

        {/* Essential structured fields */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
          }}
        >
          <label
            htmlFor="destination"
            className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2"
          >
            Destination (Required)
          </label>
          <div className="relative">
            <MapPin
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Paris, Tokyo, Rome…"
              required
              aria-label="Enter your travel destination"
              tabIndex={0}
              className="
                w-full pl-10 pr-4 py-3 rounded-xl
                glass-panel text-[var(--text-primary)] placeholder-[var(--text-muted)]
                text-sm font-medium
                focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]
                transition-all duration-200
              "
            />
          </div>
        </motion.div>

        {/* Dates */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
          }}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <label
              htmlFor="start-date"
              className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2"
            >
              Departure
            </label>
            <div className="relative">
              <Calendar
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                aria-label="Trip start date"
                tabIndex={0}
                className="
                  w-full pl-9 pr-3 py-3 rounded-xl
                  glass-panel text-[var(--text-primary)]
                  text-sm [color-scheme:dark]
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]
                  transition-all duration-200
                "
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="end-date"
              className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2"
            >
              Return
            </label>
            <div className="relative">
              <Calendar
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate}
                aria-label="Trip end date"
                tabIndex={0}
                className="
                  w-full pl-9 pr-3 py-3 rounded-xl
                  glass-panel text-[var(--text-primary)]
                  text-sm [color-scheme:dark]
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]
                  transition-all duration-200
                "
              />
            </div>
          </div>
        </motion.div>

        {/* Refine Constraints Accordion */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
          }}
          className="border border-white/10 rounded-xl overflow-hidden glass-panel"
        >
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">
              Refine Constraints (Filters)
            </span>
            {showAdvanced ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
          </button>
          
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-6">
                  {/* Budget */}
                  <div>
                    <span className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Budget Level
                    </span>
                    <div
                      role="radiogroup"
                      aria-label="Select budget level"
                      className="grid grid-cols-3 gap-2"
                    >
                      {BUDGET_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={budget === opt.value}
                          aria-label={`Budget: ${opt.label} — ${opt.desc}`}
                          tabIndex={0}
                          onClick={() => setBudget(opt.value)}
                          className={`
                            flex flex-col items-center gap-1 p-3 rounded-xl border
                            cursor-pointer transition-all duration-200 text-center
                            ${budget === opt.value
                              ? 'bg-[var(--accent-gold-subtle)] border-[var(--accent-gold)] text-[var(--accent-gold)]'
                              : 'glass-panel border-white/10 text-[var(--text-secondary)] hover:border-white/20'
                            }
                          `}
                        >
                          <span className="text-lg leading-none">{opt.emoji}</span>
                          <span className="text-xs font-semibold">{opt.label}</span>
                          <span className="text-[10px] text-[var(--text-muted)] leading-tight">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group size */}
                  <div>
                    <label
                      htmlFor="group-size"
                      className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2"
                    >
                      Group Size
                    </label>
                    <div className="flex items-center gap-4 glass-panel px-4 py-3 rounded-xl">
                      <Users size={16} className="text-[var(--text-muted)]" aria-hidden="true" />
                      <input
                        id="group-size"
                        type="range"
                        min={1}
                        max={12}
                        value={groupSize}
                        onChange={(e) => setGroupSize(Number(e.target.value))}
                        aria-label={`Group size: ${groupSize} people`}
                        aria-valuemin={1}
                        aria-valuemax={12}
                        aria-valuenow={groupSize}
                        tabIndex={0}
                        className="flex-1 accent-[var(--accent-gold)] cursor-pointer"
                      />
                      <span
                        className="text-sm font-bold text-[var(--text-primary)] w-8 text-right"
                        aria-live="polite"
                      >
                        {groupSize}
                      </span>
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <span className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Interests
                    </span>
                    <InterestGrid selected={interests} onChange={setInterests} />
                  </div>

                  {/* Accessibility */}
                  <div>
                    <AccessibilityForm value={accessibilityNeeds} onChange={setAccessibilityNeeds} />
                  </div>

                  {/* Special requirements */}
                  <div>
                    <label
                      htmlFor="special-requirements"
                      className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2"
                    >
                      Strict Limitations{' '}
                      <span className="text-[var(--text-muted)] normal-case font-normal">(optional)</span>
                    </label>
                    <textarea
                      id="special-requirements"
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                      placeholder="e.g. strict vegan, no stairs..."
                      rows={2}
                      tabIndex={0}
                      className="
                        w-full px-4 py-3 rounded-xl
                        glass-panel text-[var(--text-primary)] placeholder-[var(--text-muted)]
                        text-sm resize-none
                        focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]
                        transition-all duration-200
                      "
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: -4 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-3 p-4 rounded-xl bg-[var(--status-danger)]/10 border border-[var(--status-danger)]/30"
            >
              <AlertCircle size={16} className="text-[var(--status-danger)] mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-sm text-[var(--status-danger)]">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isLoading || !destination || !startDate || !endDate}
          aria-label={isLoading ? 'Generating your itinerary…' : 'Generate AI itinerary'}
          tabIndex={0}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="
            w-full flex items-center justify-center gap-3
            py-4 rounded-xl font-semibold text-sm
            bg-[var(--accent-gold)] text-[var(--text-inverse)]
            hover:bg-[var(--accent-gold-hover)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            shadow-[var(--shadow-glow-gold)]
          "
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin-slow" aria-hidden="true" />
              Crafting your itinerary…
            </>
          ) : (
            <>
              <Sparkles size={18} aria-hidden="true" />
              Generate Itinerary
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
