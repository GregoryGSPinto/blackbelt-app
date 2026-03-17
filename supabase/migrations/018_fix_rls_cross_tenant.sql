-- ============================================================
-- BlackBelt v2 — Migration 018: Fix RLS Cross-Tenant Leaks
-- SECURITY FIX: Replace all USING(true) policies with proper
-- academy-scoped checks via parent table joins.
-- ============================================================

-- ============================================================
-- 1. event_registrations — scope via events.academy_id
-- ============================================================
DROP POLICY IF EXISTS event_reg_select ON public.event_registrations;
DROP POLICY IF EXISTS event_reg_insert ON public.event_registrations;

CREATE POLICY event_reg_select ON public.event_registrations
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM public.events WHERE public.is_member_of(academy_id)
    )
  );

CREATE POLICY event_reg_insert ON public.event_registrations
  FOR INSERT WITH CHECK (
    event_id IN (
      SELECT id FROM public.events WHERE public.is_member_of(academy_id)
    )
  );

CREATE POLICY event_reg_delete ON public.event_registrations
  FOR DELETE USING (
    -- User can cancel own registration
    student_id IN (
      SELECT s.id FROM public.students s
      WHERE s.academy_id IN (
        SELECT m.academy_id FROM public.memberships m
        JOIN public.profiles p ON p.id = m.profile_id
        WHERE p.user_id = auth.uid() AND m.status = 'active'
      )
    )
  );

-- ============================================================
-- 2. student_xp — scope via students.academy_id
-- ============================================================
DROP POLICY IF EXISTS xp_select ON public.student_xp;
DROP POLICY IF EXISTS xp_upsert ON public.student_xp;
DROP POLICY IF EXISTS xp_update ON public.student_xp;

CREATE POLICY xp_select ON public.student_xp
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.students WHERE public.is_member_of(academy_id)
    )
  );

CREATE POLICY xp_insert ON public.student_xp
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT s.id FROM public.students s
      WHERE s.academy_id IN (
        SELECT m.academy_id FROM public.memberships m
        JOIN public.profiles p ON p.id = m.profile_id
        WHERE p.user_id = auth.uid() AND m.status = 'active'
        AND m.role IN ('admin', 'professor')
      )
    )
  );

CREATE POLICY xp_update ON public.student_xp
  FOR UPDATE USING (
    student_id IN (
      SELECT s.id FROM public.students s
      WHERE s.academy_id IN (
        SELECT m.academy_id FROM public.memberships m
        JOIN public.profiles p ON p.id = m.profile_id
        WHERE p.user_id = auth.uid() AND m.status = 'active'
        AND m.role IN ('admin', 'professor')
      )
    )
  );

-- ============================================================
-- 3. challenge_progress — scope via challenges.academy_id
-- ============================================================
DROP POLICY IF EXISTS cp_select ON public.challenge_progress;

CREATE POLICY cp_select ON public.challenge_progress
  FOR SELECT USING (
    challenge_id IN (
      SELECT id FROM public.challenges WHERE public.is_member_of(academy_id)
    )
  );

CREATE POLICY cp_insert ON public.challenge_progress
  FOR INSERT WITH CHECK (
    challenge_id IN (
      SELECT id FROM public.challenges WHERE public.is_member_of(academy_id)
    )
  );

CREATE POLICY cp_update ON public.challenge_progress
  FOR UPDATE USING (
    challenge_id IN (
      SELECT id FROM public.challenges WHERE public.is_member_of(academy_id)
    )
  );

-- ============================================================
-- 4. feed_likes — scope via feed_posts.academy_id
-- ============================================================
DROP POLICY IF EXISTS likes_select ON public.feed_likes;

CREATE POLICY likes_select ON public.feed_likes
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM public.feed_posts WHERE public.is_member_of(academy_id)
    )
  );

CREATE POLICY likes_insert ON public.feed_likes
  FOR INSERT WITH CHECK (
    -- User can like posts in their academy
    post_id IN (
      SELECT id FROM public.feed_posts WHERE public.is_member_of(academy_id)
    )
    AND profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY likes_delete ON public.feed_likes
  FOR DELETE USING (
    -- User can remove own likes
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. feed_comments — scope via feed_posts.academy_id
-- ============================================================
DROP POLICY IF EXISTS comments_select ON public.feed_comments;

CREATE POLICY comments_select ON public.feed_comments
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM public.feed_posts WHERE public.is_member_of(academy_id)
    )
  );

CREATE POLICY comments_insert ON public.feed_comments
  FOR INSERT WITH CHECK (
    post_id IN (
      SELECT id FROM public.feed_posts WHERE public.is_member_of(academy_id)
    )
    AND profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY comments_delete ON public.feed_comments
  FOR DELETE USING (
    -- User can delete own comments
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- 6. class_notes — scope via classes.academy_id
--    Only professors and admins of the academy can read notes
-- ============================================================
DROP POLICY IF EXISTS notes_select ON public.class_notes;

CREATE POLICY notes_select ON public.class_notes
  FOR SELECT USING (
    class_id IN (
      SELECT c.id FROM public.classes c
      WHERE c.academy_id IN (
        SELECT m.academy_id FROM public.memberships m
        JOIN public.profiles p ON p.id = m.profile_id
        WHERE p.user_id = auth.uid() AND m.status = 'active'
        AND m.role IN ('admin', 'professor')
      )
    )
  );

-- notes_insert and notes_update already exist and check professor_id
-- but let's also ensure academy scoping on insert
DROP POLICY IF EXISTS notes_insert ON public.class_notes;
CREATE POLICY notes_insert ON public.class_notes
  FOR INSERT WITH CHECK (
    professor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND class_id IN (
      SELECT c.id FROM public.classes c WHERE public.is_member_of(c.academy_id)
    )
  );

-- ============================================================
-- 7. Superadmin bypass for all fixed tables
--    Superadmin needs to read everything for platform monitoring
-- ============================================================
CREATE POLICY event_reg_superadmin ON public.event_registrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY xp_superadmin ON public.student_xp
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY cp_superadmin ON public.challenge_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY likes_superadmin ON public.feed_likes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY comments_superadmin ON public.feed_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY notes_superadmin ON public.class_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );
