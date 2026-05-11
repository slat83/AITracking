#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: ./scripts/restore-postgres.sh <backup.sql.gz>" >&2
  exit 1
fi

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

COMPOSE_FILE="${COMPOSE_FILE:-$REPO_ROOT/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/.env.production}"
BACKUP_PATH="$1"

if [ ! -f "$BACKUP_PATH" ]; then
  echo "Backup file not found: $BACKUP_PATH" >&2
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

gzip -dc "$BACKUP_PATH" | docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

printf 'Restore completed from %s\n' "$BACKUP_PATH"
