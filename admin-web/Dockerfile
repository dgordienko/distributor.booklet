# syntax=docker/dockerfile:1
#
# Build context is the repo root (see docker-compose.yml) — same reason as
# backend/Dockerfile: npm workspaces monorepo, single root package-lock.json.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY admin-web/package.json admin-web/package.json
RUN npm ci --workspace=admin-web --include-workspace-root

FROM deps AS build
# Vite inlines VITE_* env vars into the bundle at build time, so the Auth0
# tenant/client to use must be supplied as build args, not runtime env vars.
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ENV VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN \
    VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID
COPY admin-web/index.html admin-web/index.html
COPY admin-web/vite.config.ts admin-web/vite.config.ts
COPY admin-web/tsconfig.json admin-web/tsconfig.json
COPY admin-web/src admin-web/src
RUN npm run build --workspace=admin-web

# ---- runtime: static bundle served by an unprivileged nginx ----
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY admin-web/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/admin-web/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
