'use client';

// ============================================================================
// SignInModal — Glassmorphism sign-in overlay
// ============================================================================

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Mail, User, Shield } from 'lucide-react';
import { useAuth } from './AuthContext';

export function SignInModal() {
  const { isSignInOpen, closeSignIn, signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isSignInOpen) setTimeout(() => firstFieldRef.current?.focus(), 50);
  }, [isSignInOpen]);

  // Escape key + focus trap
  useEffect(() => {
    if (!isSignInOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSignIn();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isSignInOpen, closeSignIn]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    setError('');
    setIsLoading(true);
    try {
      await signIn(email, name);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isSignInOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="signin-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            aria-hidden="true"
            onClick={closeSignIn}
          />

          {/* Modal */}
          <motion.div
            key="signin-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Sign in to Aetheria"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="
              fixed inset-0 z-50 flex items-center justify-center p-4
              pointer-events-none
            "
          >
            <div
              className="
                pointer-events-auto w-full max-w-sm
                glass-panel-strong rounded-3xl p-8
                border border-white/15
                shadow-[0_32px_96px_rgba(0,0,0,0.6)]
              "
              style={{ backdropFilter: 'blur(40px) saturate(1.6)' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold-subtle)] flex items-center justify-center">
                      <Sparkles size={14} className="text-[var(--accent-gold)]" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase text-[var(--accent-gold)]">
                      Aetheria
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                    Welcome back
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Sign in to save trips and sync across devices
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close sign in dialog"
                  tabIndex={0}
                  onClick={closeSignIn}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-[var(--text-muted)] transition-colors cursor-pointer"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" aria-label="Sign in form">
                {/* Name */}
                <div>
                  <label htmlFor="signin-name" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Display Name
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                    <input
                      ref={firstFieldRef}
                      id="signin-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Wanderer"
                      aria-label="Your display name"
                      tabIndex={0}
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-panel text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="signin-email" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                    <input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      aria-label="Your email address"
                      tabIndex={0}
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-panel text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <p role="alert" className="text-xs text-[var(--status-danger)]">{error}</p>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  aria-label={isLoading ? 'Signing in…' : 'Sign in to Aetheria'}
                  tabIndex={0}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="
                    w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                    bg-[var(--accent-gold)] text-[var(--text-inverse)]
                    font-semibold text-sm
                    hover:bg-[var(--accent-gold-hover)]
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all shadow-[var(--shadow-glow-gold)] cursor-pointer
                  "
                >
                  {isLoading ? (
                    <><Loader2 size={15} className="animate-spin-slow" aria-hidden="true" /> Signing in…</>
                  ) : (
                    <><Sparkles size={15} aria-hidden="true" /> Continue with Email</>
                  )}
                </motion.button>
              </form>

              {/* Trust footer */}
              <div className="flex items-center justify-center gap-1.5 mt-6">
                <Shield size={11} className="text-[var(--text-muted)]" aria-hidden="true" />
                <span className="text-[10px] text-[var(--text-muted)]">
                  Demo auth — no real data is stored
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
