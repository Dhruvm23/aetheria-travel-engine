'use client';

// ============================================================================
// DashboardHeader — Top navigation bar with auth & branding
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, BookMarked, User, LogOut, Crown } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

export function DashboardHeader() {
  const { user, isLoading, openSignIn, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const PLAN_CONFIG: Record<string, { label: string; color: string }> = {
    free: { label: 'Free', color: 'var(--text-muted)' },
    pro: { label: 'Pro', color: 'var(--accent-gold)' },
    enterprise: { label: 'Enterprise', color: 'var(--accent-teal)' },
  };

  const planConfig = user ? PLAN_CONFIG[user.plan] : null;

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-30 h-14
        flex items-center justify-between px-6
        border-b border-white/8
        bg-[var(--bg-base)]/80 backdrop-blur-xl
      "
      role="banner"
      aria-label="Aetheria navigation header"
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2.5" aria-label="Aetheria — AI Travel Engine">
        <div className="w-7 h-7 rounded-xl bg-[var(--accent-gold-subtle)] flex items-center justify-center" aria-hidden="true">
          <Sparkles size={13} className="text-[var(--accent-gold)]" />
        </div>
        <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
          Aetheria
        </span>
        <span className="hidden sm:block text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
          AI Travel Engine
        </span>
      </div>

      {/* Right: Auth */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        {isLoading ? (
          <div className="w-8 h-8 rounded-full glass-panel animate-pulse" aria-hidden="true" />
        ) : user ? (
          /* ── Signed-in user menu ── */
          <div className="relative">
            <button
              type="button"
              aria-label={`Open user menu for ${user.name}`}
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
              tabIndex={0}
              onClick={() => setIsDropdownOpen((p) => !p)}
              className="
                flex items-center gap-2 px-3 py-1.5
                rounded-xl glass-panel hover:bg-white/8
                transition-all duration-200 cursor-pointer
              "
            >
              {/* Avatar */}
              <div
                className="w-6 h-6 rounded-full bg-[var(--accent-gold)] flex items-center justify-center text-[10px] font-bold text-[var(--text-inverse)]"
                aria-hidden="true"
              >
                {user.avatarInitials}
              </div>

              <span className="hidden sm:block text-xs font-semibold text-[var(--text-primary)] max-w-[100px] truncate">
                {user.name}
              </span>

              {/* Plan badge */}
              {planConfig && (
                <span
                  className="hidden sm:block text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ color: planConfig.color, backgroundColor: `${planConfig.color}20` }}
                  aria-label={`Plan: ${planConfig.label}`}
                >
                  {planConfig.label.toUpperCase()}
                </span>
              )}

              <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={13} className="text-[var(--text-muted)]" aria-hidden="true" />
              </motion.div>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  role="menu"
                  aria-label="User account menu"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="
                    absolute right-0 top-full mt-2
                    w-52 glass-panel-strong rounded-2xl
                    border border-white/15 overflow-hidden
                    shadow-[0_16px_48px_rgba(0,0,0,0.5)]
                  "
                  style={{ backdropFilter: 'blur(32px)' }}
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-white/8">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{user.email}</p>
                  </div>

                  {/* Menu items */}
                  {[
                    { icon: User, label: 'Profile', action: () => setIsDropdownOpen(false) },
                    { icon: BookMarked, label: 'Saved Trips', action: () => setIsDropdownOpen(false) },
                  ].map(({ icon: Icon, label, action }) => (
                    <button
                      key={label}
                      type="button"
                      role="menuitem"
                      aria-label={label}
                      tabIndex={0}
                      onClick={action}
                      className="
                        w-full flex items-center gap-3 px-4 py-2.5
                        text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                        hover:bg-white/6 transition-colors text-left cursor-pointer
                      "
                    >
                      <Icon size={13} className="text-[var(--text-muted)]" aria-hidden="true" />
                      {label}
                    </button>
                  ))}

                  <div className="border-t border-white/8">
                    <button
                      type="button"
                      role="menuitem"
                      aria-label="Sign out of Aetheria"
                      tabIndex={0}
                      onClick={() => { signOut(); setIsDropdownOpen(false); }}
                      className="
                        w-full flex items-center gap-3 px-4 py-2.5
                        text-xs text-[var(--status-danger)] hover:bg-[var(--status-danger)]/8
                        transition-colors text-left cursor-pointer
                      "
                    >
                      <LogOut size={13} aria-hidden="true" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* ── Sign In button ── */
          <motion.button
            type="button"
            aria-label="Sign in to Aetheria"
            tabIndex={0}
            onClick={openSignIn}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="
              flex items-center gap-2 px-4 py-2 rounded-xl
              bg-[var(--accent-gold)] text-[var(--text-inverse)]
              text-xs font-bold
              hover:bg-[var(--accent-gold-hover)]
              transition-all shadow-[0_4px_16px_var(--accent-gold-glow)] cursor-pointer
            "
          >
            <Crown size={12} aria-hidden="true" />
            Sign In
          </motion.button>
        )}
      </div>
    </header>
  );
}
