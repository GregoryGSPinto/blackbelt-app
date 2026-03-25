-- Belt promotions and criteria tables for graduation system
-- Required by graduation.service.ts

CREATE TABLE IF NOT EXISTS belt_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_belt text NOT NULL,
  to_belt text NOT NULL,
  min_attendance integer NOT NULL DEFAULT 30,
  min_months integer NOT NULL DEFAULT 6,
  min_quiz_avg numeric NOT NULL DEFAULT 70,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(from_belt, to_belt)
);

ALTER TABLE belt_criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "belt_criteria_read" ON belt_criteria FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS belt_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academy_id uuid REFERENCES academies(id) ON DELETE CASCADE,
  from_belt text NOT NULL,
  to_belt text NOT NULL,
  proposed_by uuid REFERENCES profiles(id),
  approved_by uuid REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  criteria_met jsonb DEFAULT '{}',
  proposed_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE belt_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "belt_promotions_read" ON belt_promotions FOR SELECT USING (true);
CREATE POLICY "belt_promotions_insert" ON belt_promotions FOR INSERT WITH CHECK (true);
CREATE POLICY "belt_promotions_update" ON belt_promotions FOR UPDATE USING (true);

-- Seed default belt criteria
INSERT INTO belt_criteria (from_belt, to_belt, min_attendance, min_months, min_quiz_avg) VALUES
  ('white', 'gray', 20, 3, 0),
  ('gray', 'yellow', 30, 4, 0),
  ('yellow', 'orange', 40, 5, 50),
  ('orange', 'green', 50, 6, 60),
  ('green', 'blue', 80, 12, 70),
  ('blue', 'purple', 120, 18, 75),
  ('purple', 'brown', 180, 24, 80),
  ('brown', 'black', 240, 36, 85)
ON CONFLICT (from_belt, to_belt) DO NOTHING;
