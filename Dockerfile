# syntax=docker/dockerfile:1.7

# -------- Base --------
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# -------- Deps (install ALL deps incl. dev) --------
FROM base AS deps
COPY package.json package-lock.json* ./
# NODE_ENV is NOT set to production here, so devDependencies (tailwind/postcss) are installed
RUN npm ci

# -------- Build (uses tailwind/postcss) --------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# -------- Runtime (tiny, production) --------
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Copy minimal server bundle and assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
