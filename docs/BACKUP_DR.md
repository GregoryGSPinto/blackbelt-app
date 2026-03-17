# Backup & Disaster Recovery (P-092)

## Supabase Automatic Backups

| Item | Configuração |
|------|-------------|
| **Frequency** | Daily (Pro plan), Point-in-Time (Enterprise) |
| **Retention** | 7 days (Pro), 30 days (Enterprise) |
| **Type** | Full Postgres pg_dump + WAL archiving |
| **Storage** | Supabase-managed S3 buckets (encrypted at rest) |

## Restore Procedures

### 1. Database Restore (Supabase Dashboard)

```bash
# Via dashboard: Settings → Database → Backups → Restore
# Or via CLI:
supabase db restore --project-ref $PROJECT_REF --backup-id $BACKUP_ID
```

### 2. Point-in-Time Recovery (Enterprise)

```bash
# Restore to specific timestamp
supabase db restore --project-ref $PROJECT_REF --target-time "2026-03-17T10:00:00Z"
```

### 3. Manual Backup

```bash
# Export full database
pg_dump $DATABASE_URL --format=custom --file=backup_$(date +%Y%m%d).dump

# Restore from manual backup
pg_restore --dbname=$DATABASE_URL backup_20260317.dump
```

## Storage Backups

- Supabase Storage objects are stored in S3 with cross-region replication
- File versioning enabled on `certificates`, `documents`, and `academy-assets` buckets
- Media files (videos) served via CDN with origin redundancy

## Application Recovery

### Vercel Deployments

- Every git push creates an immutable deployment
- Instant rollback via Vercel dashboard or CLI:
  ```bash
  vercel rollback [deployment-url]
  ```

### Environment Variables

- Stored in Vercel project settings (encrypted)
- Backup copy in 1Password team vault
- Never committed to git

## RTO/RPO Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| **RPO** (data loss) | < 1 hour | WAL archiving + daily backups |
| **RTO** (downtime) | < 30 min | Vercel instant rollback + Supabase restore |
| **Storage RPO** | 0 (no loss) | S3 cross-region replication |

## Incident Response Checklist

1. **Detect** — Monitoring alerts (Sentry, Vercel, Supabase dashboard)
2. **Assess** — Determine scope (app only, DB, or full outage)
3. **Communicate** — Update status page at `/status`
4. **Recover** — Execute appropriate restore procedure
5. **Verify** — Run smoke tests against restored environment
6. **Post-mortem** — Document root cause and preventive measures

## Testing Schedule

- Monthly: Test database restore to staging environment
- Quarterly: Full DR drill (simulate production outage, execute recovery)
- Annually: Review and update this document
