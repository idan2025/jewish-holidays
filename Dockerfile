# -------- Base image for all stages --------
FROM node:22-alpine AS base
# sharp sometimes needs this on Alpine
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

# -------- Dependencies stage (uses npm ci) --------
FROM base AS deps
WORKDIR /app
# Copy only package files for better caching
COPY package.json package-lock.json* ./
# If you use npm 11, lockfile name is package-lock.json (still fine)
RUN npm ci

# -------- Build stage --------
FROM base AS builder
WORKDIR /app
ENV NODE_ENV=development
# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the source
COPY . .
# Build the Next.js app (your script currently uses Turbopack; that's fine)
RUN npm run build

# -------- Runtime (tiny) --------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user (node user already exists in the image)
USER node

# Copy standalone server and static assets
# The standalone output contains the server and minimal node_modules
COPY --chown=node:node --from=builder /app/.next/standalone ./ 
COPY --chown=node:node --from=builder /app/.next/static ./.next/static
COPY --chown=node:node --from=builder /app/public ./public

# If you have a /src/app/icon.png or favicon in /public, they’re included above.

EXPOSE 3000
CMD ["node", "server.js"]
