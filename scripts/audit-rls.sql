-- BlackBelt v2 — RLS Policy Audit
-- Run in Supabase Dashboard SQL Editor to review all RLS policies

-- 1. List all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 2. List tables WITHOUT any RLS policy (potential security risk)
SELECT c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = true
  AND c.relname NOT IN (
    SELECT DISTINCT tablename FROM pg_policies WHERE schemaname = 'public'
  )
ORDER BY c.relname;

-- 3. List tables with RLS disabled (should be enabled for all user-facing tables)
SELECT c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = false
  AND c.relname NOT LIKE 'pg_%'
  AND c.relname NOT LIKE '_prisma_%'
ORDER BY c.relname;

-- 4. Find overly permissive policies (USING(true) without proper filtering)
SELECT
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND qual = 'true'
ORDER BY tablename;
