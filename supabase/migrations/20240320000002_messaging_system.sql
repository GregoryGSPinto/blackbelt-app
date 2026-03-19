-- ============================================================
-- BlackBelt v2 — Messaging System Migration
-- Tables: conversations, messages, broadcast_messages, broadcast_recipients
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- CONVERSATIONS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id     uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  participant_a  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_b  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type           text NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  last_message_text  text,
  last_message_at    timestamptz,
  last_message_by    uuid REFERENCES public.profiles(id),
  is_archived    boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),

  -- One conversation per pair per academy
  CONSTRAINT conversations_unique_pair
    UNIQUE (academy_id, participant_a, participant_b),

  -- Ensure participant_a < participant_b to avoid duplicates
  CONSTRAINT conversations_ordered_participants
    CHECK (participant_a < participant_b)
);

CREATE INDEX idx_conversations_participant_a ON public.conversations(participant_a);
CREATE INDEX idx_conversations_participant_b ON public.conversations(participant_b);
CREATE INDEX idx_conversations_academy ON public.conversations(academy_id);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC NULLS LAST);

-- ────────────────────────────────────────────────────────────
-- MESSAGES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text             text NOT NULL DEFAULT '',
  type             text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
  attachment_url   text,
  read_at          timestamptz,
  metadata         jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);

-- ────────────────────────────────────────────────────────────
-- BROADCAST MESSAGES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.broadcast_messages (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id          uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  sender_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name         text NOT NULL,
  target              text NOT NULL CHECK (target IN ('all', 'all_students', 'all_professors', 'all_parents', 'class', 'belt', 'custom')),
  target_class_id     uuid REFERENCES public.classes(id),
  target_belt         text,
  target_profile_ids  uuid[],
  subject             text,
  text                text NOT NULL,
  total_recipients    integer NOT NULL DEFAULT 0,
  read_count          integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_broadcast_academy ON public.broadcast_messages(academy_id, created_at DESC);
CREATE INDEX idx_broadcast_sender ON public.broadcast_messages(sender_id);

-- ────────────────────────────────────────────────────────────
-- BROADCAST RECIPIENTS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.broadcast_recipients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id  uuid NOT NULL REFERENCES public.broadcast_messages(id) ON DELETE CASCADE,
  recipient_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at       timestamptz,

  CONSTRAINT broadcast_recipients_unique
    UNIQUE (broadcast_id, recipient_id)
);

CREATE INDEX idx_broadcast_recipients_recipient ON public.broadcast_recipients(recipient_id);
CREATE INDEX idx_broadcast_recipients_broadcast ON public.broadcast_recipients(broadcast_id);

-- ────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_recipients ENABLE ROW LEVEL SECURITY;

-- Conversations: participants can see their own conversations
CREATE POLICY conversations_select ON public.conversations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT p.user_id FROM public.profiles p
      WHERE p.id IN (participant_a, participant_b)
    )
  );

CREATE POLICY conversations_insert ON public.conversations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT p.user_id FROM public.profiles p
      WHERE p.id IN (participant_a, participant_b)
    )
  );

CREATE POLICY conversations_update ON public.conversations
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT p.user_id FROM public.profiles p
      WHERE p.id IN (participant_a, participant_b)
    )
  );

-- Messages: conversation participants can see messages
CREATE POLICY messages_select ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND auth.uid() IN (
        SELECT p.user_id FROM public.profiles p
        WHERE p.id IN (c.participant_a, c.participant_b)
      )
    )
  );

CREATE POLICY messages_insert ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT p.user_id FROM public.profiles p WHERE p.id = sender_id)
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND auth.uid() IN (
        SELECT p2.user_id FROM public.profiles p2
        WHERE p2.id IN (c.participant_a, c.participant_b)
      )
    )
  );

-- Broadcast messages: academy members can see broadcasts
CREATE POLICY broadcast_messages_select ON public.broadcast_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.academy_id = broadcast_messages.academy_id
      AND p.user_id = auth.uid()
      AND m.status = 'active'
    )
  );

CREATE POLICY broadcast_messages_insert ON public.broadcast_messages
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT p.user_id FROM public.profiles p WHERE p.id = sender_id)
  );

-- Broadcast recipients: recipients can see their own entries
CREATE POLICY broadcast_recipients_select ON public.broadcast_recipients
  FOR SELECT USING (
    auth.uid() = (SELECT p.user_id FROM public.profiles p WHERE p.id = recipient_id)
  );

CREATE POLICY broadcast_recipients_insert ON public.broadcast_recipients
  FOR INSERT WITH CHECK (true);

CREATE POLICY broadcast_recipients_update ON public.broadcast_recipients
  FOR UPDATE USING (
    auth.uid() = (SELECT p.user_id FROM public.profiles p WHERE p.id = recipient_id)
  );

-- ────────────────────────────────────────────────────────────
-- TRIGGER: update conversation on new message
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS trigger AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message_text = NEW.text,
    last_message_at = NEW.created_at,
    last_message_by = NEW.sender_id,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- ────────────────────────────────────────────────────────────
-- TRIGGER: increment broadcast read_count
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_broadcast_read_count()
RETURNS trigger AS $$
BEGIN
  IF NEW.read_at IS NOT NULL AND (OLD.read_at IS NULL) THEN
    UPDATE public.broadcast_messages
    SET read_count = read_count + 1
    WHERE id = NEW.broadcast_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_broadcast_read_count
  AFTER UPDATE ON public.broadcast_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_broadcast_read_count();
