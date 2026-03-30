-- 091 — RLS policies for all franchise_* tables
-- Problem: All franchise tables had ENABLE ROW LEVEL SECURITY but zero SELECT
-- policies, so browser-client queries (with user JWT) always returned empty.
--
-- Strategy:
--   1. Create a SECURITY DEFINER helper get_my_franchise_ids() that returns
--      the franchise_id(s) the current auth.uid() can access via the
--      memberships → franchise_units chain.
--   2. Apply a SELECT policy to every franchise_* table using that helper.
--   3. Super-admins can see everything.

-- ═══════════════════════════════
-- Helper function
-- ═══════════════════════════════

CREATE OR REPLACE FUNCTION get_my_franchise_ids()
RETURNS SETOF UUID AS $$
  SELECT DISTINCT fu.franchise_id
  FROM franchise_units fu
  JOIN memberships m ON m.academy_id = fu.academy_id
  JOIN profiles p ON p.id = m.profile_id
  WHERE p.user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ═══════════════════════════════
-- SELECT policies (franchise_id column)
-- ═══════════════════════════════

-- franchise_units
DO $$ BEGIN
  CREATE POLICY franchise_units_select ON franchise_units FOR SELECT USING (
    franchise_id IN (SELECT get_my_franchise_ids())
    OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- franchise_academies
DO $$ BEGIN
  CREATE POLICY franchise_academies_select ON franchise_academies FOR SELECT USING (
    franchise_id IN (SELECT get_my_franchise_ids())
    OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- franchise_financials
DO $$ BEGIN
  CREATE POLICY franchise_financials_select ON franchise_financials FOR SELECT USING (
    franchise_id IN (SELECT get_my_franchise_ids())
    OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- franchise_alerts
DO $$ BEGIN
  CREATE POLICY franchise_alerts_select ON franchise_alerts FOR SELECT USING (
    franchise_id IN (SELECT get_my_franchise_ids())
    OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- franchise_broadcasts
DO $$ BEGIN
  CREATE POLICY franchise_broadcasts_select ON franchise_broadcasts FOR SELECT USING (
    franchise_id IN (SELECT get_my_franchise_ids())
    OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- franchise_broadcasts INSERT (so franqueador can send messages)
DO $$ BEGIN
  CREATE POLICY franchise_broadcasts_insert ON franchise_broadcasts FOR INSERT WITH CHECK (
    franchise_id IN (SELECT get_my_franchise_ids())
    OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- franchise_broadcast_receipts
DO $$ BEGIN
  CREATE POLICY franchise_broadcast_receipts_select ON franchise_broadcast_receipts FOR SELECT USING (
    broadcast_id IN (
      SELECT id FROM franchise_broadcasts WHERE franchise_id IN (SELECT get_my_franchise_ids())
    )
    OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- franchise_compliance_checks
DO $$ BEGIN
  CREATE POLICY franchise_compliance_checks_select ON franchise_compliance_checks FOR SELECT USING (
    academy_id IN (
      SELECT fu.academy_id FROM franchise_units fu WHERE fu.franchise_id IN (SELECT get_my_franchise_ids())
    )
    OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- franchise_curriculos
DO $$ BEGIN
  CREATE POLICY franchise_curriculos_select ON franchise_curriculos FOR SELECT USING (
    franchise_id IN (SELECT get_my_franchise_ids())
    OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- franchise_leads
DO $$ BEGIN
  CREATE POLICY franchise_leads_select ON franchise_leads FOR SELECT USING (
    franchise_id IN (SELECT get_my_franchise_ids())
    OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- franchise_messages
DO $$ BEGIN
  CREATE POLICY franchise_messages_select ON franchise_messages FOR SELECT USING (
    franchise_id IN (SELECT get_my_franchise_ids())
    OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- franchise_standards
DO $$ BEGIN
  CREATE POLICY franchise_standards_select ON franchise_standards FOR SELECT USING (
    franchise_id IN (SELECT get_my_franchise_ids())
    OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- franchise_trainings
DO $$ BEGIN
  CREATE POLICY franchise_trainings_select ON franchise_trainings FOR SELECT USING (
    franchise_id IN (SELECT get_my_franchise_ids())
    OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- royalty_calculations (may or may not exist — guard with IF EXISTS)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'royalty_calculations') THEN
    EXECUTE 'CREATE POLICY royalty_calculations_select ON royalty_calculations FOR SELECT USING (
      franchise_id IN (SELECT get_my_franchise_ids())
      OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = ''super_admin''
    )';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
