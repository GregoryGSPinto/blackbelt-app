#!/bin/bash
echo "=== BACKUP DATABASE ==="
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$DATE"
mkdir -p "$BACKUP_DIR"

cp -r supabase/migrations/ "$BACKUP_DIR/migrations/"
echo "Migrations backed up"

if [ -f .env.local ]; then
  grep -v "KEY\|SECRET\|TOKEN\|DSN" .env.local > "$BACKUP_DIR/env-safe.txt" 2>/dev/null
  echo "Safe env vars backed up"
fi

echo "Backup saved to $BACKUP_DIR"
