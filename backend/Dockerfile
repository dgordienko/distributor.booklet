# syntax=docker/dockerfile:1
#
# Build context is the repo root (see docker-compose.yml) because this is an
# npm-workspaces monorepo with a single root package-lock.json — `npm ci`
# needs that lockfile alongside the root package.json to install correctly.

FROM node:20-bookworm-slim AS base
# Prisma's engine needs libssl to actually run, and needs the `openssl`
# binary present at `prisma generate` time to detect which libssl it's
# linking against — without it, it silently guesses and can ship a query
# engine that fails at runtime instead of at build time.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY backend/prisma backend/prisma

# ---- full install, used to compile TypeScript and generate the Prisma client ----
FROM base AS deps
RUN npm ci --workspace=backend --include-workspace-root

FROM deps AS build
COPY backend/tsconfig.json backend/tsconfig.json
COPY backend/src backend/src
RUN npx prisma generate --schema=backend/prisma/schema.prisma
RUN npm run build --workspace=backend

# ---- production-only install, this is what ships in the runtime image ----
FROM base AS prod-deps
RUN npm ci --workspace=backend --include-workspace-root --omit=dev
RUN npx prisma generate --schema=backend/prisma/schema.prisma

# ---- runtime ----
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=4000 \
    UPLOADS_DIR=/data/uploads \
    DATABASE_URL=file:/data/app.db
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs --home-dir /app --shell /usr/sbin/nologin backend

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/package.json backend/package.json
COPY backend/prisma backend/prisma
COPY backend/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh \
    && mkdir -p /data/uploads \
    && chown -R backend:nodejs /app /data

USER backend
WORKDIR /app/backend
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
