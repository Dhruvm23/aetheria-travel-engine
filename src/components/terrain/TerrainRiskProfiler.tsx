'use client';

// ============================================================================
// TerrainRiskProfiler — SVG elevation chart + risk assessment panel
// ============================================================================

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertTriangle, CheckCircle, Route } from 'lucide-react';
import { LoadingShimmer } from '@/components/ui/LoadingShimmer';
import type { TerrainAssessment } from '@/types/itinerary';

interface TerrainRiskProfilerProps {
  assessment: TerrainAssessment | null;
  isLoading: boolean;
  error: string | null;
  isVisible: boolean;
  onDismiss: () => void;
}

const RISK_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType; bg: string }
> = {
  safe: { label: 'Safe', color: 'var(--status-success)', icon: CheckCircle, bg: 'rgba(107,203,119,0.12)' },
  moderate: { label: 'Moderate', color: 'var(--status-warning)', icon: AlertTriangle, bg: 'rgba(255,217,61,0.12)' },
  challenging: { label: 'Challenging', color: 'var(--status-danger)', icon: AlertTriangle, bg: 'rgba(255,107,107,0.12)' },
  inaccessible: { label: 'Inaccessible', color: '#ff4466', icon: AlertTriangle, bg: 'rgba(255,68,102,0.12)' },
};

function ElevationChart({ assessment }: { assessment: TerrainAssessment }) {
  const points = assessment.elevationProfile;
  if (points.length < 2) return null;

  const elevations = points.map((p) => p.elevation);
  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);
  const elevRange = maxElev - minElev || 1;

  const maxDist = points[points.length - 1].distanceFromStart || 1;

  const chartW = 400;
  const chartH = 100;
  const padX = 8;
  const padY = 12;

  const toSvg = (elev: number, dist: number) => ({
    x: padX + ((dist / maxDist) * (chartW - 2 * padX)),
    y: chartH - padY - ((elev - minElev) / elevRange) * (chartH - 2 * padY),
  });

  const polylinePoints = points
    .map((p) => {
      const { x, y } = toSvg(p.elevation, p.distanceFromStart);
      return `${x},${y}`;
    })
    .join(' ');

  // Area fill path
  const first = toSvg(points[0].elevation, points[0].distanceFromStart);
  const last = toSvg(points[points.length - 1].elevation, points[points.length - 1].distanceFromStart);
  const areaPath = `M${first.x},${chartH - padY} L${polylinePoints.replace(/(\d+\.\d+),(\d+\.\d+)/g, '$1,$2')} L${last.x},${chartH - padY} Z`;

  const riskColor = RISK_CONFIG[assessment.riskLevel]?.color ?? '#d4a853';

  return (
    <div className="relative" aria-label={`Elevation chart: ${points.length} data points`}>
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        preserveAspectRatio="none"
        className="w-full h-20 rounded-xl overflow-hidden"
        role="img"
        aria-label={`Elevation profile showing ${maxElev.toFixed(0)}m peak and ${minElev.toFixed(0)}m low over ${(maxDist / 1000).toFixed(2)}km`}
      >
        <defs>
          <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={riskColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={riskColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Background grid */}
        {[25, 50, 75].map((pct) => (
          <line
            key={pct}
            x1={padX}
            y1={padY + ((100 - pct) / 100) * (chartH - 2 * padY)}
            x2={chartW - padX}
            y2={padY + ((100 - pct) / 100) * (chartH - 2 * padY)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#elevGradient)" />

        {/* Polyline */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={riskColor}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Peak marker */}
        {(() => {
          const peakIdx = elevations.indexOf(maxElev);
          const peak = toSvg(maxElev, points[peakIdx].distanceFromStart);
          return (
            <g>
              <circle cx={peak.x} cy={peak.y} r="4" fill={riskColor} />
              <circle cx={peak.x} cy={peak.y} r="6" fill="none" stroke={riskColor} strokeWidth="1" strokeOpacity="0.4" />
            </g>
          );
        })()}
      </svg>

      {/* Axis labels */}
      <div className="flex justify-between mt-1 px-1" aria-hidden="true">
        <span className="text-[9px] text-[var(--text-muted)]">0 m</span>
        <span className="text-[9px] text-[var(--text-muted)]">
          {(maxDist / 1000).toFixed(2)} km
        </span>
      </div>
    </div>
  );
}

export function TerrainRiskProfiler({
  assessment,
  isLoading,
  error,
  isVisible,
  onDismiss,
}: TerrainRiskProfilerProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="terrain-panel"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
          role="region"
          aria-label="Terrain risk analysis"
          aria-live="polite"
        >
          <div className="glass-panel p-4 m-3 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route size={14} className="text-[var(--accent-gold)]" aria-hidden="true" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Terrain Risk Profiler
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close terrain analysis panel"
                tabIndex={0}
                onClick={onDismiss}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-[var(--text-muted)] transition-colors cursor-pointer"
              >
                <X size={13} aria-hidden="true" />
              </button>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="space-y-2" aria-label="Loading terrain data">
                <LoadingShimmer height="h-20" rounded="rounded-xl" />
                <div className="flex gap-2">
                  <LoadingShimmer width="w-24" height="h-8" rounded="rounded-lg" />
                  <LoadingShimmer width="w-24" height="h-8" rounded="rounded-lg" />
                </div>
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--status-danger)]/10 border border-[var(--status-danger)]/30">
                <AlertTriangle size={13} className="text-[var(--status-danger)]" aria-hidden="true" />
                <p className="text-xs text-[var(--status-danger)]">{error}</p>
              </div>
            )}

            {/* Assessment */}
            {assessment && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* SVG Elevation Chart */}
                <ElevationChart assessment={assessment} />

                {/* Stats row */}
                <div
                  className="grid grid-cols-3 gap-2"
                  role="list"
                  aria-label="Terrain statistics"
                >
                  {[
                    { label: 'Max Slope', value: `${assessment.maxSlopePercent}%`, color: '#fff' },
                    { label: 'Avg Slope', value: `${assessment.averageSlopePercent}%`, color: '#fff' },
                    { label: 'Surface', value: assessment.surfaceType, color: '#fff' },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      role="listitem"
                      className="glass-panel px-3 py-2 text-center rounded-xl"
                      aria-label={`${label}: ${value}`}
                    >
                      <div className="text-xs font-bold text-[var(--text-primary)] capitalize">{value}</div>
                      <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Risk badge */}
                {(() => {
                  const cfg = RISK_CONFIG[assessment.riskLevel] || RISK_CONFIG.moderate;
                  const RiskIcon = cfg.icon;
                  return (
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}30` }}
                      role="status"
                      aria-label={`Risk level: ${cfg.label}`}
                    >
                      <RiskIcon size={16} style={{ color: cfg.color }} aria-hidden="true" />
                      <div>
                        <span className="text-xs font-bold" style={{ color: cfg.color }}>
                          {cfg.label} Risk
                        </span>
                        {assessment.warnings.length > 0 && (
                          <ul className="mt-1 space-y-0.5" aria-label="Terrain warnings">
                            {assessment.warnings.map((w, i) => (
                              <li key={i} className="text-[10px] text-[var(--text-muted)]">• {w}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Alternative route */}
                {assessment.alternativeRoute && (
                  <div
                    className="flex items-start gap-3 p-3 rounded-xl bg-[var(--accent-teal)]/8 border border-[var(--accent-teal)]/20"
                    aria-label="Alternative route suggestion"
                  >
                    <TrendingUp size={14} className="text-[var(--accent-teal)] mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--accent-teal)]">Alternative Route</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {assessment.alternativeRoute.description}
                        {' '}(+{assessment.alternativeRoute.additionalMinutes} min)
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
