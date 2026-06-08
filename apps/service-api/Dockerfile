ARG NODE_VERSION=24.12.0
FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate \
  && apk add --no-cache libc6-compat

WORKDIR /app

# ---
FROM base AS prepare
COPY . .
RUN pnpm dlx turbo prune @apps/service-api --docker

# ---
FROM base AS builder
COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prepare /app/out/full/ .
RUN pnpm turbo build --filter=@apps/service-api
# Ensure drizzle/ exists even if no migrations have been generated yet
RUN mkdir -p /app/apps/service-api/drizzle
RUN pnpm --filter @apps/service-api --prod deploy --legacy /app/deployed

# ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/deployed/node_modules ./node_modules
COPY --from=builder /app/deployed/package.json ./
COPY --from=builder /app/apps/service-api/dist ./dist
COPY --from=builder /app/apps/service-api/drizzle ./drizzle

COPY apps/service-api/scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/index.js"]
