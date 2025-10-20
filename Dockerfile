# syntax=docker/dockerfile:1.7

ARG BASE_IMAGE=node:22-alpine
FROM ${BASE_IMAGE} AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---------- Build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM ${BASE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# ✅ Universal curl install (works on Alpine *and* Debian/Ubuntu)
RUN if command -v apk >/dev/null 2>&1; then \
      apk add --no-cache curl; \
    elif command -v apt-get >/dev/null 2>&1; then \
      apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*; \
    else \
      echo "❌ No supported package manager found to install curl" && exit 1; \
    fi

# Copy built output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Optional: Alpine-only fix
RUN if command -v apk >/dev/null 2>&1; then apk add --no-cache libc6-compat || true; fi

EXPOSE 3000

# ✅ Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
