# 1. Base Stage: Setup pnpm
ARG NODE_VERSION=24.13.0
FROM node:${NODE_VERSION}-alpine as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

# Pruner Stage
FROM base AS pruner
RUN pnpm add -g turbo
COPY . .
# Prunes the monorepo for the 'e-commerce-api' package
RUN turbo prune e-commerce-api --docker

# 3. Builder Stage: Install and Build
FROM base AS builder
# Copy pruned package.json/lockfiles for optimized dependency caching
COPY --from=pruner /usr/src/app/out/json/ .
RUN pnpm install --no-frozen-lockfile

# Copy full source and build
COPY --from=pruner /usr/src/app/out/full/ .
RUN pnpm turbo run build --filter=e-commerce-api

# 4. Runner Stage: Final Production Image
FROM base AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Security: Don't run as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fastify

    
COPY --from=builder --chown=fastify:nodejs /usr/src/app /usr/src/app

# Copy and make entrypoint executable
COPY --chown=fastify:nodejs apps/e-commerce-api/entrypoint.sh /usr/src/app/apps/e-commerce-api/entrypoint.sh
RUN chmod +x /usr/src/app/apps/e-commerce-api/entrypoint.sh

USER fastify
EXPOSE 8080

# Run the compiled server directly
WORKDIR /usr/src/app/apps/e-commerce-api
ENTRYPOINT ["sh", "entrypoint.sh"]