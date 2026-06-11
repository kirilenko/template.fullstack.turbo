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
RUN pnpm dlx turbo prune @apps/web-public --docker

# ---
FROM base AS builder
COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prepare /app/out/full/ .
COPY .env ./
COPY .env.* ./

ARG BRANCH
RUN if [ -f ".env.${BRANCH}" ]; then \
      cp .env .env.build && \
      cat .env.${BRANCH} >> .env.build && pnpm exec dotenv -e .env.build -- pnpm turbo build --filter=@apps/web-public; \
    else \
      echo "No env file .env.${BRANCH} found!" && exit 1; \
    fi

# ---
FROM base AS runner
WORKDIR /app
COPY --from=builder /app/apps/web-public/.output ./.output
COPY --from=builder /app/apps/web-public/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
