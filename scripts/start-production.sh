#!/bin/sh
set -eu

if [ "${RUN_DB_MIGRATIONS:-true}" = "true" ]; then
  npx prisma migrate deploy
fi

if [ "${SEED_ON_BOOT:-false}" = "true" ]; then
  npm run db:seed
fi

exec npm run start
