#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL not set"; exit 1
fi

OUTDIR="./backups/postgres"
mkdir -p "$OUTDIR"
DATE=$(date +%Y-%m-%d)

# Using pg_dump via psql schema; ensure pg_dump is available
pg_dump "$DATABASE_URL" > "$OUTDIR/pg-${DATE}.sql"

# 4 rotations
ls -tp "$OUTDIR"/pg-*.sql | grep -v '/$' | tail -n +5 | xargs -I {} rm -- {}

echo "Postgres backup complete: $OUTDIR/pg-${DATE}.sql"

