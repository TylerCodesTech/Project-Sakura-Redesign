# ================================
# Base stage - shared dependencies
# ================================
FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

# ================================
# Dependencies stage
# ================================
FROM base AS deps

COPY package*.json ./

RUN npm ci

# ================================
# Development stage
# ================================
FROM base AS development

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development

EXPOSE 5000

CMD ["npm", "run", "dev"]

# ================================
# Builder stage - build for production
# ================================
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

RUN npm run build

# ================================
# Production stage
# ================================
FROM base AS production

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 sakura

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

USER sakura

EXPOSE 5000

CMD ["npm", "run", "start"]
