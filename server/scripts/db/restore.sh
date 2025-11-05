#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup.sql>"
  exit 1
fi

FILE="$1"
PGPASSWORD="${DB_PASSWORD:-password}" psql \
  -h "${DB_HOST:-localhost}" \
  -p "${DB_PORT:-5432}" \
  -U "${DB_USER:-postgres}" \
  -d "${DB_NAME:-ecommerce_db}" < "$FILE"

echo "Restore completed from $FILE"


