#!/usr/bin/env bash
set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
FILE="backup_${DATE}.sql"

PGPASSWORD="${DB_PASSWORD:-password}" pg_dump \
  -h "${DB_HOST:-localhost}" \
  -p "${DB_PORT:-5432}" \
  -U "${DB_USER:-postgres}" \
  "${DB_NAME:-ecommerce_db}" > "$FILE"

echo "Backup written to $FILE"


