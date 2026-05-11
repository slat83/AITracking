#!/bin/sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/.env.production}"

set -a
. "$ENV_FILE"
set +a

APP_ORIGIN="${APP_ORIGIN:-${NEXT_PUBLIC_SITE_URL:-}}"
CURL_INSECURE="${CURL_INSECURE:-false}"

if [ -z "${APP_ORIGIN}" ]; then
  echo "APP_ORIGIN or NEXT_PUBLIC_SITE_URL must be set." >&2
  exit 1
fi

if [ -z "${CRON_SECRET:-}" ]; then
  echo "CRON_SECRET must be set." >&2
  exit 1
fi

if [ "$CURL_INSECURE" = "true" ]; then
  echo "Warning: CURL_INSECURE=true disables TLS verification for cron delivery. Use only for break-glass recovery." >&2
  CURL_INSECURE_FLAG="-k"
else
  CURL_INSECURE_FLAG=""
fi

curl -fsS $CURL_INSECURE_FLAG \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$APP_ORIGIN/api/cron/daily"
