'use client';

// ============================================================================
// PocketGuideDrawer — Persistent bottom-sheet drawer for cultural context
// ============================================================================

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, BookOpen, Globe, Camera, Shirt, Star, Loader2, AlertCircle,
} from 'lucide-react';
import { PronunciationBtn } from './PronunciationBtn';
import { LoadingShimmer } from '@/components/ui/LoadingShimmer';
import type { Activity, PocketGuideContent } from '@/types/itinerary';

interface PocketGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  content: PocketGuideContent | null;
  isLoading: boolean;
  error: string | null;
}

export function PocketGuideDrawer({
  isOpen,
  onClose,
  activity,
  content,
  isLoading,
  error,
}: PocketGuideDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard trap + escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex="0"]'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="pocket-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.aside
            key="pocket-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Pocket Guide: ${activity?.name ?? 'Loading…'}`}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="
              fixed bottom-0 left-0 right-0 z-50
              max-h-[80vh] overflow-hidden
              glass-panel-strong
              border-t border-white/10
              flex flex-col rounded-t-3xl
            "
            style={{ backdropFilter: 'blur(32px) saturate(1.5)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" aria-hidden="true" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-2 pb-4 border-b border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold-subtle)] flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-[var(--accent-gold)]" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)] leading-tight">
                    {activity?.name ?? ''}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 capitalize">
                    {activity?.category} · Pocket Guide
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close pocket guide"
                tabIndex={0}
                onClick={onClose}
                className="
                  w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                  hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)]
                  transition-colors duration-150 cursor-pointer mt-1
                "
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Content — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {isLoading && (
                <div className="space-y-4" aria-label="Loading pocket guide content">
                  <LoadingShimmer height="h-4" width="w-3/4" />
                  <LoadingShimmer height="h-3" />
                  <LoadingShimmer height="h-3" width="w-5/6" />
                  <LoadingShimmer height="h-3" width="w-4/6" />
                  <div className="flex items-center gap-2 pt-2">
                    <Loader2 size={14} className="animate-spin-slow text-[var(--accent-gold)]" aria-hidden="true" />
                    <span className="text-xs text-[var(--text-muted)]">Fetching cultural context…</span>
                  </div>
                </div>
              )}

              {error && !isLoading && (
                <div
                  role="alert"
                  className="flex items-start gap-3 p-4 rounded-xl bg-[var(--status-danger)]/10 border border-[var(--status-danger)]/30"
                >
                  <AlertCircle size={14} className="text-[var(--status-danger)] mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-[var(--status-danger)]">{error}</p>
                </div>
              )}

              {content && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {/* Cultural context */}
                  <section aria-label="Cultural context">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={13} className="text-[var(--accent-teal)]" aria-hidden="true" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        Cultural Context
                      </h3>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {content.culturalContext}
                    </p>
                  </section>

                  {/* Local etiquette */}
                  {content.localEtiquette.length > 0 && (
                    <section aria-label="Local etiquette guidelines">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                        Local Etiquette
                      </h3>
                      <ul className="space-y-2" aria-label="Etiquette tips">
                        {content.localEtiquette.map((tip, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06, duration: 0.3 }}
                            className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] shrink-0" aria-hidden="true" />
                            {tip}
                          </motion.li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Pronunciation tips */}
                  {content.pronunciationTips.length > 0 && (
                    <section aria-label="Pronunciation tips with audio assist">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                          Audio Assist — Local Phrases
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {content.pronunciationTips.map((tip, i) => (
                          <PronunciationBtn key={i} tip={tip} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Fun facts */}
                  {content.funFacts.length > 0 && (
                    <section aria-label="Fun facts about this venue">
                      <div className="flex items-center gap-2 mb-2">
                        <Star size={13} className="text-[var(--accent-gold)]" aria-hidden="true" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                          Did You Know?
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {content.funFacts.map((fact, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="p-3 rounded-xl glass-panel text-xs text-[var(--text-secondary)] leading-relaxed"
                            aria-label={`Fun fact ${i + 1}: ${fact}`}
                          >
                            ✨ {fact}
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Optional: photography tips */}
                  {content.photographyTips && (
                    <section aria-label="Photography tips">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera size={13} className="text-[var(--text-muted)]" aria-hidden="true" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                          Photography Tips
                        </h3>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {content.photographyTips}
                      </p>
                    </section>
                  )}

                  {/* Optional: dress code */}
                  {content.dressCode && (
                    <section aria-label="Dress code information">
                      <div className="flex items-center gap-2 mb-2">
                        <Shirt size={13} className="text-[var(--text-muted)]" aria-hidden="true" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                          Dress Code
                        </h3>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {content.dressCode}
                      </p>
                    </section>
                  )}
                </motion.div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
