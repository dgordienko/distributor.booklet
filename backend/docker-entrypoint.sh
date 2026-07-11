#!/bin/sh
set -e

# Applies any pending migrations against the mounted SQLite volume before the
# server starts. Safe to run on every container start: a no-op if the schema
# is already up to date.
npx prisma migrate deploy

exec "$@"
