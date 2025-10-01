# syntax=docker/dockerfile:1.7

# We pass BASE_IMAGE dynamically from GitHub Actions matrix
ARG BASE_IMAGE=node:22-alpine
FROM ${BASE_IMAGE} AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---------- Dependencies (install all including dev) ----------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---------- Build stage ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Runtime (production) ----------
FROM ${BASE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# Copy built output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Alpine only: install libc6-compat (no-op on Debian)
RUN (apk add --no-cache libc6-compat 2>/dev/null || true)

EXPOSE 3000
CMD ["node", "server.js"]
