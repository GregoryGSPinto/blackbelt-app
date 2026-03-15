export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      academies: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          plan_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          plan_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          plan_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          granted_at: string
          granted_by: string
          id: string
          name: string | null
          rarity: string | null
          student_id: string
          type: string
          updated_at: string
          xp_reward: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          granted_at?: string
          granted_by: string
          id?: string
          name?: string | null
          rarity?: string | null
          student_id: string
          type: string
          updated_at?: string
          xp_reward?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          granted_at?: string
          granted_by?: string
          id?: string
          name?: string | null
          rarity?: string | null
          student_id?: string
          type?: string
          updated_at?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          checked_at: string
          class_id: string
          created_at: string
          id: string
          method: string
          student_id: string
          updated_at: string
        }
        Insert: {
          checked_at?: string
          class_id: string
          created_at?: string
          id?: string
          method?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          checked_at?: string
          class_id?: string
          created_at?: string
          id?: string
          method?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean
          completed_at: string | null
          current: number
          id: string
          student_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          completed_at?: string | null
          current?: number
          id?: string
          student_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          completed_at?: string | null
          current?: number
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          academy_id: string
          active: boolean
          created_at: string
          description: string | null
          end_date: string
          id: string
          metric: string
          start_date: string
          target: number
          title: string
          xp_reward: number
        }
        Insert: {
          academy_id: string
          active?: boolean
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          metric: string
          start_date: string
          target: number
          title: string
          xp_reward?: number
        }
        Update: {
          academy_id?: string
          active?: boolean
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          metric?: string
          start_date?: string
          target?: number
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenges_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      class_enrollments: {
        Row: {
          class_id: string
          created_at: string
          enrolled_at: string
          id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      class_notes: {
        Row: {
          class_id: string
          content: string
          created_at: string
          id: string
          note_date: string
          professor_id: string
          student_id: string | null
          updated_at: string
        }
        Insert: {
          class_id: string
          content: string
          created_at?: string
          id?: string
          note_date?: string
          professor_id: string
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string
          content?: string
          created_at?: string
          id?: string
          note_date?: string
          professor_id?: string
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_notes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_notes_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academy_id: string | null
          capacity: number
          created_at: string
          id: string
          modality_id: string
          name: string
          professor_id: string
          schedule: Json
          unit_id: string
          updated_at: string
        }
        Insert: {
          academy_id?: string | null
          capacity?: number
          created_at?: string
          id?: string
          modality_id: string
          name?: string
          professor_id: string
          schedule?: Json
          unit_id: string
          updated_at?: string
        }
        Update: {
          academy_id?: string | null
          capacity?: number
          created_at?: string
          id?: string
          modality_id?: string
          name?: string
          professor_id?: string
          schedule?: Json
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "modalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          class_id: string
          consistency: number | null
          created_at: string
          criteria: string
          id: string
          observation: string | null
          score: number
          student_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          consistency?: number | null
          created_at?: string
          criteria: string
          id?: string
          observation?: string | null
          score: number
          student_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          consistency?: number | null
          created_at?: string
          criteria?: string
          id?: string
          observation?: string | null
          score?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          student_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          academy_id: string
          created_at: string
          date: string
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          max_slots: number | null
          price: number | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          date: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          max_slots?: number | null
          price?: number | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          date?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          max_slots?: number | null
          price?: number | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          profile_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          profile_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          academy_id: string
          author_id: string | null
          comments_count: number
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          pinned: boolean
          type: string
        }
        Insert: {
          academy_id: string
          author_id?: string | null
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          pinned?: boolean
          type: string
        }
        Update: {
          academy_id?: string
          author_id?: string | null
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          pinned?: boolean
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          created_at: string
          guardian_profile_id: string
          id: string
          relation: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guardian_profile_id: string
          id?: string
          relation: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guardian_profile_id?: string
          id?: string
          relation?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardians_guardian_profile_id_fkey"
            columns: ["guardian_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          paid_at: string | null
          status: string
          subscription_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          paid_at?: string | null
          status?: string
          subscription_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          paid_at?: string | null
          status?: string
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          academy_id: string
          created_at: string
          email: string | null
          experimental_date: string | null
          id: string
          modality: string | null
          name: string
          notes: string | null
          origin: string
          phone: string | null
          referred_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          email?: string | null
          experimental_date?: string | null
          id?: string
          modality?: string | null
          name: string
          notes?: string | null
          origin: string
          phone?: string | null
          referred_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          email?: string | null
          experimental_date?: string | null
          id?: string
          modality?: string | null
          name?: string
          notes?: string | null
          origin?: string
          phone?: string | null
          referred_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          academy_id: string
          created_at: string
          id: string
          profile_id: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          id?: string
          profile_id: string
          role: string
          status?: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          id?: string
          profile_id?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          channel: string
          content: string
          created_at: string
          from_id: string
          id: string
          read_at: string | null
          to_id: string
          updated_at: string
        }
        Insert: {
          channel?: string
          content: string
          created_at?: string
          from_id: string
          id?: string
          read_at?: string | null
          to_id: string
          updated_at?: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          from_id?: string
          id?: string
          read_at?: string | null
          to_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      modalities: {
        Row: {
          academy_id: string
          belt_required: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          belt_required?: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          belt_required?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modalities_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      nps_responses: {
        Row: {
          academy_id: string
          created_at: string
          feedback: string | null
          id: string
          score: number
          student_id: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          score: number
          student_id: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          score?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nps_responses_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nps_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          academy_id: string
          created_at: string
          features: Json
          id: string
          interval: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          features?: Json
          id?: string
          interval: string
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          features?: Json
          id?: string
          interval?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          display_name: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          display_name: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          display_name?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progressions: {
        Row: {
          created_at: string
          evaluated_by: string
          from_belt: string
          id: string
          student_id: string
          to_belt: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          evaluated_by: string
          from_belt: string
          id?: string
          student_id: string
          to_belt: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          evaluated_by?: string
          from_belt?: string
          id?: string
          student_id?: string
          to_belt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progressions_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progressions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      series: {
        Row: {
          academy_id: string
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      series_videos: {
        Row: {
          id: string
          position: number
          series_id: string
          video_id: string
        }
        Insert: {
          id?: string
          position?: number
          series_id: string
          video_id: string
        }
        Update: {
          id?: string
          position?: number
          series_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_videos_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "series_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      student_xp: {
        Row: {
          id: string
          level: number
          student_id: string
          title: string | null
          updated_at: string
          xp: number
        }
        Insert: {
          id?: string
          level?: number
          student_id: string
          title?: string | null
          updated_at?: string
          xp?: number
        }
        Update: {
          id?: string
          level?: number
          student_id?: string
          title?: string | null
          updated_at?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_xp_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academy_id: string
          belt: string
          created_at: string
          id: string
          profile_id: string
          started_at: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          belt?: string
          created_at?: string
          id?: string
          profile_id: string
          started_at?: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          belt?: string
          created_at?: string
          id?: string
          profile_id?: string
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          id: string
          plan_id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          id?: string
          plan_id: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          id?: string
          plan_id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          academy_id: string
          address: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          address: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          address?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      video_progress: {
        Row: {
          id: string
          last_watched_at: string
          progress: number
          student_id: string
          video_id: string
        }
        Insert: {
          id?: string
          last_watched_at?: string
          progress?: number
          student_id: string
          video_id: string
        }
        Update: {
          id?: string
          last_watched_at?: string
          progress?: number
          student_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          academy_id: string
          belt_level: string
          created_at: string
          description: string | null
          duration: number
          id: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          academy_id: string
          belt_level?: string
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          academy_id?: string
          belt_level?: string
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      date_utc: { Args: { ts: string }; Returns: string }
      get_academy_id: { Args: never; Returns: string }
      get_current_user_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      is_member_of: { Args: { p_academy_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
