'use client';

// ============================================================================
// RightPanel — Sticky right panel: Map + TerrainProfiler + floating FABs
// ============================================================================

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { MapView } from '@/components/map/MapView';
import { TerrainRiskProfiler } from '@/components/terrain/TerrainRiskProfiler';
import { GlobalProgressBar } from '@/components/ui/GlobalProgressBar';
import { AgentStreamConsole } from '@/components/ui/AgentStreamConsole';
import { useAuth } from '@/components/auth/AuthContext';
import { Lock } from 'lucide-react';
import type { Activity, TerrainAssessment } from '@/types/itinerary';

interface RightPanelProps {
  activities: Activity[];
  selectedActivityId: string | null;
  hasItinerary: boolean;
  isLoading: boolean;
  terrain: {
    assessment: TerrainAssessment | null;
    isLoading: boolean;
    error: string | null;
    isVisible: boolean;
  };
  onOpenDisruption: () => void;
  onDismissTerrain: () => void;
}

export function RightPanel({
  activities,
  selectedActivityId,
  hasItinerary,
  isLoading,
  terrain,
  onOpenDisruption,
  onDismissTerrain,
}: RightPanelProps) {
  const { user, openSignIn } = useAuth();

  return (
    <div
      className="flex flex-col h-full"
      role="region"
      aria-label="Map and tools panel"
    >
      {/* Global Progress Bar at the top of the RightPanel */}
      <GlobalProgressBar isActive={isLoading} />
      <AgentStreamConsole isActive={isLoading} />

      {/* Map — fills available height, leaves room for terrain panel */}
      <div className="relative flex-1 p-3 pb-0 min-h-0">
        <MapView
          activities={activities}
          selectedActivityId={selectedActivityId}
        />

        {/* Disruption FAB */}
        {hasItinerary && (
          user ? (
            <motion.button
              type="button"
              aria-label="Open disruption simulator to re-plan itinerary"
              tabIndex={0}
              onClick={onOpenDisruption}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                absolute top-6 right-6 z-10
                flex items-center gap-2 px-4 py-2.5
                rounded-2xl glass-panel-strong
                border border-[var(--status-danger)]/30
                text-xs font-bold text-[var(--status-danger)]
                hover:bg-[var(--status-danger)]/10
                transition-all duration-200 cursor-pointer
                shadow-[0_4px_24px_rgba(255,107,107,0.2)]
              "
            >
              <Zap size={13} aria-hidden="true" />
              Disrupt
            </motion.button>
          ) : (
            <motion.button
              type="button"
              aria-label="Login required to access real-time emergency disruption re-routing"
              tabIndex={0}
              onClick={openSignIn}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                absolute top-6 right-6 z-10
                flex items-center gap-2 px-4 py-2.5
                rounded-2xl glass-panel-strong
                border border-white/10
                text-xs font-bold text-[var(--text-muted)]
                hover:text-[var(--text-primary)] hover:border-white/30
                transition-all duration-200 cursor-pointer
                backdrop-blur-md bg-black/40
              "
            >
              <Lock size={13} aria-hidden="true" />
              Disrupt (PRO)
            </motion.button>
          )
        )}
      </div>

      {/* Terrain profiler — expands below map */}
      <TerrainRiskProfiler
        assessment={terrain.assessment}
        isLoading={terrain.isLoading}
        error={terrain.error}
        isVisible={terrain.isVisible}
        onDismiss={onDismissTerrain}
      />
    </div>
  );
}
