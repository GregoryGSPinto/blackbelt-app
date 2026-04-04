// ============================================================
// BlackBelt v2 — Messaging Types
// Conversations, Messages, Broadcasts
// ============================================================

import { Role } from './domain';

// ────────────────────────────────────────────────────────────
// ENUMS / UNION TYPES
// ────────────────────────────────────────────────────────────

/** Tipo de mensagem */
export type MessageType = 'text' | 'image' | 'file' | 'system';

/** Tipo de conversa */
export type ConversationType = 'direct' | 'group';

/** Alvo de um broadcast */
export type MessageTarget =
  | 'all'
  | 'all_students'
  | 'all_professors'
  | 'all_parents'
  | 'class'
  | 'belt'
  | 'custom';

/** Roles do usuário (re-export para conveniência) */
export type UserRole = Role;

// ────────────────────────────────────────────────────────────
// CONTACT
// ────────────────────────────────────────────────────────────

export interface Contact {
  profile_id: string;
  display_name: string;
  avatar_url: string | null;
  role: Role;
  role_badge: string;
  classes_in_common: string[];
  children_linked: string[];
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

// ────────────────────────────────────────────────────────────
// CONVERSATION
// ────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  academy_id: string;
  participant_a: string;
  participant_b: string;
  other_participant: Contact;
  type: ConversationType;
  last_message_text: string | null;
  last_message_at: string | null;
  last_message_by: string | null;
  unread_count: number;
  is_archived: boolean;
  created_at: string;
}

// ────────────────────────────────────────────────────────────
// MESSAGE
// ────────────────────────────────────────────────────────────

export interface MessageMetadata {
  file_name?: string;
  file_size?: number;
  image_width?: number;
  image_height?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  type: MessageType;
  attachment_url: string | null;
  read_at: string | null;
  metadata: MessageMetadata | null;
  created_at: string;
  deleted_at: string | null;
}

// ────────────────────────────────────────────────────────────
// BROADCAST
// ────────────────────────────────────────────────────────────

export interface BroadcastMessage {
  id: string;
  academy_id: string;
  sender_id: string;
  sender_name: string;
  target: MessageTarget;
  target_class_id: string | null;
  target_belt: string | null;
  target_profile_ids: string[] | null;
  subject: string | null;
  text: string;
  total_recipients: number;
  read_count: number;
  created_at: string;
}

export interface BroadcastRecipient {
  id: string;
  broadcast_id: string;
  recipient_id: string;
  read_at: string | null;
}

// ────────────────────────────────────────────────────────────
// SERVICE PARAMS (optional helper types)
// ────────────────────────────────────────────────────────────

export interface SendBroadcastOptions {
  subject?: string;
  target_class_id?: string;
  target_belt?: string;
  target_profile_ids?: string[];
}
