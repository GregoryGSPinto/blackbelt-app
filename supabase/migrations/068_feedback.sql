CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid REFERENCES academies(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'suggestion' CHECK (type IN ('suggestion','bug','praise','complaint','other')),
  message text NOT NULL,
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  page_url text,
  user_agent text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','replied','resolved')),
  admin_reply text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_access" ON user_feedback FOR ALL USING (academy_id IN (SELECT public.get_my_academy_ids()));
CREATE INDEX idx_feedback_academy ON user_feedback(academy_id);
CREATE INDEX idx_feedback_status ON user_feedback(academy_id, status);
