# ============================================================================
# Dockerfile — Production-optimised Next.js (standalone) image
# Build:   docker build -t aetheria .
# Run:     docker run -p 3000:3000 --env-file .env.local aetheria
# ============================================================================

FROM node:20-alpine AS base

# ── deps stage: install production + dev deps ──────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ── builder stage: compile Next.js ─────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Standalone output is configured in next.config.ts
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── runner stage: minimal runtime image ────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy only the standalone bundle + public assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
