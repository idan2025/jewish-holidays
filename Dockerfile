# syntax=docker/dockerfile:1.7

# -------- Base --------
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# -------- Deps (install dev deps for build) --------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# -------- Build --------
FROM base AS builder
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# Bring in node_modules from deps
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the source
COPY . .

# (Optional hard guard; remove if you don’t want it here)
# Fail the image build if someone imports next/document or <Html> in source
RUN ! grep -R --line-number --exclude-dir=node_modules --exclude-dir=.next -E "next/document|<Html" . || \
    (echo "Forbidden next/document or <Html> found in source. Use App Router <html> in app/layout.tsx." && exit 1)

# Build Next.js
RUN npm run build

# -------- Runtime (tiny, standalone) --------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# If using output: 'standalone', we can run with the minimal bundle:
#  - .next/standalone contains server code + node_modules subset
#  - .next/static and public are needed for assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Default Next.js port
EXPOSE 3000
CMD ["node", "server.js"]
