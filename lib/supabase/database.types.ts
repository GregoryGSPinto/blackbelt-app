// ============================================================
// BlackBelt v2 — Supabase Database Types (auto-generated placeholder)
// Run: pnpm supabase gen types typescript > lib/supabase/database.types.ts
// to generate real types from your Supabase project.
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; user_id: string; role: string; display_name: string; avatar: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      academies: {
        Row: { id: string; name: string; slug: string; owner_id: string; plan_id: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['academies']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['academies']['Insert']>;
      };
      units: {
        Row: { id: string; academy_id: string; name: string; address: string; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['units']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['units']['Insert']>;
      };
      memberships: {
        Row: { id: string; profile_id: string; academy_id: string; role: string; status: string; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['memberships']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['memberships']['Insert']>;
      };
      modalities: {
        Row: { id: string; academy_id: string; name: string; belt_required: string; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['modalities']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['modalities']['Insert']>;
      };
      students: {
        Row: { id: string; profile_id: string; academy_id: string; belt: string; started_at: string; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['students']['Insert']>;
      };
      guardians: {
        Row: { id: string; guardian_profile_id: string; student_id: string; relation: string; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['guardians']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['guardians']['Insert']>;
      };
      classes: {
        Row: { id: string; modality_id: string; unit_id: string; professor_id: string; schedule: unknown; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['classes']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['classes']['Insert']>;
      };
      class_enrollments: {
        Row: { id: string; student_id: string; class_id: string; status: string; enrolled_at: string; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['class_enrollments']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['class_enrollments']['Insert']>;
      };
      attendance: {
        Row: { id: string; student_id: string; class_id: string; checked_at: string; method: string; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>;
      };
      progressions: {
        Row: { id: string; student_id: string; evaluated_by: string; from_belt: string; to_belt: string; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['progressions']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['progressions']['Insert']>;
      };
      evaluations: {
        Row: { id: string; student_id: string; class_id: string; criteria: string; score: number; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['evaluations']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['evaluations']['Insert']>;
      };
      videos: {
        Row: { id: string; academy_id: string; title: string; description: string | null; url: string; belt_level: string; duration: number; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['videos']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['videos']['Insert']>;
      };
      series: {
        Row: { id: string; academy_id: string; title: string; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['series']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['series']['Insert']>;
      };
      achievements: {
        Row: { id: string; student_id: string; type: string; granted_at: string; granted_by: string; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>;
      };
      messages: {
        Row: { id: string; from_id: string; to_id: string; channel: string; content: string; read_at: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      notifications: {
        Row: { id: string; user_id: string; type: string; title: string; body: string | null; read: boolean; created_at: string };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      plans: {
        Row: { id: string; academy_id: string; name: string; price: number; interval: string; features: unknown; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['plans']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['plans']['Insert']>;
      };
      subscriptions: {
        Row: { id: string; student_id: string; plan_id: string; status: string; current_period_end: string; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      invoices: {
        Row: { id: string; subscription_id: string; amount: number; status: string; due_date: string; paid_at: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
