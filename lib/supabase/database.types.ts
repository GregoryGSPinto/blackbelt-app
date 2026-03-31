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
          acknowledged: boolean | null
          acknowledged_at: string | null
          asaas_customer_id: string | null
          asaas_subaccount_api_key: string | null
          asaas_subaccount_id: string | null
          asaas_subaccount_status: string | null
          asaas_subaccount_wallet_id: string | null
          asaas_subscription_id: string | null
          bank_account: string | null
          bank_account_configured: boolean | null
          bank_account_digit: string | null
          bank_account_type: string | null
          bank_agency: string | null
          bank_code: string | null
          bank_company_type: string | null
          bank_owner_birth_date: string | null
          bank_owner_cpf_cnpj: string | null
          bank_owner_email: string | null
          bank_owner_name: string | null
          bank_owner_phone: string | null
          billing_address_cep: string | null
          billing_address_city: string | null
          billing_address_complement: string | null
          billing_address_neighborhood: string | null
          billing_address_number: string | null
          billing_address_state: string | null
          billing_address_street: string | null
          billing_cpf_cnpj: string | null
          billing_email: string | null
          billing_name: string | null
          billing_phone: string | null
          billing_type: string | null
          created_at: string
          id: string
          max_professors: number | null
          max_students: number | null
          name: string
          onboarded_at: string | null
          owner_id: string
          owner_profile_id: string | null
          plan_id: string | null
          settings: Json | null
          slug: string
          status: string | null
          subscription_status: string | null
          terms_accepted_at: string | null
          terms_version: string | null
          trial_converted: boolean | null
          trial_ends_at: string | null
          trial_starts_at: string | null
          updated_at: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          asaas_customer_id?: string | null
          asaas_subaccount_api_key?: string | null
          asaas_subaccount_id?: string | null
          asaas_subaccount_status?: string | null
          asaas_subaccount_wallet_id?: string | null
          asaas_subscription_id?: string | null
          bank_account?: string | null
          bank_account_configured?: boolean | null
          bank_account_digit?: string | null
          bank_account_type?: string | null
          bank_agency?: string | null
          bank_code?: string | null
          bank_company_type?: string | null
          bank_owner_birth_date?: string | null
          bank_owner_cpf_cnpj?: string | null
          bank_owner_email?: string | null
          bank_owner_name?: string | null
          bank_owner_phone?: string | null
          billing_address_cep?: string | null
          billing_address_city?: string | null
          billing_address_complement?: string | null
          billing_address_neighborhood?: string | null
          billing_address_number?: string | null
          billing_address_state?: string | null
          billing_address_street?: string | null
          billing_cpf_cnpj?: string | null
          billing_email?: string | null
          billing_name?: string | null
          billing_phone?: string | null
          billing_type?: string | null
          created_at?: string
          id?: string
          max_professors?: number | null
          max_students?: number | null
          name: string
          onboarded_at?: string | null
          owner_id: string
          owner_profile_id?: string | null
          plan_id?: string | null
          settings?: Json | null
          slug: string
          status?: string | null
          subscription_status?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          trial_converted?: boolean | null
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          asaas_customer_id?: string | null
          asaas_subaccount_api_key?: string | null
          asaas_subaccount_id?: string | null
          asaas_subaccount_status?: string | null
          asaas_subaccount_wallet_id?: string | null
          asaas_subscription_id?: string | null
          bank_account?: string | null
          bank_account_configured?: boolean | null
          bank_account_digit?: string | null
          bank_account_type?: string | null
          bank_agency?: string | null
          bank_code?: string | null
          bank_company_type?: string | null
          bank_owner_birth_date?: string | null
          bank_owner_cpf_cnpj?: string | null
          bank_owner_email?: string | null
          bank_owner_name?: string | null
          bank_owner_phone?: string | null
          billing_address_cep?: string | null
          billing_address_city?: string | null
          billing_address_complement?: string | null
          billing_address_neighborhood?: string | null
          billing_address_number?: string | null
          billing_address_state?: string | null
          billing_address_street?: string | null
          billing_cpf_cnpj?: string | null
          billing_email?: string | null
          billing_name?: string | null
          billing_phone?: string | null
          billing_type?: string | null
          created_at?: string
          id?: string
          max_professors?: number | null
          max_students?: number | null
          name?: string
          onboarded_at?: string | null
          owner_id?: string
          owner_profile_id?: string | null
          plan_id?: string | null
          settings?: Json | null
          slug?: string
          status?: string | null
          subscription_status?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          trial_converted?: boolean | null
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academies_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_contract_templates: {
        Row: {
          academy_address: string | null
          academy_cnpj: string | null
          academy_email: string | null
          academy_id: string
          academy_legal_name: string | null
          academy_phone: string | null
          body_html: string | null
          cancellation_notice_days: number | null
          created_at: string | null
          default_auto_renew: boolean | null
          default_duration_months: number | null
          default_enrollment_fee_cents: number | null
          default_monthly_value_cents: number | null
          default_payment_day: number | null
          default_plan_name: string | null
          grace_period_days: number | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          jurisdiction_city: string | null
          jurisdiction_state: string | null
          late_fee_percent: number | null
          late_interest_monthly: number | null
          minor_clauses_enabled: boolean | null
          name: string
          require_image_consent: boolean | null
          require_injury_waiver: boolean | null
          require_lgpd_consent: boolean | null
          require_medical_clearance: boolean | null
          source: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_file_name: string | null
          uploaded_file_url: string | null
          version: number | null
        }
        Insert: {
          academy_address?: string | null
          academy_cnpj?: string | null
          academy_email?: string | null
          academy_id: string
          academy_legal_name?: string | null
          academy_phone?: string | null
          body_html?: string | null
          cancellation_notice_days?: number | null
          created_at?: string | null
          default_auto_renew?: boolean | null
          default_duration_months?: number | null
          default_enrollment_fee_cents?: number | null
          default_monthly_value_cents?: number | null
          default_payment_day?: number | null
          default_plan_name?: string | null
          grace_period_days?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          jurisdiction_city?: string | null
          jurisdiction_state?: string | null
          late_fee_percent?: number | null
          late_interest_monthly?: number | null
          minor_clauses_enabled?: boolean | null
          name?: string
          require_image_consent?: boolean | null
          require_injury_waiver?: boolean | null
          require_lgpd_consent?: boolean | null
          require_medical_clearance?: boolean | null
          source?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_file_name?: string | null
          uploaded_file_url?: string | null
          version?: number | null
        }
        Update: {
          academy_address?: string | null
          academy_cnpj?: string | null
          academy_email?: string | null
          academy_id?: string
          academy_legal_name?: string | null
          academy_phone?: string | null
          body_html?: string | null
          cancellation_notice_days?: number | null
          created_at?: string | null
          default_auto_renew?: boolean | null
          default_duration_months?: number | null
          default_enrollment_fee_cents?: number | null
          default_monthly_value_cents?: number | null
          default_payment_day?: number | null
          default_plan_name?: string | null
          grace_period_days?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          jurisdiction_city?: string | null
          jurisdiction_state?: string | null
          late_fee_percent?: number | null
          late_interest_monthly?: number | null
          minor_clauses_enabled?: boolean | null
          name?: string
          require_image_consent?: boolean | null
          require_injury_waiver?: boolean | null
          require_lgpd_consent?: boolean | null
          require_medical_clearance?: boolean | null
          source?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_file_name?: string | null
          uploaded_file_url?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_contract_templates_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_contract_templates_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      academy_curricula: {
        Row: {
          academy_id: string
          created_at: string | null
          descricao: string | null
          id: string
          modalidade: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          modalidade: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          modalidade?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_curricula_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_curricula_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      academy_members: {
        Row: {
          academy_id: string
          created_at: string | null
          id: string
          profile_id: string
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          id?: string
          profile_id: string
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          id?: string
          profile_id?: string
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_members_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_members_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "academy_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_onboard_tokens: {
        Row: {
          academy_name: string
          created_at: string | null
          created_by: string
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          notes: string | null
          plan_id: string | null
          token: string
          trial_days: number | null
        }
        Insert: {
          academy_name: string
          created_at?: string | null
          created_by: string
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          notes?: string | null
          plan_id?: string | null
          token: string
          trial_days?: number | null
        }
        Update: {
          academy_name?: string
          created_at?: string | null
          created_by?: string
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          notes?: string | null
          plan_id?: string | null
          token?: string
          trial_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_onboard_tokens_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_onboard_uses: {
        Row: {
          academy_id: string
          id: string
          profile_id: string
          token_id: string
          used_at: string | null
        }
        Insert: {
          academy_id: string
          id?: string
          profile_id: string
          token_id: string
          used_at?: string | null
        }
        Update: {
          academy_id?: string
          id?: string
          profile_id?: string
          token_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_onboard_uses_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_onboard_uses_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "academy_onboard_uses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_onboard_uses_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "academy_onboard_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_subscriptions: {
        Row: {
          academy_id: string
          additional_professors: number | null
          additional_units: number | null
          asaas_customer_id: string | null
          asaas_subscription_id: string | null
          billing_cycle: string | null
          billing_type: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          discovery_ends_at: string | null
          id: string
          next_due_date: string | null
          package_id: string | null
          paid_modules: string[] | null
          plan_id: string | null
          plan_name: string | null
          plan_started_at: string | null
          price_cents: number | null
          status: string | null
          tier_id: string
          total_price: number
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          additional_professors?: number | null
          additional_units?: number | null
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          billing_cycle?: string | null
          billing_type?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          discovery_ends_at?: string | null
          id?: string
          next_due_date?: string | null
          package_id?: string | null
          paid_modules?: string[] | null
          plan_id?: string | null
          plan_name?: string | null
          plan_started_at?: string | null
          price_cents?: number | null
          status?: string | null
          tier_id: string
          total_price: number
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          additional_professors?: number | null
          additional_units?: number | null
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          billing_cycle?: string | null
          billing_type?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          discovery_ends_at?: string | null
          id?: string
          next_due_date?: string | null
          package_id?: string | null
          paid_modules?: string[] | null
          plan_id?: string | null
          plan_name?: string | null
          plan_started_at?: string | null
          price_cents?: number | null
          status?: string | null
          tier_id?: string
          total_price?: number
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_subscriptions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_subscriptions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "academy_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "pricing_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "pricing_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_teen_config: {
        Row: {
          academy_id: string
          created_at: string | null
          id: string
          teen_can_edit_personal_data: boolean | null
          teen_can_participate_general_ranking: boolean | null
          teen_can_receive_direct_notifications: boolean | null
          teen_can_self_checkin: boolean | null
          teen_can_view_payments: boolean | null
          teen_can_view_schedule: boolean | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          id?: string
          teen_can_edit_personal_data?: boolean | null
          teen_can_participate_general_ranking?: boolean | null
          teen_can_receive_direct_notifications?: boolean | null
          teen_can_self_checkin?: boolean | null
          teen_can_view_payments?: boolean | null
          teen_can_view_schedule?: boolean | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          id?: string
          teen_can_edit_personal_data?: boolean | null
          teen_can_participate_general_ranking?: boolean | null
          teen_can_receive_direct_notifications?: boolean | null
          teen_can_self_checkin?: boolean | null
          teen_can_view_payments?: boolean | null
          teen_can_view_schedule?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_teen_config_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_teen_config_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      academy_tournament_stats: {
        Row: {
          academy_id: string
          academy_name: string
          bronze: number | null
          created_at: string | null
          gold: number | null
          id: string
          losses: number | null
          points: number | null
          ranking_position: number | null
          silver: number | null
          submissions: number | null
          total_athletes: number | null
          total_fights: number | null
          tournament_id: string
          updated_at: string | null
          wins: number | null
        }
        Insert: {
          academy_id: string
          academy_name: string
          bronze?: number | null
          created_at?: string | null
          gold?: number | null
          id?: string
          losses?: number | null
          points?: number | null
          ranking_position?: number | null
          silver?: number | null
          submissions?: number | null
          total_athletes?: number | null
          total_fights?: number | null
          tournament_id: string
          updated_at?: string | null
          wins?: number | null
        }
        Update: {
          academy_id?: string
          academy_name?: string
          bronze?: number | null
          created_at?: string | null
          gold?: number | null
          id?: string
          losses?: number | null
          points?: number | null
          ranking_position?: number | null
          silver?: number | null
          submissions?: number | null
          total_athletes?: number | null
          total_fights?: number | null
          tournament_id?: string
          updated_at?: string | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_tournament_stats_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_tournament_stats_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "academy_tournament_stats_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      access_events: {
        Row: {
          allowed: boolean | null
          created_at: string | null
          direction: string | null
          id: string
          method: string | null
          reason: string | null
          student_id: string
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          allowed?: boolean | null
          created_at?: string | null
          direction?: string | null
          id?: string
          method?: string | null
          reason?: string | null
          student_id: string
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          allowed?: boolean | null
          created_at?: string | null
          direction?: string | null
          id?: string
          method?: string | null
          reason?: string | null
          student_id?: string
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_events_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      access_rules: {
        Row: {
          config: Json | null
          created_at: string | null
          enabled: boolean | null
          id: string
          name: string
          type: string | null
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          type?: string | null
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          type?: string | null
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_rules_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      account_deletion_log: {
        Row: {
          email_hash: string
          expires_at: string | null
          id: string
          ip_address: string | null
          profiles_archived: string[] | null
          requested_at: string
          user_id: string
        }
        Insert: {
          email_hash: string
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          profiles_archived?: string[] | null
          requested_at?: string
          user_id: string
        }
        Update: {
          email_hash?: string
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          profiles_archived?: string[] | null
          requested_at?: string
          user_id?: string
        }
        Relationships: []
      }
      achievement_definitions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          requirement: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          requirement?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          requirement?: number | null
          updated_at?: string | null
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
      achievements_v2: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          earned_at: string | null
          icon: string | null
          id: string
          is_earned: boolean | null
          name: string
          progress_label: string | null
          progress_percent: number | null
          rarity: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          is_earned?: boolean | null
          name: string
          progress_label?: string | null
          progress_percent?: number | null
          rarity?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          is_earned?: boolean | null
          name?: string
          progress_label?: string | null
          progress_percent?: number | null
          rarity?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_v2_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      active_sessions: {
        Row: {
          academy_id: string | null
          created_at: string | null
          current_page: string | null
          device_type: string | null
          id: string
          ip: string | null
          last_activity_at: string | null
          updated_at: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          academy_id?: string | null
          created_at?: string | null
          current_page?: string | null
          device_type?: string | null
          id?: string
          ip?: string | null
          last_activity_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          academy_id?: string | null
          created_at?: string | null
          current_page?: string | null
          device_type?: string | null
          id?: string
          ip?: string | null
          last_activity_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_sessions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_sessions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "active_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_device_snapshots: {
        Row: {
          academy_id: string | null
          breakpoint: string | null
          browser_name: string | null
          browser_version: string | null
          captured_at: string
          created_at: string
          device_model: string | null
          device_type: Database["public"]["Enums"]["platform_device_type"]
          device_vendor: string | null
          id: string
          layout_risk_reason: string | null
          layout_risk_score: number | null
          metadata: Json
          orientation: string | null
          origin: Database["public"]["Enums"]["platform_event_origin"]
          os_name: string | null
          os_version: string | null
          pixel_ratio: number | null
          profile_id: string | null
          release_version: string | null
          route_path: string | null
          screen_height: number | null
          screen_width: number | null
          session_key: string
          user_id: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          academy_id?: string | null
          breakpoint?: string | null
          browser_name?: string | null
          browser_version?: string | null
          captured_at?: string
          created_at?: string
          device_model?: string | null
          device_type?: Database["public"]["Enums"]["platform_device_type"]
          device_vendor?: string | null
          id?: string
          layout_risk_reason?: string | null
          layout_risk_score?: number | null
          metadata?: Json
          orientation?: string | null
          origin?: Database["public"]["Enums"]["platform_event_origin"]
          os_name?: string | null
          os_version?: string | null
          pixel_ratio?: number | null
          profile_id?: string | null
          release_version?: string | null
          route_path?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_key: string
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          academy_id?: string | null
          breakpoint?: string | null
          browser_name?: string | null
          browser_version?: string | null
          captured_at?: string
          created_at?: string
          device_model?: string | null
          device_type?: Database["public"]["Enums"]["platform_device_type"]
          device_vendor?: string | null
          id?: string
          layout_risk_reason?: string | null
          layout_risk_score?: number | null
          metadata?: Json
          orientation?: string | null
          origin?: Database["public"]["Enums"]["platform_event_origin"]
          os_name?: string | null
          os_version?: string | null
          pixel_ratio?: number | null
          profile_id?: string | null
          release_version?: string | null
          route_path?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_key?: string
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "app_device_snapshots_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_device_snapshots_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "app_device_snapshots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_error_events: {
        Row: {
          academy_id: string | null
          app_version: string | null
          browser_name: string | null
          created_at: string
          device_type: Database["public"]["Enums"]["platform_device_type"]
          error_code: string | null
          error_type: string
          fingerprint: string | null
          id: string
          message: string
          metadata: Json
          occurred_at: string
          origin: Database["public"]["Enums"]["platform_event_origin"]
          os_name: string | null
          profile_id: string | null
          release_version: string | null
          route_path: string | null
          session_key: string | null
          severity: Database["public"]["Enums"]["platform_severity"]
          user_id: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          academy_id?: string | null
          app_version?: string | null
          browser_name?: string | null
          created_at?: string
          device_type?: Database["public"]["Enums"]["platform_device_type"]
          error_code?: string | null
          error_type: string
          fingerprint?: string | null
          id?: string
          message: string
          metadata?: Json
          occurred_at?: string
          origin?: Database["public"]["Enums"]["platform_event_origin"]
          os_name?: string | null
          profile_id?: string | null
          release_version?: string | null
          route_path?: string | null
          session_key?: string | null
          severity?: Database["public"]["Enums"]["platform_severity"]
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          academy_id?: string | null
          app_version?: string | null
          browser_name?: string | null
          created_at?: string
          device_type?: Database["public"]["Enums"]["platform_device_type"]
          error_code?: string | null
          error_type?: string
          fingerprint?: string | null
          id?: string
          message?: string
          metadata?: Json
          occurred_at?: string
          origin?: Database["public"]["Enums"]["platform_event_origin"]
          os_name?: string | null
          profile_id?: string | null
          release_version?: string | null
          route_path?: string | null
          session_key?: string | null
          severity?: Database["public"]["Enums"]["platform_severity"]
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "app_error_events_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_error_events_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "app_error_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_performance_metrics: {
        Row: {
          academy_id: string | null
          api_latency_ms: number | null
          app_version: string | null
          breakpoint: string | null
          cls: number | null
          created_at: string
          device_type: Database["public"]["Enums"]["platform_device_type"]
          fcp_ms: number | null
          fid_ms: number | null
          id: string
          inp_ms: number | null
          lcp_ms: number | null
          load_time_ms: number | null
          metadata: Json
          origin: Database["public"]["Enums"]["platform_event_origin"]
          profile_id: string | null
          recorded_at: string
          release_version: string | null
          render_duration_ms: number | null
          route_path: string
          screen_name: string | null
          session_key: string | null
          ttfb_ms: number | null
          user_id: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          academy_id?: string | null
          api_latency_ms?: number | null
          app_version?: string | null
          breakpoint?: string | null
          cls?: number | null
          created_at?: string
          device_type?: Database["public"]["Enums"]["platform_device_type"]
          fcp_ms?: number | null
          fid_ms?: number | null
          id?: string
          inp_ms?: number | null
          lcp_ms?: number | null
          load_time_ms?: number | null
          metadata?: Json
          origin?: Database["public"]["Enums"]["platform_event_origin"]
          profile_id?: string | null
          recorded_at?: string
          release_version?: string | null
          render_duration_ms?: number | null
          route_path: string
          screen_name?: string | null
          session_key?: string | null
          ttfb_ms?: number | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          academy_id?: string | null
          api_latency_ms?: number | null
          app_version?: string | null
          breakpoint?: string | null
          cls?: number | null
          created_at?: string
          device_type?: Database["public"]["Enums"]["platform_device_type"]
          fcp_ms?: number | null
          fid_ms?: number | null
          id?: string
          inp_ms?: number | null
          lcp_ms?: number | null
          load_time_ms?: number | null
          metadata?: Json
          origin?: Database["public"]["Enums"]["platform_event_origin"]
          profile_id?: string | null
          recorded_at?: string
          release_version?: string | null
          render_duration_ms?: number | null
          route_path?: string
          screen_name?: string | null
          session_key?: string | null
          ttfb_ms?: number | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "app_performance_metrics_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_performance_metrics_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "app_performance_metrics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_telemetry_events: {
        Row: {
          academy_id: string | null
          app_version: string | null
          breakpoint: string | null
          created_at: string
          device_type: Database["public"]["Enums"]["platform_device_type"]
          duration_ms: number | null
          event_name: string
          happened_at: string
          id: string
          metadata: Json
          origin: Database["public"]["Enums"]["platform_event_origin"]
          profile_id: string | null
          release_version: string | null
          route_path: string | null
          screen_name: string | null
          session_key: string
          user_id: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          academy_id?: string | null
          app_version?: string | null
          breakpoint?: string | null
          created_at?: string
          device_type?: Database["public"]["Enums"]["platform_device_type"]
          duration_ms?: number | null
          event_name: string
          happened_at?: string
          id?: string
          metadata?: Json
          origin?: Database["public"]["Enums"]["platform_event_origin"]
          profile_id?: string | null
          release_version?: string | null
          route_path?: string | null
          screen_name?: string | null
          session_key: string
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          academy_id?: string | null
          app_version?: string | null
          breakpoint?: string | null
          created_at?: string
          device_type?: Database["public"]["Enums"]["platform_device_type"]
          duration_ms?: number | null
          event_name?: string
          happened_at?: string
          id?: string
          metadata?: Json
          origin?: Database["public"]["Enums"]["platform_event_origin"]
          profile_id?: string | null
          release_version?: string | null
          route_path?: string | null
          screen_name?: string | null
          session_key?: string
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "app_telemetry_events_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_telemetry_events_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "app_telemetry_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_telemetry_sessions: {
        Row: {
          academy_id: string | null
          app_version: string | null
          browser_name: string | null
          browser_version: string | null
          connection_effective_type: string | null
          created_at: string
          current_route: string | null
          device_model: string | null
          device_type: Database["public"]["Enums"]["platform_device_type"]
          device_vendor: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          is_active: boolean
          last_error_route: string | null
          last_seen_at: string
          locale: string | null
          metadata: Json
          origin: Database["public"]["Enums"]["platform_event_origin"]
          os_name: string | null
          os_version: string | null
          pages_viewed: number | null
          pixel_ratio: number | null
          profile_id: string | null
          release_version: string | null
          screen_height: number | null
          screen_width: number | null
          session_key: string
          started_at: string
          timezone: string | null
          total_events: number | null
          updated_at: string
          user_id: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          academy_id?: string | null
          app_version?: string | null
          browser_name?: string | null
          browser_version?: string | null
          connection_effective_type?: string | null
          created_at?: string
          current_route?: string | null
          device_model?: string | null
          device_type?: Database["public"]["Enums"]["platform_device_type"]
          device_vendor?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean
          last_error_route?: string | null
          last_seen_at?: string
          locale?: string | null
          metadata?: Json
          origin?: Database["public"]["Enums"]["platform_event_origin"]
          os_name?: string | null
          os_version?: string | null
          pages_viewed?: number | null
          pixel_ratio?: number | null
          profile_id?: string | null
          release_version?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_key: string
          started_at?: string
          timezone?: string | null
          total_events?: number | null
          updated_at?: string
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          academy_id?: string | null
          app_version?: string | null
          browser_name?: string | null
          browser_version?: string | null
          connection_effective_type?: string | null
          created_at?: string
          current_route?: string | null
          device_model?: string | null
          device_type?: Database["public"]["Enums"]["platform_device_type"]
          device_vendor?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean
          last_error_route?: string | null
          last_seen_at?: string
          locale?: string | null
          metadata?: Json
          origin?: Database["public"]["Enums"]["platform_event_origin"]
          os_name?: string | null
          os_version?: string | null
          pages_viewed?: number | null
          pixel_ratio?: number | null
          profile_id?: string | null
          release_version?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_key?: string
          started_at?: string
          timezone?: string | null
          total_events?: number | null
          updated_at?: string
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "app_telemetry_sessions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_telemetry_sessions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "app_telemetry_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      architecture_decisions: {
        Row: {
          adr_number: number
          consequences: string | null
          context: string | null
          created_at: string | null
          decision: string | null
          id: string
          options_considered: Json | null
          product: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          adr_number?: number
          consequences?: string | null
          context?: string | null
          created_at?: string | null
          decision?: string | null
          id?: string
          options_considered?: Json | null
          product?: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          adr_number?: number
          consequences?: string | null
          context?: string | null
          created_at?: string | null
          decision?: string | null
          id?: string
          options_considered?: Json | null
          product?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      athlete_profiles: {
        Row: {
          academy_id: string | null
          academy_name: string | null
          age_group: string | null
          belt: string | null
          bronze_medals: number | null
          created_at: string | null
          draws: number | null
          full_name: string
          gold_medals: number | null
          id: string
          losses: number | null
          modality: string | null
          nickname: string | null
          photo_url: string | null
          ranking_points: number | null
          ranking_position: number | null
          silver_medals: number | null
          submissions: number | null
          submissions_suffered: number | null
          total_fights: number | null
          updated_at: string | null
          user_id: string
          weight: number | null
          weight_class: string | null
          win_rate: number | null
          wins: number | null
        }
        Insert: {
          academy_id?: string | null
          academy_name?: string | null
          age_group?: string | null
          belt?: string | null
          bronze_medals?: number | null
          created_at?: string | null
          draws?: number | null
          full_name: string
          gold_medals?: number | null
          id?: string
          losses?: number | null
          modality?: string | null
          nickname?: string | null
          photo_url?: string | null
          ranking_points?: number | null
          ranking_position?: number | null
          silver_medals?: number | null
          submissions?: number | null
          submissions_suffered?: number | null
          total_fights?: number | null
          updated_at?: string | null
          user_id: string
          weight?: number | null
          weight_class?: string | null
          win_rate?: number | null
          wins?: number | null
        }
        Update: {
          academy_id?: string | null
          academy_name?: string | null
          age_group?: string | null
          belt?: string | null
          bronze_medals?: number | null
          created_at?: string | null
          draws?: number | null
          full_name?: string
          gold_medals?: number | null
          id?: string
          losses?: number | null
          modality?: string | null
          nickname?: string | null
          photo_url?: string | null
          ranking_points?: number | null
          ranking_position?: number | null
          silver_medals?: number | null
          submissions?: number | null
          submissions_suffered?: number | null
          total_fights?: number | null
          updated_at?: string | null
          user_id?: string
          weight?: number | null
          weight_class?: string | null
          win_rate?: number | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_profiles_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_profiles_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "athlete_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      audit_entries: {
        Row: {
          academy_id: string | null
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          resource: string | null
          resource_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          academy_id?: string | null
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          resource?: string | null
          resource_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          academy_id?: string | null
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          resource?: string | null
          resource_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_entries_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_entries_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "audit_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          academy_id: string | null
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          profile_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          academy_id?: string | null
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          profile_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          academy_id?: string | null
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          profile_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "audit_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          academy_id: string | null
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          academy_id?: string | null
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          academy_id?: string | null
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      authorizations: {
        Row: {
          created_at: string | null
          description: string | null
          guardian_id: string
          id: string
          requested_at: string | null
          responded_at: string | null
          status: string | null
          student_id: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          guardian_id: string
          id?: string
          requested_at?: string | null
          responded_at?: string | null
          status?: string | null
          student_id: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          guardian_id?: string
          id?: string
          requested_at?: string | null
          responded_at?: string | null
          status?: string | null
          student_id?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "authorizations_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "authorizations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_academies: {
        Row: {
          academy_id: string | null
          beta_end_date: string | null
          beta_start_date: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string | null
          discount_duration: string | null
          discount_percent: number | null
          first_real_usage_at: string | null
          id: string
          metrics_snapshot: Json | null
          notes: string | null
          onboarding_completed_at: string | null
          plan_override: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id?: string | null
          beta_end_date?: string | null
          beta_start_date?: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string | null
          discount_duration?: string | null
          discount_percent?: number | null
          first_real_usage_at?: string | null
          id?: string
          metrics_snapshot?: Json | null
          notes?: string | null
          onboarding_completed_at?: string | null
          plan_override?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string | null
          beta_end_date?: string | null
          beta_start_date?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          discount_duration?: string | null
          discount_percent?: number | null
          first_real_usage_at?: string | null
          id?: string
          metrics_snapshot?: Json | null
          notes?: string | null
          onboarding_completed_at?: string | null
          plan_override?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beta_academies_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beta_academies_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      beta_changelog: {
        Row: {
          changes: Json
          created_at: string | null
          description: string
          id: string
          is_draft: boolean | null
          published_at: string | null
          title: string
          version: string
        }
        Insert: {
          changes?: Json
          created_at?: string | null
          description: string
          id?: string
          is_draft?: boolean | null
          published_at?: string | null
          title: string
          version: string
        }
        Update: {
          changes?: Json
          created_at?: string | null
          description?: string
          id?: string
          is_draft?: boolean | null
          published_at?: string | null
          title?: string
          version?: string
        }
        Relationships: []
      }
      beta_feature_usage: {
        Row: {
          academy_id: string | null
          action: string
          created_at: string | null
          feature_name: string
          id: string
          metadata: Json | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          academy_id?: string | null
          action: string
          created_at?: string | null
          feature_name: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          academy_id?: string | null
          action?: string
          created_at?: string | null
          feature_name?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beta_feature_usage_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beta_feature_usage_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      beta_feedback: {
        Row: {
          academy_id: string | null
          created_at: string | null
          description: string
          device_info: Json | null
          feedback_type: string
          id: string
          page_url: string | null
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          screenshot_url: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          academy_id?: string | null
          created_at?: string | null
          description: string
          device_info?: Json | null
          feedback_type: string
          id?: string
          page_url?: string | null
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          screenshot_url?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          academy_id?: string | null
          created_at?: string | null
          description?: string
          device_info?: Json | null
          feedback_type?: string
          id?: string
          page_url?: string | null
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          screenshot_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beta_feedback_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beta_feedback_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      beta_nps: {
        Row: {
          academy_id: string | null
          created_at: string | null
          favorite_feature: string | null
          id: string
          reason: string | null
          score: number
          survey_trigger: string | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
          what_would_improve: string | null
        }
        Insert: {
          academy_id?: string | null
          created_at?: string | null
          favorite_feature?: string | null
          id?: string
          reason?: string | null
          score: number
          survey_trigger?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
          what_would_improve?: string | null
        }
        Update: {
          academy_id?: string | null
          created_at?: string | null
          favorite_feature?: string | null
          id?: string
          reason?: string | null
          score?: number
          survey_trigger?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
          what_would_improve?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beta_nps_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beta_nps_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      beta_sessions: {
        Row: {
          academy_id: string | null
          actions_count: number | null
          created_at: string | null
          device_type: string | null
          id: string
          pages_visited: Json | null
          session_end: string | null
          session_start: string
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          academy_id?: string | null
          actions_count?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          pages_visited?: Json | null
          session_end?: string | null
          session_start?: string
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          academy_id?: string | null
          actions_count?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          pages_visited?: Json | null
          session_end?: string | null
          session_start?: string
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beta_sessions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beta_sessions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      billing_history: {
        Row: {
          academy_id: string
          amount: number
          created_at: string | null
          description: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          period_end: string | null
          period_start: string | null
          status: string | null
          subscription_id: string | null
        }
        Insert: {
          academy_id: string
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          subscription_id?: string | null
        }
        Update: {
          academy_id?: string
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_history_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "billing_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "academy_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          academy_id: string | null
          amount: number
          created_at: string | null
          due_date: string | null
          id: string
          plan: string | null
          reference_month: string | null
          status: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id?: string | null
          amount?: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          plan?: string | null
          reference_month?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string | null
          amount?: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          plan?: string | null
          reference_month?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bills_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "bills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          academy_id: string
          created_at: string | null
          id: string
          read_count: number | null
          sender_id: string | null
          sender_name: string | null
          subject: string | null
          target: string | null
          target_belt: string | null
          target_class_id: string | null
          target_profile_ids: string[] | null
          text: string
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          id?: string
          read_count?: number | null
          sender_id?: string | null
          sender_name?: string | null
          subject?: string | null
          target?: string | null
          target_belt?: string | null
          target_class_id?: string | null
          target_profile_ids?: string[] | null
          text: string
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          id?: string
          read_count?: number | null
          sender_id?: string | null
          sender_name?: string | null
          subject?: string | null
          target?: string | null
          target_belt?: string | null
          target_class_id?: string | null
          target_profile_ids?: string[] | null
          text?: string
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "broadcasts_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_target_class_id_fkey"
            columns: ["target_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      browser_breakdown: {
        Row: {
          count: number | null
          created_at: string | null
          id: string
          name: string | null
          percentage: number | null
          updated_at: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          id?: string
          name?: string | null
          percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          id?: string
          name?: string | null
          percentage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          connected: boolean | null
          created_at: string | null
          email: string | null
          id: string
          last_sync: string | null
          provider: string | null
          refresh_token: string | null
          synced_classes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_sync?: string | null
          provider?: string | null
          refresh_token?: string | null
          synced_classes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_sync?: string | null
          provider?: string | null
          refresh_token?: string | null
          synced_classes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          {
            foreignKeyName: "challenges_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      checkins: {
        Row: {
          academy_id: string | null
          belt: string | null
          check_in_at: string | null
          check_out_at: string | null
          checked_in_by: string | null
          checkin_type: string | null
          class_name: string | null
          created_at: string | null
          id: string
          person_type: string | null
          profile_id: string | null
          profile_name: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id?: string | null
          belt?: string | null
          check_in_at?: string | null
          check_out_at?: string | null
          checked_in_by?: string | null
          checkin_type?: string | null
          class_name?: string | null
          created_at?: string | null
          id?: string
          person_type?: string | null
          profile_id?: string | null
          profile_name?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string | null
          belt?: string | null
          check_in_at?: string | null
          check_out_at?: string | null
          checked_in_by?: string | null
          checkin_type?: string | null
          class_name?: string | null
          created_at?: string | null
          id?: string
          person_type?: string | null
          profile_id?: string | null
          profile_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkins_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "checkins_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      churn_actions: {
        Row: {
          academy_id: string
          action_type: string
          description: string | null
          id: string
          performed_at: string | null
          performed_by: string | null
          prediction_id: string
        }
        Insert: {
          academy_id: string
          action_type: string
          description?: string | null
          id?: string
          performed_at?: string | null
          performed_by?: string | null
          prediction_id: string
        }
        Update: {
          academy_id?: string
          action_type?: string
          description?: string | null
          id?: string
          performed_at?: string | null
          performed_by?: string | null
          prediction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "churn_actions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "churn_actions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "churn_actions_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "churn_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      churn_predictions: {
        Row: {
          academy_id: string
          acoes_sugeridas: Json | null
          calculated_at: string | null
          dados: Json | null
          id: string
          motivos: string[] | null
          risk_level: string
          score: number
          status_acao: string
          student_id: string
          student_name: string
          ultimo_contato: string | null
        }
        Insert: {
          academy_id: string
          acoes_sugeridas?: Json | null
          calculated_at?: string | null
          dados?: Json | null
          id?: string
          motivos?: string[] | null
          risk_level?: string
          score?: number
          status_acao?: string
          student_id: string
          student_name: string
          ultimo_contato?: string | null
        }
        Update: {
          academy_id?: string
          acoes_sugeridas?: Json | null
          calculated_at?: string | null
          dados?: Json | null
          id?: string
          motivos?: string[] | null
          risk_level?: string
          score?: number
          status_acao?: string
          student_id?: string
          student_name?: string
          ultimo_contato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "churn_predictions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "churn_predictions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      churn_trend: {
        Row: {
          academy_id: string
          cancelados: number | null
          created_at: string | null
          id: string
          mes: string
          recuperados: number | null
          risco: number | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          cancelados?: number | null
          created_at?: string | null
          id?: string
          mes: string
          recuperados?: number | null
          risco?: number | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          cancelados?: number | null
          created_at?: string | null
          id?: string
          mes?: string
          recuperados?: number | null
          risco?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "churn_trend_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "churn_trend_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
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
      class_occupancy: {
        Row: {
          academy_id: string
          capacity: number | null
          class_id: string | null
          class_name: string | null
          created_at: string | null
          enrolled: number | null
          id: string
          modality: string | null
          occupancy_rate: number | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          capacity?: number | null
          class_id?: string | null
          class_name?: string | null
          created_at?: string | null
          enrolled?: number | null
          id?: string
          modality?: string | null
          occupancy_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          capacity?: number | null
          class_id?: string | null
          class_name?: string | null
          created_at?: string | null
          enrolled?: number | null
          id?: string
          modality?: string | null
          occupancy_rate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_occupancy_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_occupancy_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "class_occupancy_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
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
            foreignKeyName: "classes_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
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
      cockpit_campaigns: {
        Row: {
          actual_value: number | null
          budget_brl: number | null
          channel: string | null
          created_at: string | null
          end_date: string | null
          goal: string | null
          id: string
          learnings: string | null
          name: string
          product: string
          result: string | null
          start_date: string | null
          status: string | null
          target_metric: string | null
          target_value: number | null
          updated_at: string | null
        }
        Insert: {
          actual_value?: number | null
          budget_brl?: number | null
          channel?: string | null
          created_at?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          learnings?: string | null
          name: string
          product?: string
          result?: string | null
          start_date?: string | null
          status?: string | null
          target_metric?: string | null
          target_value?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_value?: number | null
          budget_brl?: number | null
          channel?: string | null
          created_at?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          learnings?: string | null
          name?: string
          product?: string
          result?: string | null
          start_date?: string | null
          status?: string | null
          target_metric?: string | null
          target_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cockpit_content_calendar: {
        Row: {
          content_type: string | null
          created_at: string | null
          id: string
          notes: string | null
          planned_date: string | null
          platform: string
          product: string
          published_url: string | null
          status: string | null
          target_persona: string | null
          title: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          planned_date?: string | null
          platform: string
          product?: string
          published_url?: string | null
          status?: string | null
          target_persona?: string | null
          title: string
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          planned_date?: string | null
          platform?: string
          product?: string
          published_url?: string | null
          status?: string | null
          target_persona?: string | null
          title?: string
        }
        Relationships: []
      }
      cockpit_error_log: {
        Row: {
          affected_route: string | null
          affected_users: number | null
          error_type: string | null
          first_seen: string | null
          frequency: number | null
          id: string
          last_seen: string | null
          message: string
          product: string
          resolution: string | null
          resolved_at: string | null
          severity: string | null
          stack_trace: string | null
          status: string | null
        }
        Insert: {
          affected_route?: string | null
          affected_users?: number | null
          error_type?: string | null
          first_seen?: string | null
          frequency?: number | null
          id?: string
          last_seen?: string | null
          message: string
          product?: string
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          stack_trace?: string | null
          status?: string | null
        }
        Update: {
          affected_route?: string | null
          affected_users?: number | null
          error_type?: string | null
          first_seen?: string | null
          frequency?: number | null
          id?: string
          last_seen?: string | null
          message?: string
          product?: string
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          stack_trace?: string | null
          status?: string | null
        }
        Relationships: []
      }
      cockpit_feedback: {
        Row: {
          academy_id: string | null
          academy_name: string | null
          category: string | null
          converted_to: string | null
          created_at: string | null
          id: string
          internal_notes: string | null
          message: string
          product: string
          rating: number | null
          status: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          academy_id?: string | null
          academy_name?: string | null
          category?: string | null
          converted_to?: string | null
          created_at?: string | null
          id?: string
          internal_notes?: string | null
          message: string
          product?: string
          rating?: number | null
          status?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          academy_id?: string | null
          academy_name?: string | null
          category?: string | null
          converted_to?: string | null
          created_at?: string | null
          id?: string
          internal_notes?: string | null
          message?: string
          product?: string
          rating?: number | null
          status?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cockpit_feedback_converted_to_fkey"
            columns: ["converted_to"]
            isOneToOne: false
            referencedRelation: "feature_backlog"
            referencedColumns: ["id"]
          },
        ]
      }
      cockpit_personas: {
        Row: {
          created_at: string | null
          description: string | null
          feature_completion_pct: number | null
          id: string
          jobs_to_be_done: Json | null
          key_features: Json | null
          name: string
          pains: Json | null
          product: string
          role_in_app: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feature_completion_pct?: number | null
          id?: string
          jobs_to_be_done?: Json | null
          key_features?: Json | null
          name: string
          pains?: Json | null
          product?: string
          role_in_app?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feature_completion_pct?: number | null
          id?: string
          jobs_to_be_done?: Json | null
          key_features?: Json | null
          name?: string
          pains?: Json | null
          product?: string
          role_in_app?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cockpit_sprints: {
        Row: {
          created_at: string | null
          goals: Json | null
          id: string
          notes: string | null
          product: string
          prompts_executed: number | null
          retrospective: string | null
          updated_at: string | null
          velocity: number | null
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string | null
          goals?: Json | null
          id?: string
          notes?: string | null
          product?: string
          prompts_executed?: number | null
          retrospective?: string | null
          updated_at?: string | null
          velocity?: number | null
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string | null
          goals?: Json | null
          id?: string
          notes?: string | null
          product?: string
          prompts_executed?: number | null
          retrospective?: string | null
          updated_at?: string | null
          velocity?: number | null
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "video_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          academy_id: string | null
          body: string | null
          channel: string | null
          created_at: string | null
          id: string
          recipients: Json | null
          status: string | null
          subject: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id?: string | null
          body?: string | null
          channel?: string | null
          created_at?: string | null
          id?: string
          recipients?: Json | null
          status?: string | null
          subject?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string | null
          body?: string | null
          channel?: string | null
          created_at?: string | null
          id?: string
          recipients?: Json | null
          status?: string | null
          subject?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      competitions: {
        Row: {
          academy_id: string
          created_at: string | null
          date: string | null
          id: string
          location: string | null
          name: string
          status: string | null
          total_participants: number | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          date?: string | null
          id?: string
          location?: string | null
          name: string
          status?: string | null
          total_participants?: number | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          date?: string | null
          id?: string
          location?: string | null
          name?: string
          status?: string | null
          total_participants?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      conduct_code_acceptances: {
        Row: {
          academy_id: string
          accepted_at: string
          created_at: string
          id: string
          ip_address: string | null
          profile_id: string
          template_id: string
          template_version: number
          user_agent: string | null
        }
        Insert: {
          academy_id: string
          accepted_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          profile_id: string
          template_id: string
          template_version: number
          user_agent?: string | null
        }
        Update: {
          academy_id?: string
          accepted_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          profile_id?: string
          template_id?: string
          template_version?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conduct_code_acceptances_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_code_acceptances_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "conduct_code_acceptances_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_code_acceptances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "conduct_code_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      conduct_code_templates: {
        Row: {
          academy_id: string
          content: string
          created_at: string
          created_by_id: string | null
          custom_pdf_url: string | null
          id: string
          is_active: boolean
          is_system: boolean
          published_at: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          academy_id: string
          content: string
          created_at?: string
          created_by_id?: string | null
          custom_pdf_url?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Update: {
          academy_id?: string
          content?: string
          created_at?: string
          created_by_id?: string | null
          custom_pdf_url?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "conduct_code_templates_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_code_templates_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "conduct_code_templates_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conduct_config: {
        Row: {
          academy_id: string
          auto_escalate_sanctions: boolean
          ban_after_suspensions: number
          created_at: string
          id: string
          notify_on_incident: boolean
          notify_on_sanction: boolean
          require_acceptance_on_signup: boolean
          suspension_after_warnings: number
          updated_at: string
        }
        Insert: {
          academy_id: string
          auto_escalate_sanctions?: boolean
          ban_after_suspensions?: number
          created_at?: string
          id?: string
          notify_on_incident?: boolean
          notify_on_sanction?: boolean
          require_acceptance_on_signup?: boolean
          suspension_after_warnings?: number
          updated_at?: string
        }
        Update: {
          academy_id?: string
          auto_escalate_sanctions?: boolean
          ban_after_suspensions?: number
          created_at?: string
          id?: string
          notify_on_incident?: boolean
          notify_on_sanction?: boolean
          require_acceptance_on_signup?: boolean
          suspension_after_warnings?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conduct_config_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_config_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      conduct_incidents: {
        Row: {
          academy_id: string
          category: string
          class_id: string | null
          created_at: string
          description: string
          evidence_urls: string[] | null
          id: string
          incident_date: string
          profile_id: string
          reported_by_id: string | null
          severity: string
          updated_at: string
          witnesses: string[] | null
        }
        Insert: {
          academy_id: string
          category: string
          class_id?: string | null
          created_at?: string
          description: string
          evidence_urls?: string[] | null
          id?: string
          incident_date?: string
          profile_id: string
          reported_by_id?: string | null
          severity?: string
          updated_at?: string
          witnesses?: string[] | null
        }
        Update: {
          academy_id?: string
          category?: string
          class_id?: string | null
          created_at?: string
          description?: string
          evidence_urls?: string[] | null
          id?: string
          incident_date?: string
          profile_id?: string
          reported_by_id?: string | null
          severity?: string
          updated_at?: string
          witnesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "conduct_incidents_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_incidents_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "conduct_incidents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_incidents_reported_by_id_fkey"
            columns: ["reported_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conduct_sanctions: {
        Row: {
          academy_id: string
          acknowledged_at: string | null
          appeal_notes: string | null
          appeal_resolved: boolean | null
          created_at: string
          description: string
          end_date: string | null
          id: string
          incident_id: string | null
          is_active: boolean
          issued_by_id: string | null
          profile_id: string
          sanction_type: string
          severity_level: number
          start_date: string
          student_acknowledged: boolean
          updated_at: string
        }
        Insert: {
          academy_id: string
          acknowledged_at?: string | null
          appeal_notes?: string | null
          appeal_resolved?: boolean | null
          created_at?: string
          description: string
          end_date?: string | null
          id?: string
          incident_id?: string | null
          is_active?: boolean
          issued_by_id?: string | null
          profile_id: string
          sanction_type: string
          severity_level?: number
          start_date?: string
          student_acknowledged?: boolean
          updated_at?: string
        }
        Update: {
          academy_id?: string
          acknowledged_at?: string | null
          appeal_notes?: string | null
          appeal_resolved?: boolean | null
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          incident_id?: string | null
          is_active?: boolean
          issued_by_id?: string | null
          profile_id?: string
          sanction_type?: string
          severity_level?: number
          start_date?: string
          student_acknowledged?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conduct_sanctions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_sanctions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "conduct_sanctions_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "conduct_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_sanctions_issued_by_id_fkey"
            columns: ["issued_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_sanctions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_breakdown: {
        Row: {
          connection_type: string | null
          count: number | null
          created_at: string | null
          id: string
          percentage: number | null
          updated_at: string | null
        }
        Insert: {
          connection_type?: string | null
          count?: number | null
          created_at?: string | null
          id?: string
          percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          connection_type?: string | null
          count?: number | null
          created_at?: string | null
          id?: string
          percentage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          accepted: boolean
          created_at: string | null
          id: string
          ip_address: string | null
          type: string
          updated_at: string | null
          user_id: string
          version: string | null
        }
        Insert: {
          accepted: boolean
          created_at?: string | null
          id?: string
          ip_address?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          version?: string | null
        }
        Update: {
          accepted?: boolean
          created_at?: string | null
          id?: string
          ip_address?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          assunto: string | null
          created_at: string | null
          email: string
          id: string
          mensagem: string
          nome: string
          respondido_em: string | null
          respondido_por: string | null
          status: string | null
          telefone: string | null
        }
        Insert: {
          assunto?: string | null
          created_at?: string | null
          email: string
          id?: string
          mensagem: string
          nome: string
          respondido_em?: string | null
          respondido_por?: string | null
          status?: string | null
          telefone?: string | null
        }
        Update: {
          assunto?: string | null
          created_at?: string | null
          email?: string
          id?: string
          mensagem?: string
          nome?: string
          respondido_em?: string | null
          respondido_por?: string | null
          status?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      content_materials: {
        Row: {
          academy_id: string
          created_at: string | null
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_materials_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_materials_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      content_quiz_questions: {
        Row: {
          academy_id: string | null
          correct_index: number | null
          created_at: string | null
          explanation: string | null
          id: string
          options: Json | null
          question: string
          updated_at: string | null
          video_id: string
        }
        Insert: {
          academy_id?: string | null
          correct_index?: number | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          question: string
          updated_at?: string | null
          video_id: string
        }
        Update: {
          academy_id?: string | null
          correct_index?: number | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          question?: string
          updated_at?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_quiz_questions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_quiz_questions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      content_reports: {
        Row: {
          academy_id: string | null
          content_id: string | null
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reported_user_id: string | null
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          academy_id?: string | null
          content_id?: string | null
          content_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reported_user_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          academy_id?: string | null
          content_id?: string | null
          content_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      content_series: {
        Row: {
          academy_id: string
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_series_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_series_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      content_trails: {
        Row: {
          academy_id: string
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_trails_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_trails_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      content_videos: {
        Row: {
          academy_id: string
          belt_level: string | null
          completions: number | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          is_published: boolean | null
          modality: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          url: string | null
          views: number | null
        }
        Insert: {
          academy_id: string
          belt_level?: string | null
          completions?: number | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_published?: boolean | null
          modality?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
          views?: number | null
        }
        Update: {
          academy_id?: string
          belt_level?: string | null
          completions?: number | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_published?: boolean | null
          modality?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_videos_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_videos_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      contract_history: {
        Row: {
          action: string
          actor_id: string | null
          contract_id: string
          contract_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          contract_id: string
          contract_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          contract_id?: string
          contract_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_history_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_purchases: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          progress: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          progress?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          progress?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculos: {
        Row: {
          academy_id: string
          created_at: string | null
          descricao: string | null
          id: string
          modalidade: string | null
          modulos: Json | null
          nome: string
          progresso_turmas: Json | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          modalidade?: string | null
          modulos?: Json | null
          nome: string
          progresso_turmas?: Json | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          modalidade?: string | null
          modulos?: Json | null
          nome?: string
          progresso_turmas?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculos_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculos_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      curriculum_modules: {
        Row: {
          created_at: string | null
          curriculum_id: string
          descricao: string | null
          faixa: string | null
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          created_at?: string | null
          curriculum_id: string
          descricao?: string | null
          faixa?: string | null
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          created_at?: string | null
          curriculum_id?: string
          descricao?: string | null
          faixa?: string | null
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_modules_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "academy_curricula"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_progress: {
        Row: {
          class_id: string
          current_module_id: string | null
          curriculum_id: string
          id: string
          percentual_concluido: number | null
          updated_at: string | null
        }
        Insert: {
          class_id: string
          current_module_id?: string | null
          curriculum_id: string
          id?: string
          percentual_concluido?: number | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          current_module_id?: string | null
          curriculum_id?: string
          id?: string
          percentual_concluido?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_progress_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_progress_current_module_id_fkey"
            columns: ["current_module_id"]
            isOneToOne: false
            referencedRelation: "curriculum_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_progress_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "academy_curricula"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_techniques: {
        Row: {
          created_at: string | null
          descricao: string | null
          faixa_minima: string | null
          id: string
          module_id: string
          nome: string
          posicao: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          faixa_minima?: string | null
          id?: string
          module_id: string
          nome: string
          posicao?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          faixa_minima?: string | null
          id?: string
          module_id?: string
          nome?: string
          posicao?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_techniques_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "curriculum_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_metrics: {
        Row: {
          active_academies: number | null
          active_championships: number | null
          active_users_7d: number | null
          avg_session_seconds: number | null
          churned_academies: number | null
          churned_mrr_brl: number | null
          created_at: string | null
          date: string
          id: string
          mrr_brl: number | null
          new_mrr_brl: number | null
          new_users: number | null
          product: string
          total_academies: number | null
          total_checkins: number | null
          total_classes: number | null
          total_registrations: number | null
          total_users: number | null
          trial_academies: number | null
        }
        Insert: {
          active_academies?: number | null
          active_championships?: number | null
          active_users_7d?: number | null
          avg_session_seconds?: number | null
          churned_academies?: number | null
          churned_mrr_brl?: number | null
          created_at?: string | null
          date: string
          id?: string
          mrr_brl?: number | null
          new_mrr_brl?: number | null
          new_users?: number | null
          product?: string
          total_academies?: number | null
          total_checkins?: number | null
          total_classes?: number | null
          total_registrations?: number | null
          total_users?: number | null
          trial_academies?: number | null
        }
        Update: {
          active_academies?: number | null
          active_championships?: number | null
          active_users_7d?: number | null
          avg_session_seconds?: number | null
          churned_academies?: number | null
          churned_mrr_brl?: number | null
          created_at?: string | null
          date?: string
          id?: string
          mrr_brl?: number | null
          new_mrr_brl?: number | null
          new_users?: number | null
          product?: string
          total_academies?: number | null
          total_checkins?: number | null
          total_classes?: number | null
          total_registrations?: number | null
          total_users?: number | null
          trial_academies?: number | null
        }
        Relationships: []
      }
      data_deletion_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          scheduled_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_deletion_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          download_url: string | null
          format: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          download_url?: string | null
          format?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          download_url?: string | null
          format?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_export_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_health_issues: {
        Row: {
          academy_id: string
          action_label: string | null
          action_route: string | null
          category: string
          created_at: string | null
          description: string
          entity_id: string
          entity_type: string
          id: string
          is_resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
        }
        Insert: {
          academy_id: string
          action_label?: string | null
          action_route?: string | null
          category: string
          created_at?: string | null
          description: string
          entity_id: string
          entity_type: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
        }
        Update: {
          academy_id?: string
          action_label?: string | null
          action_route?: string | null
          category?: string
          created_at?: string | null
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_health_issues_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_health_issues_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "data_health_issues_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deploy_log: {
        Row: {
          branch: string | null
          commit_message: string | null
          commit_sha: string | null
          deployed_at: string | null
          deployed_by: string | null
          duration_seconds: number | null
          files_changed: number | null
          id: string
          lines_added: number | null
          lines_removed: number | null
          product: string
          status: string | null
          tag: string | null
          vercel_url: string | null
        }
        Insert: {
          branch?: string | null
          commit_message?: string | null
          commit_sha?: string | null
          deployed_at?: string | null
          deployed_by?: string | null
          duration_seconds?: number | null
          files_changed?: number | null
          id?: string
          lines_added?: number | null
          lines_removed?: number | null
          product?: string
          status?: string | null
          tag?: string | null
          vercel_url?: string | null
        }
        Update: {
          branch?: string | null
          commit_message?: string | null
          commit_sha?: string | null
          deployed_at?: string | null
          deployed_by?: string | null
          duration_seconds?: number | null
          files_changed?: number | null
          id?: string
          lines_added?: number | null
          lines_removed?: number | null
          product?: string
          status?: string | null
          tag?: string | null
          vercel_url?: string | null
        }
        Relationships: []
      }
      device_breakdown: {
        Row: {
          count: number | null
          created_at: string | null
          device_type: string | null
          id: string
          percentage: number | null
          updated_at: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          percentage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      device_models: {
        Row: {
          count: number | null
          created_at: string | null
          device_type: string | null
          id: string
          model: string | null
          updated_at: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          model?: string | null
          updated_at?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          model?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          platform: string
          profile_id: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          profile_id: string
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          profile_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_overview: {
        Row: {
          avg_pages_per_session: number | null
          avg_session_duration: number | null
          bounce_rate: number | null
          created_at: string | null
          id: string
          total_sessions: number | null
          updated_at: string | null
        }
        Insert: {
          avg_pages_per_session?: number | null
          avg_session_duration?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          id?: string
          total_sessions?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_pages_per_session?: number | null
          avg_session_duration?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          id?: string
          total_sessions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          count: number | null
          created_at: string | null
          error_type: string | null
          first_seen: string | null
          id: string
          last_seen: string | null
          message: string | null
          page: string | null
          stack: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          error_type?: string | null
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          message?: string | null
          page?: string | null
          stack?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          error_type?: string | null
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          message?: string | null
          page?: string | null
          stack?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      error_logs_by_page: {
        Row: {
          created_at: string | null
          id: string
          last_error: string | null
          page: string | null
          total_errors: number | null
          unique_errors: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_error?: string | null
          page?: string | null
          total_errors?: number | null
          unique_errors?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_error?: string | null
          page?: string | null
          total_errors?: number | null
          unique_errors?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      error_trend: {
        Row: {
          count: number | null
          created_at: string | null
          hour: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          hour?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          hour?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      evaluation_criteria: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          peso_promocao: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          peso_promocao?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          peso_promocao?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
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
      eventos: {
        Row: {
          academy_id: string
          capacity: number | null
          created_at: string | null
          date: string | null
          description: string | null
          end_time: string | null
          enrolled_count: number | null
          enrollment_open: boolean | null
          id: string
          location: string | null
          price: number | null
          start_time: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          capacity?: number | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          end_time?: string | null
          enrolled_count?: number | null
          enrollment_open?: boolean | null
          id?: string
          location?: string | null
          price?: number | null
          start_time?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          capacity?: number | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          end_time?: string | null
          enrolled_count?: number | null
          enrollment_open?: boolean | null
          id?: string
          location?: string | null
          price?: number | null
          start_time?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
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
          {
            foreignKeyName: "events_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      family_invoices: {
        Row: {
          academy_id: string
          created_at: string | null
          due_date: string
          guardian_person_id: string
          id: string
          line_items: Json | null
          paid_at: string | null
          payment_link: string | null
          payment_method: string | null
          reference_month: string
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          due_date: string
          guardian_person_id: string
          id?: string
          line_items?: Json | null
          paid_at?: string | null
          payment_link?: string | null
          payment_method?: string | null
          reference_month: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          due_date?: string
          guardian_person_id?: string
          id?: string
          line_items?: Json | null
          paid_at?: string | null
          payment_link?: string | null
          payment_method?: string | null
          reference_month?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_invoices_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invoices_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "family_invoices_guardian_person_id_fkey"
            columns: ["guardian_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      family_links: {
        Row: {
          can_authorize_events: boolean | null
          created_at: string | null
          dependent_person_id: string
          guardian_person_id: string
          id: string
          is_financial_responsible: boolean | null
          is_primary_guardian: boolean | null
          notes: string | null
          receives_billing: boolean | null
          receives_notifications: boolean | null
          relationship: string
          updated_at: string | null
        }
        Insert: {
          can_authorize_events?: boolean | null
          created_at?: string | null
          dependent_person_id: string
          guardian_person_id: string
          id?: string
          is_financial_responsible?: boolean | null
          is_primary_guardian?: boolean | null
          notes?: string | null
          receives_billing?: boolean | null
          receives_notifications?: boolean | null
          relationship: string
          updated_at?: string | null
        }
        Update: {
          can_authorize_events?: boolean | null
          created_at?: string | null
          dependent_person_id?: string
          guardian_person_id?: string
          id?: string
          is_financial_responsible?: boolean | null
          is_primary_guardian?: boolean | null
          notes?: string | null
          receives_billing?: boolean | null
          receives_notifications?: boolean | null
          relationship?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_links_dependent_person_id_fkey"
            columns: ["dependent_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_links_guardian_person_id_fkey"
            columns: ["guardian_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_backlog: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          job_to_be_done: string | null
          module: string | null
          persona: string | null
          pipeline_phase: string | null
          priority_order: number | null
          product: string
          rice_effort: number | null
          rice_impact: number | null
          rice_score: number | null
          rice_urgency: number | null
          shipped_at: string | null
          sprint_id: string | null
          status: string | null
          success_criteria: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          job_to_be_done?: string | null
          module?: string | null
          persona?: string | null
          pipeline_phase?: string | null
          priority_order?: number | null
          product?: string
          rice_effort?: number | null
          rice_impact?: number | null
          rice_score?: number | null
          rice_urgency?: number | null
          shipped_at?: string | null
          sprint_id?: string | null
          status?: string | null
          success_criteria?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          job_to_be_done?: string | null
          module?: string | null
          persona?: string | null
          pipeline_phase?: string | null
          priority_order?: number | null
          product?: string
          rice_effort?: number | null
          rice_impact?: number | null
          rice_score?: number | null
          rice_urgency?: number | null
          shipped_at?: string | null
          sprint_id?: string | null
          status?: string | null
          success_criteria?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      feature_usage: {
        Row: {
          created_at: string | null
          feature: string | null
          id: string
          unique_users: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          feature?: string | null
          id?: string
          unique_users?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          feature?: string | null
          id?: string
          unique_users?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
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
            foreignKeyName: "feed_posts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
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
      franchise_academies: {
        Row: {
          attendance_rate: number | null
          city: string | null
          created_at: string | null
          franchise_id: string
          id: string
          name: string
          nps: number | null
          revenue: number | null
          status: string | null
          students_count: number | null
          updated_at: string | null
        }
        Insert: {
          attendance_rate?: number | null
          city?: string | null
          created_at?: string | null
          franchise_id: string
          id?: string
          name: string
          nps?: number | null
          revenue?: number | null
          status?: string | null
          students_count?: number | null
          updated_at?: string | null
        }
        Update: {
          attendance_rate?: number | null
          city?: string | null
          created_at?: string | null
          franchise_id?: string
          id?: string
          name?: string
          nps?: number | null
          revenue?: number | null
          status?: string | null
          students_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      franchise_alerts: {
        Row: {
          academy_id: string | null
          academy_name: string | null
          created_at: string | null
          franchise_id: string
          id: string
          message: string | null
          severity: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id?: string | null
          academy_name?: string | null
          created_at?: string | null
          franchise_id: string
          id?: string
          message?: string | null
          severity?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string | null
          academy_name?: string | null
          created_at?: string | null
          franchise_id?: string
          id?: string
          message?: string | null
          severity?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      franchise_broadcast_receipts: {
        Row: {
          academy_id: string | null
          academy_name: string | null
          broadcast_id: string
          created_at: string | null
          id: string
          read_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id?: string | null
          academy_name?: string | null
          broadcast_id: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string | null
          academy_name?: string | null
          broadcast_id?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      franchise_broadcasts: {
        Row: {
          body: string | null
          channels: Json | null
          created_at: string | null
          created_by: string | null
          franchise_id: string
          id: string
          recipient_ids: string[] | null
          sent_at: string | null
          subject: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          channels?: Json | null
          created_at?: string | null
          created_by?: string | null
          franchise_id: string
          id?: string
          recipient_ids?: string[] | null
          sent_at?: string | null
          subject?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          channels?: Json | null
          created_at?: string | null
          created_by?: string | null
          franchise_id?: string
          id?: string
          recipient_ids?: string[] | null
          sent_at?: string | null
          subject?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_broadcasts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_compliance_checks: {
        Row: {
          academy_id: string
          academy_name: string | null
          checked_at: string | null
          checked_by: string | null
          created_at: string | null
          id: string
          overall_score: number | null
          results: Json | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          academy_name?: string | null
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string | null
          id?: string
          overall_score?: number | null
          results?: Json | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          academy_name?: string | null
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string | null
          id?: string
          overall_score?: number | null
          results?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_compliance_checks_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_compliance_checks_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "franchise_compliance_checks_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_curriculos: {
        Row: {
          created_at: string | null
          descricao: string | null
          franchise_id: string
          id: string
          modalidade: string | null
          modulos: Json | null
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          franchise_id: string
          id?: string
          modalidade?: string | null
          modulos?: Json | null
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          franchise_id?: string
          id?: string
          modalidade?: string | null
          modulos?: Json | null
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      franchise_financials: {
        Row: {
          academy_id: string | null
          created_at: string | null
          franchise_id: string
          id: string
          month: string | null
          revenue: number | null
          royalties: number | null
          updated_at: string | null
        }
        Insert: {
          academy_id?: string | null
          created_at?: string | null
          franchise_id: string
          id?: string
          month?: string | null
          revenue?: number | null
          royalties?: number | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string | null
          created_at?: string | null
          franchise_id?: string
          id?: string
          month?: string | null
          revenue?: number | null
          royalties?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      franchise_leads: {
        Row: {
          city: string | null
          created_at: string | null
          email: string | null
          experience: string | null
          franchise_id: string
          id: string
          investment_capacity: number | null
          name: string
          notes: string | null
          onboarding_step: string | null
          phone: string | null
          stage: string | null
          state: string | null
          updated_at: string | null
          viability_score: number | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          franchise_id: string
          id?: string
          investment_capacity?: number | null
          name: string
          notes?: string | null
          onboarding_step?: string | null
          phone?: string | null
          stage?: string | null
          state?: string | null
          updated_at?: string | null
          viability_score?: number | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          franchise_id?: string
          id?: string
          investment_capacity?: number | null
          name?: string
          notes?: string | null
          onboarding_step?: string | null
          phone?: string | null
          stage?: string | null
          state?: string | null
          updated_at?: string | null
          viability_score?: number | null
        }
        Relationships: []
      }
      franchise_messages: {
        Row: {
          body: string | null
          channel: string | null
          created_at: string | null
          franchise_id: string
          id: string
          recipients: string[] | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          channel?: string | null
          created_at?: string | null
          franchise_id: string
          id?: string
          recipients?: string[] | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          channel?: string | null
          created_at?: string | null
          franchise_id?: string
          id?: string
          recipients?: string[] | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      franchise_standards: {
        Row: {
          category: string | null
          checklist_items: Json | null
          created_at: string | null
          deadline: string | null
          description: string | null
          franchise_id: string
          id: string
          name: string
          required: boolean | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          checklist_items?: Json | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          franchise_id: string
          id?: string
          name: string
          required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          checklist_items?: Json | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          franchise_id?: string
          id?: string
          name?: string
          required?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      franchise_trainings: {
        Row: {
          created_at: string | null
          date: string | null
          description: string | null
          duration_minutes: number | null
          enrolled: number | null
          format: string | null
          franchise_id: string
          id: string
          instructor: string | null
          max_participants: number | null
          status: string | null
          time: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          duration_minutes?: number | null
          enrolled?: number | null
          format?: string | null
          franchise_id: string
          id?: string
          instructor?: string | null
          max_participants?: number | null
          status?: string | null
          time?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          duration_minutes?: number | null
          enrolled?: number | null
          format?: string | null
          franchise_id?: string
          id?: string
          instructor?: string | null
          max_participants?: number | null
          status?: string | null
          time?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      franchise_units: {
        Row: {
          academy_id: string | null
          address: string | null
          city: string | null
          compliance_score: number | null
          created_at: string | null
          franchise_id: string
          health_score: number | null
          id: string
          manager_email: string | null
          manager_name: string | null
          name: string
          opened_at: string | null
          phone: string | null
          revenue_monthly: number | null
          state: string | null
          status: string | null
          students_count: number | null
          updated_at: string | null
        }
        Insert: {
          academy_id?: string | null
          address?: string | null
          city?: string | null
          compliance_score?: number | null
          created_at?: string | null
          franchise_id: string
          health_score?: number | null
          id?: string
          manager_email?: string | null
          manager_name?: string | null
          name: string
          opened_at?: string | null
          phone?: string | null
          revenue_monthly?: number | null
          state?: string | null
          status?: string | null
          students_count?: number | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string | null
          address?: string | null
          city?: string | null
          compliance_score?: number | null
          created_at?: string | null
          franchise_id?: string
          health_score?: number | null
          id?: string
          manager_email?: string | null
          manager_name?: string | null
          name?: string
          opened_at?: string | null
          phone?: string | null
          revenue_monthly?: number | null
          state?: string | null
          status?: string | null
          students_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_units_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_units_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      gamification_badge_definitions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          requirement: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          requirement?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          requirement?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gamification_badges: {
        Row: {
          category: string | null
          created_at: string | null
          current: number | null
          description: string | null
          icon: string | null
          id: string
          name: string
          progress: number | null
          requirement: number | null
          unlocked: boolean | null
          unlocked_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          progress?: number | null
          requirement?: number | null
          unlocked?: boolean | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          progress?: number | null
          requirement?: number | null
          unlocked?: boolean | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamification_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_xp: {
        Row: {
          academy_id: string | null
          badge_count: number | null
          class_id: string | null
          created_at: string | null
          id: string
          name: string | null
          rank: number | null
          role: string | null
          streak: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          academy_id?: string | null
          badge_count?: number | null
          class_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          rank?: number | null
          role?: string | null
          streak?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          academy_id?: string | null
          badge_count?: number | null
          class_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          rank?: number | null
          role?: string | null
          streak?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamification_xp_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gamification_xp_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "gamification_xp_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gamification_xp_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      glossary_terms: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          example: string | null
          id: string
          language: string | null
          min_belt: string | null
          modality: string | null
          original: string
          pronunciation: string | null
          translation: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          example?: string | null
          id?: string
          language?: string | null
          min_belt?: string | null
          modality?: string | null
          original: string
          pronunciation?: string | null
          translation: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          example?: string | null
          id?: string
          language?: string | null
          min_belt?: string | null
          modality?: string | null
          original?: string
          pronunciation?: string | null
          translation?: string
        }
        Relationships: []
      }
      group_messages: {
        Row: {
          academy_id: string | null
          attachments: Json | null
          created_at: string | null
          group_id: string | null
          id: string
          sender_id: string | null
          text: string
          updated_at: string | null
        }
        Insert: {
          academy_id?: string | null
          attachments?: Json | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          sender_id?: string | null
          text: string
          updated_at?: string | null
        }
        Update: {
          academy_id?: string | null
          attachments?: Json | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          sender_id?: string | null
          text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_messages_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "group_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_links: {
        Row: {
          can_manage_payments: boolean | null
          can_precheckin: boolean | null
          can_view_grades: boolean | null
          child_id: string
          created_at: string | null
          guardian_id: string
          id: string
          relationship: string | null
        }
        Insert: {
          can_manage_payments?: boolean | null
          can_precheckin?: boolean | null
          can_view_grades?: boolean | null
          child_id: string
          created_at?: string | null
          guardian_id: string
          id?: string
          relationship?: string | null
        }
        Update: {
          can_manage_payments?: boolean | null
          can_precheckin?: boolean | null
          can_view_grades?: boolean | null
          child_id?: string
          created_at?: string | null
          guardian_id?: string
          id?: string
          relationship?: string | null
        }
        Relationships: []
      }
      guardian_students: {
        Row: {
          created_at: string | null
          guardian_id: string
          id: string
          relationship: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guardian_id: string
          id?: string
          relationship?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guardian_id?: string
          id?: string
          relationship?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardian_students_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
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
      health_config: {
        Row: {
          academy_id: string
          auto_restrict_on_injury: boolean
          clearance_validity_months: number
          created_at: string
          id: string
          notify_professor_restrictions: boolean
          require_emergency_contact: boolean
          require_medical_clearance: boolean
          require_parq: boolean
          require_pretraining_check: boolean
          updated_at: string
        }
        Insert: {
          academy_id: string
          auto_restrict_on_injury?: boolean
          clearance_validity_months?: number
          created_at?: string
          id?: string
          notify_professor_restrictions?: boolean
          require_emergency_contact?: boolean
          require_medical_clearance?: boolean
          require_parq?: boolean
          require_pretraining_check?: boolean
          updated_at?: string
        }
        Update: {
          academy_id?: string
          auto_restrict_on_injury?: boolean
          clearance_validity_months?: number
          created_at?: string
          id?: string
          notify_professor_restrictions?: boolean
          require_emergency_contact?: boolean
          require_medical_clearance?: boolean
          require_parq?: boolean
          require_pretraining_check?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_config_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_config_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      health_injuries: {
        Row: {
          academy_id: string
          actual_recovery_date: string | null
          body_part: string
          class_id: string | null
          created_at: string
          description: string
          estimated_recovery_days: number | null
          id: string
          injury_date: string
          medical_report_url: string | null
          occurred_during: string | null
          profile_id: string
          recovery_status: string
          reported_by_id: string | null
          return_clearance_date: string | null
          return_cleared_by_id: string | null
          severity: string
          treatment_details: string | null
          treatment_type: string | null
          updated_at: string
        }
        Insert: {
          academy_id: string
          actual_recovery_date?: string | null
          body_part: string
          class_id?: string | null
          created_at?: string
          description: string
          estimated_recovery_days?: number | null
          id?: string
          injury_date: string
          medical_report_url?: string | null
          occurred_during?: string | null
          profile_id: string
          recovery_status?: string
          reported_by_id?: string | null
          return_clearance_date?: string | null
          return_cleared_by_id?: string | null
          severity: string
          treatment_details?: string | null
          treatment_type?: string | null
          updated_at?: string
        }
        Update: {
          academy_id?: string
          actual_recovery_date?: string | null
          body_part?: string
          class_id?: string | null
          created_at?: string
          description?: string
          estimated_recovery_days?: number | null
          id?: string
          injury_date?: string
          medical_report_url?: string | null
          occurred_during?: string | null
          profile_id?: string
          recovery_status?: string
          reported_by_id?: string | null
          return_clearance_date?: string | null
          return_cleared_by_id?: string | null
          severity?: string
          treatment_details?: string | null
          treatment_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_injuries_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_injuries_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "health_injuries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_injuries_reported_by_id_fkey"
            columns: ["reported_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_injuries_return_cleared_by_id_fkey"
            columns: ["return_cleared_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_medical_clearances: {
        Row: {
          academy_id: string
          clearance_type: string
          created_at: string
          doctor_crm: string | null
          doctor_name: string | null
          doctor_specialty: string | null
          document_url: string | null
          id: string
          injury_id: string | null
          notes: string | null
          profile_id: string
          reviewed_at: string | null
          reviewed_by_id: string | null
          status: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          academy_id: string
          clearance_type: string
          created_at?: string
          doctor_crm?: string | null
          doctor_name?: string | null
          doctor_specialty?: string | null
          document_url?: string | null
          id?: string
          injury_id?: string | null
          notes?: string | null
          profile_id: string
          reviewed_at?: string | null
          reviewed_by_id?: string | null
          status?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          academy_id?: string
          clearance_type?: string
          created_at?: string
          doctor_crm?: string | null
          doctor_name?: string | null
          doctor_specialty?: string | null
          document_url?: string | null
          id?: string
          injury_id?: string | null
          notes?: string | null
          profile_id?: string
          reviewed_at?: string | null
          reviewed_by_id?: string | null
          status?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_medical_clearances_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_medical_clearances_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "health_medical_clearances_injury_id_fkey"
            columns: ["injury_id"]
            isOneToOne: false
            referencedRelation: "health_injuries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_medical_clearances_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_medical_clearances_reviewed_by_id_fkey"
            columns: ["reviewed_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_medical_history: {
        Row: {
          academy_id: string
          allergies_details: string | null
          bleeding_disorder_details: string | null
          blood_type: string | null
          cardiovascular_details: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          has_allergies: boolean
          has_bleeding_disorder: boolean
          has_cardiovascular: boolean
          has_dental_prosthesis: boolean
          has_infectious_disease: boolean
          has_metabolic: boolean
          has_musculoskeletal: boolean
          has_neurological: boolean
          has_respiratory: boolean
          has_skin_conditions: boolean
          has_surgeries: boolean
          id: string
          infectious_disease_details: string | null
          lgpd_health_consent: boolean
          medication_details: string | null
          metabolic_details: string | null
          musculoskeletal_details: string | null
          neurological_details: string | null
          profile_id: string
          respiratory_details: string | null
          skin_conditions_details: string | null
          surgeries_details: string | null
          takes_medication: boolean
          updated_at: string
          uses_glasses_contacts: boolean
          uses_hearing_aid: boolean
        }
        Insert: {
          academy_id: string
          allergies_details?: string | null
          bleeding_disorder_details?: string | null
          blood_type?: string | null
          cardiovascular_details?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          has_allergies?: boolean
          has_bleeding_disorder?: boolean
          has_cardiovascular?: boolean
          has_dental_prosthesis?: boolean
          has_infectious_disease?: boolean
          has_metabolic?: boolean
          has_musculoskeletal?: boolean
          has_neurological?: boolean
          has_respiratory?: boolean
          has_skin_conditions?: boolean
          has_surgeries?: boolean
          id?: string
          infectious_disease_details?: string | null
          lgpd_health_consent?: boolean
          medication_details?: string | null
          metabolic_details?: string | null
          musculoskeletal_details?: string | null
          neurological_details?: string | null
          profile_id: string
          respiratory_details?: string | null
          skin_conditions_details?: string | null
          surgeries_details?: string | null
          takes_medication?: boolean
          updated_at?: string
          uses_glasses_contacts?: boolean
          uses_hearing_aid?: boolean
        }
        Update: {
          academy_id?: string
          allergies_details?: string | null
          bleeding_disorder_details?: string | null
          blood_type?: string | null
          cardiovascular_details?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          has_allergies?: boolean
          has_bleeding_disorder?: boolean
          has_cardiovascular?: boolean
          has_dental_prosthesis?: boolean
          has_infectious_disease?: boolean
          has_metabolic?: boolean
          has_musculoskeletal?: boolean
          has_neurological?: boolean
          has_respiratory?: boolean
          has_skin_conditions?: boolean
          has_surgeries?: boolean
          id?: string
          infectious_disease_details?: string | null
          lgpd_health_consent?: boolean
          medication_details?: string | null
          metabolic_details?: string | null
          musculoskeletal_details?: string | null
          neurological_details?: string | null
          profile_id?: string
          respiratory_details?: string | null
          skin_conditions_details?: string | null
          surgeries_details?: string | null
          takes_medication?: boolean
          updated_at?: string
          uses_glasses_contacts?: boolean
          uses_hearing_aid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "health_medical_history_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_medical_history_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "health_medical_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_parq_responses: {
        Row: {
          academy_id: string
          additional_notes: string | null
          completed_at: string
          created_at: string
          has_risk_factor: boolean | null
          id: string
          lgpd_consent_date: string | null
          lgpd_consent_ip: string | null
          lgpd_health_consent: boolean
          profile_id: string
          q1_heart_condition: boolean
          q2_chest_pain_activity: boolean
          q3_chest_pain_rest: boolean
          q4_dizziness_balance: boolean
          q5_bone_joint_problem: boolean
          q6_medication_bp_heart: boolean
          q7_other_reason: boolean
          updated_at: string
          version: number
        }
        Insert: {
          academy_id: string
          additional_notes?: string | null
          completed_at?: string
          created_at?: string
          has_risk_factor?: boolean | null
          id?: string
          lgpd_consent_date?: string | null
          lgpd_consent_ip?: string | null
          lgpd_health_consent?: boolean
          profile_id: string
          q1_heart_condition?: boolean
          q2_chest_pain_activity?: boolean
          q3_chest_pain_rest?: boolean
          q4_dizziness_balance?: boolean
          q5_bone_joint_problem?: boolean
          q6_medication_bp_heart?: boolean
          q7_other_reason?: boolean
          updated_at?: string
          version?: number
        }
        Update: {
          academy_id?: string
          additional_notes?: string | null
          completed_at?: string
          created_at?: string
          has_risk_factor?: boolean | null
          id?: string
          lgpd_consent_date?: string | null
          lgpd_consent_ip?: string | null
          lgpd_health_consent?: boolean
          profile_id?: string
          q1_heart_condition?: boolean
          q2_chest_pain_activity?: boolean
          q3_chest_pain_rest?: boolean
          q4_dizziness_balance?: boolean
          q5_bone_joint_problem?: boolean
          q6_medication_bp_heart?: boolean
          q7_other_reason?: boolean
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "health_parq_responses_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_parq_responses_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "health_parq_responses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_pretraining_checks: {
        Row: {
          academy_id: string
          check_date: string
          class_id: string | null
          cleared_to_train: boolean
          created_at: string
          feeling_score: number | null
          id: string
          notes: string | null
          pain_level: number | null
          pain_location: string | null
          pain_reported: boolean
          professor_id: string
          profile_id: string
          restrictions_applied: string[] | null
        }
        Insert: {
          academy_id: string
          check_date?: string
          class_id?: string | null
          cleared_to_train?: boolean
          created_at?: string
          feeling_score?: number | null
          id?: string
          notes?: string | null
          pain_level?: number | null
          pain_location?: string | null
          pain_reported?: boolean
          professor_id: string
          profile_id: string
          restrictions_applied?: string[] | null
        }
        Update: {
          academy_id?: string
          check_date?: string
          class_id?: string | null
          cleared_to_train?: boolean
          created_at?: string
          feeling_score?: number | null
          id?: string
          notes?: string | null
          pain_level?: number | null
          pain_location?: string | null
          pain_reported?: boolean
          professor_id?: string
          profile_id?: string
          restrictions_applied?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "health_pretraining_checks_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_pretraining_checks_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "health_pretraining_checks_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_pretraining_checks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_training_restrictions: {
        Row: {
          academy_id: string
          approved_by_id: string | null
          body_part: string | null
          created_at: string
          created_by_id: string | null
          description: string | null
          end_date: string | null
          id: string
          injury_id: string | null
          is_active: boolean
          is_permanent: boolean
          profile_id: string
          restriction_type: string
          severity: string
          start_date: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          approved_by_id?: string | null
          body_part?: string | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          injury_id?: string | null
          is_active?: boolean
          is_permanent?: boolean
          profile_id: string
          restriction_type: string
          severity?: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          approved_by_id?: string | null
          body_part?: string | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          injury_id?: string | null
          is_active?: boolean
          is_permanent?: boolean
          profile_id?: string
          restriction_type?: string
          severity?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_training_restrictions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_training_restrictions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "health_training_restrictions_approved_by_id_fkey"
            columns: ["approved_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_training_restrictions_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_training_restrictions_injury_id_fkey"
            columns: ["injury_id"]
            isOneToOne: false
            referencedRelation: "health_injuries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_training_restrictions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          academy_id: string
          acao_tomada: string | null
          aluno_id: string
          created_at: string | null
          data: string
          descricao: string
          gravidade: string
          id: string
          professor_id: string
          responsavel_notificado: boolean | null
          tipo: string
          turma_id: string
        }
        Insert: {
          academy_id: string
          acao_tomada?: string | null
          aluno_id: string
          created_at?: string | null
          data?: string
          descricao: string
          gravidade: string
          id?: string
          professor_id: string
          responsavel_notificado?: boolean | null
          tipo: string
          turma_id: string
        }
        Update: {
          academy_id?: string
          acao_tomada?: string | null
          aluno_id?: string
          created_at?: string | null
          data?: string
          descricao?: string
          gravidade?: string
          id?: string
          professor_id?: string
          responsavel_notificado?: boolean | null
          tipo?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "incidents_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_tokens: {
        Row: {
          academy_id: string
          created_at: string | null
          created_by: string
          current_uses: number | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          label: string
          max_uses: number | null
          target_role: string
          token: string
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          created_by: string
          current_uses?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          max_uses?: number | null
          target_role: string
          token: string
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          created_by?: string
          current_uses?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          max_uses?: number | null
          target_role?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_tokens_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_tokens_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "invite_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_uses: {
        Row: {
          id: string
          ip_address: string | null
          profile_id: string
          token_id: string
          used_at: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          profile_id: string
          token_id: string
          used_at?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          profile_id?: string
          token_id?: string
          used_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_uses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_uses_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "invite_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          academy_id: string
          accepted_at: string | null
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          invited_by: string | null
          phone: string | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          accepted_at?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          accepted_at?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          academy_id: string | null
          amount: number
          billing_type: string | null
          created_at: string
          discount: number | null
          due_date: string
          external_payment_id: string | null
          id: string
          manual_payment: boolean | null
          membership_id: string | null
          net_amount: number | null
          net_value: number | null
          paid_amount: number | null
          paid_at: string | null
          payment_link: string | null
          payment_method: string | null
          payment_notes: string | null
          pix_payload: string | null
          pix_qr_code: string | null
          profile_id: string | null
          reference_month: string | null
          status: string
          subscription_id: string
          updated_at: string
        }
        Insert: {
          academy_id?: string | null
          amount: number
          billing_type?: string | null
          created_at?: string
          discount?: number | null
          due_date: string
          external_payment_id?: string | null
          id?: string
          manual_payment?: boolean | null
          membership_id?: string | null
          net_amount?: number | null
          net_value?: number | null
          paid_amount?: number | null
          paid_at?: string | null
          payment_link?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          pix_payload?: string | null
          pix_qr_code?: string | null
          profile_id?: string | null
          reference_month?: string | null
          status?: string
          subscription_id: string
          updated_at?: string
        }
        Update: {
          academy_id?: string | null
          amount?: number
          billing_type?: string | null
          created_at?: string
          discount?: number | null
          due_date?: string
          external_payment_id?: string | null
          id?: string
          manual_payment?: boolean | null
          membership_id?: string | null
          net_amount?: number | null
          net_value?: number | null
          paid_amount?: number | null
          paid_at?: string | null
          payment_link?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          pix_payload?: string | null
          pix_qr_code?: string | null
          profile_id?: string | null
          reference_month?: string | null
          status?: string
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "invoices_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_configs: {
        Row: {
          academy_id: string
          cidade: string | null
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string | null
          depoimentos: Json | null
          descricao: string | null
          email: string | null
          endereco: string | null
          experimental_ativa: boolean | null
          facebook: string | null
          fotos: Json | null
          grade: Json | null
          hero_banner_url: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          modalidades: Json | null
          nome: string
          planos: Json | null
          published: boolean | null
          slug: string
          stats: Json | null
          telefone: string | null
          tema: string | null
          turmas_experimental: string[] | null
          updated_at: string | null
          whatsapp: string | null
          youtube: string | null
        }
        Insert: {
          academy_id: string
          cidade?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          depoimentos?: Json | null
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          experimental_ativa?: boolean | null
          facebook?: string | null
          fotos?: Json | null
          grade?: Json | null
          hero_banner_url?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          modalidades?: Json | null
          nome: string
          planos?: Json | null
          published?: boolean | null
          slug: string
          stats?: Json | null
          telefone?: string | null
          tema?: string | null
          turmas_experimental?: string[] | null
          updated_at?: string | null
          whatsapp?: string | null
          youtube?: string | null
        }
        Update: {
          academy_id?: string
          cidade?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          depoimentos?: Json | null
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          experimental_ativa?: boolean | null
          facebook?: string | null
          fotos?: Json | null
          grade?: Json | null
          hero_banner_url?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          modalidades?: Json | null
          nome?: string
          planos?: Json | null
          published?: boolean | null
          slug?: string
          stats?: Json | null
          telefone?: string | null
          tema?: string | null
          turmas_experimental?: string[] | null
          updated_at?: string | null
          whatsapp?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_configs_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_configs_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      landing_page_leads: {
        Row: {
          academy_id: string
          created_at: string | null
          email: string | null
          id: string
          modalidade: string | null
          nome: string
          notes: string | null
          status: string
          telefone: string
          turma: string | null
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          modalidade?: string | null
          nome: string
          notes?: string | null
          status?: string
          telefone: string
          turma?: string | null
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          modalidade?: string | null
          nome?: string
          notes?: string | null
          status?: string
          telefone?: string
          turma?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_leads_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_leads_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
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
            foreignKeyName: "leads_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
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
      lesson_plan_templates: {
        Row: {
          created_at: string | null
          drilling: string | null
          id: string
          name: string
          notes: string | null
          sparring: string | null
          technique_1: Json | null
          technique_2: Json | null
          theme: string | null
          updated_at: string | null
          warmup: string | null
        }
        Insert: {
          created_at?: string | null
          drilling?: string | null
          id?: string
          name: string
          notes?: string | null
          sparring?: string | null
          technique_1?: Json | null
          technique_2?: Json | null
          theme?: string | null
          updated_at?: string | null
          warmup?: string | null
        }
        Update: {
          created_at?: string | null
          drilling?: string | null
          id?: string
          name?: string
          notes?: string | null
          sparring?: string | null
          technique_1?: Json | null
          technique_2?: Json | null
          theme?: string | null
          updated_at?: string | null
          warmup?: string | null
        }
        Relationships: []
      }
      lesson_plans: {
        Row: {
          class_id: string
          created_at: string | null
          date: string | null
          drilling: string | null
          id: string
          notes: string | null
          professor_id: string | null
          sparring: string | null
          technique_1: Json | null
          technique_2: Json | null
          theme: string | null
          updated_at: string | null
          warmup: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          date?: string | null
          drilling?: string | null
          id?: string
          notes?: string | null
          professor_id?: string | null
          sparring?: string | null
          technique_1?: Json | null
          technique_2?: Json | null
          theme?: string | null
          updated_at?: string | null
          warmup?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          date?: string | null
          drilling?: string | null
          id?: string
          notes?: string | null
          professor_id?: string | null
          sparring?: string | null
          technique_1?: Json | null
          technique_2?: Json | null
          theme?: string | null
          updated_at?: string | null
          warmup?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plans_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_balances: {
        Row: {
          available: number | null
          created_at: string | null
          creator_id: string
          id: string
          pending: number | null
          total_earned: number | null
          total_withdrawn: number | null
          updated_at: string | null
        }
        Insert: {
          available?: number | null
          created_at?: string | null
          creator_id: string
          id?: string
          pending?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Update: {
          available?: number | null
          created_at?: string | null
          creator_id?: string
          id?: string
          pending?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_balances_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_courses: {
        Row: {
          belt_level: string | null
          created_at: string | null
          creator_academy: string | null
          creator_id: string | null
          creator_name: string | null
          description: string | null
          duration_total: number | null
          id: string
          modality: string | null
          modules: Json | null
          preview_video_url: string | null
          price: number | null
          rating: number | null
          reviews_count: number | null
          status: string | null
          students_count: number | null
          submitted_at: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          belt_level?: string | null
          created_at?: string | null
          creator_academy?: string | null
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          duration_total?: number | null
          id?: string
          modality?: string | null
          modules?: Json | null
          preview_video_url?: string | null
          price?: number | null
          rating?: number | null
          reviews_count?: number | null
          status?: string | null
          students_count?: number | null
          submitted_at?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          belt_level?: string | null
          created_at?: string | null
          creator_academy?: string | null
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          duration_total?: number | null
          id?: string
          modality?: string | null
          modules?: Json | null
          preview_video_url?: string | null
          price?: number | null
          rating?: number | null
          reviews_count?: number | null
          status?: string | null
          students_count?: number | null
          submitted_at?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_courses_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_creators: {
        Row: {
          academy: string | null
          courses_count: number | null
          created_at: string | null
          creator_id: string
          creator_name: string | null
          id: string
          total_revenue: number | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          academy?: string | null
          courses_count?: number | null
          created_at?: string | null
          creator_id: string
          creator_name?: string | null
          id?: string
          total_revenue?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          academy?: string | null
          courses_count?: number | null
          created_at?: string | null
          creator_id?: string
          creator_name?: string | null
          id?: string
          total_revenue?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_creators_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_transactions: {
        Row: {
          amount: number | null
          buyer_id: string | null
          commission: number | null
          course_id: string | null
          created_at: string | null
          creator_id: string | null
          id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          buyer_id?: string | null
          commission?: number | null
          course_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          buyer_id?: string | null
          commission?: number | null
          course_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_transactions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_withdrawals: {
        Row: {
          amount: number
          bank_info: string | null
          completed_at: string | null
          created_at: string | null
          creator_id: string
          id: string
          requested_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bank_info?: string | null
          completed_at?: string | null
          created_at?: string | null
          creator_id: string
          id?: string
          requested_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bank_info?: string | null
          completed_at?: string | null
          created_at?: string | null
          creator_id?: string
          id?: string
          requested_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_withdrawals_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      martial_arts_terms: {
        Row: {
          created_at: string | null
          definition: string | null
          id: string
          language: string | null
          modality: string | null
          term: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          definition?: string | null
          id?: string
          language?: string | null
          modality?: string | null
          term: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          definition?: string | null
          id?: string
          language?: string | null
          modality?: string | null
          term?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      meeting_actions: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          meeting_id: string
          prazo: string | null
          responsavel: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          meeting_id: string
          prazo?: string | null
          responsavel?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          meeting_id?: string
          prazo?: string | null
          responsavel?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_actions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_actions_responsavel_fkey"
            columns: ["responsavel"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          id: string
          meeting_id: string
          presente: boolean | null
          professor_id: string
        }
        Insert: {
          id?: string
          meeting_id: string
          presente?: boolean | null
          professor_id: string
        }
        Update: {
          id?: string
          meeting_id?: string
          presente?: boolean | null
          professor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_participants_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          academy_id: string
          asaas_customer_id: string | null
          asaas_subscription_id: string | null
          billing_day: number | null
          billing_notes: string | null
          billing_status: string | null
          billing_type: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string
          discount_percent: number | null
          discount_reason: string | null
          id: string
          monthly_amount: number | null
          payment_method: string | null
          profile_id: string
          recurrence: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          billing_day?: number | null
          billing_notes?: string | null
          billing_status?: string | null
          billing_type?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          discount_percent?: number | null
          discount_reason?: string | null
          id?: string
          monthly_amount?: number | null
          payment_method?: string | null
          profile_id: string
          recurrence?: string | null
          role: string
          status?: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          billing_day?: number | null
          billing_notes?: string | null
          billing_status?: string | null
          billing_type?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          discount_percent?: number | null
          discount_reason?: string | null
          id?: string
          monthly_amount?: number | null
          payment_method?: string | null
          profile_id?: string
          recurrence?: string | null
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
            foreignKeyName: "memberships_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
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
      message_sends: {
        Row: {
          academy_id: string | null
          channel: string | null
          created_at: string | null
          id: string
          status: string | null
          student_name: string | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id?: string | null
          channel?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          student_name?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string | null
          channel?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          student_name?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_sends_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_sends_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "message_sends_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          academy_id: string | null
          body: string
          category: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          variables: string[] | null
        }
        Insert: {
          academy_id?: string | null
          body: string
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Update: {
          academy_id?: string | null
          body?: string
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      messages: {
        Row: {
          channel: string
          content: string
          created_at: string
          from_id: string
          hidden_at: string | null
          hidden_by: string | null
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
          hidden_at?: string | null
          hidden_by?: string | null
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
          hidden_at?: string | null
          hidden_by?: string | null
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
          {
            foreignKeyName: "modalities_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      model_observability_snapshots: {
        Row: {
          academy_id: string | null
          avg_latency_ms: number | null
          created_at: string
          details: Json
          error_count: number | null
          estimated_cost: number | null
          feature_name: string | null
          id: string
          model: string | null
          model_version: string | null
          p95_latency_ms: number | null
          provider: string | null
          request_count: number | null
          snapshot_at: string
          status: Database["public"]["Enums"]["platform_signal_status"]
          timeout_count: number | null
        }
        Insert: {
          academy_id?: string | null
          avg_latency_ms?: number | null
          created_at?: string
          details?: Json
          error_count?: number | null
          estimated_cost?: number | null
          feature_name?: string | null
          id?: string
          model?: string | null
          model_version?: string | null
          p95_latency_ms?: number | null
          provider?: string | null
          request_count?: number | null
          snapshot_at?: string
          status?: Database["public"]["Enums"]["platform_signal_status"]
          timeout_count?: number | null
        }
        Update: {
          academy_id?: string | null
          avg_latency_ms?: number | null
          created_at?: string
          details?: Json
          error_count?: number | null
          estimated_cost?: number | null
          feature_name?: string | null
          id?: string
          model?: string | null
          model_version?: string | null
          p95_latency_ms?: number | null
          provider?: string | null
          request_count?: number | null
          snapshot_at?: string
          status?: Database["public"]["Enums"]["platform_signal_status"]
          timeout_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "model_observability_snapshots_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_observability_snapshots_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      module_usage_tracking: {
        Row: {
          academy_id: string
          action: string
          id: string
          module_slug: string
          page_path: string | null
          tracked_at: string | null
        }
        Insert: {
          academy_id: string
          action: string
          id?: string
          module_slug: string
          page_path?: string | null
          tracked_at?: string | null
        }
        Update: {
          academy_id?: string
          action?: string
          id?: string
          module_slug?: string
          page_path?: string | null
          tracked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_usage_tracking_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_usage_tracking_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      nfe_records: {
        Row: {
          academy_id: string | null
          created_at: string | null
          emitted_at: string | null
          error: string | null
          id: string
          number: string | null
          payment_id: string | null
          pdf_url: string | null
          status: string | null
          student_name: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          academy_id?: string | null
          created_at?: string | null
          emitted_at?: string | null
          error?: string | null
          id?: string
          number?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          status?: string | null
          student_name?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          academy_id?: string | null
          created_at?: string | null
          emitted_at?: string | null
          error?: string | null
          id?: string
          number?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          status?: string | null
          student_name?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nfe_records_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfe_records_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
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
            foreignKeyName: "nps_responses_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
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
      ocorrencias: {
        Row: {
          academy_id: string
          acao_tomada: string | null
          aluno_id: string | null
          created_at: string | null
          data: string | null
          descricao: string | null
          gravidade: string | null
          id: string
          professor_id: string | null
          responsavel_notificado: boolean | null
          tipo: string | null
          turma_id: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          acao_tomada?: string | null
          aluno_id?: string | null
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          gravidade?: string | null
          id?: string
          professor_id?: string | null
          responsavel_notificado?: boolean | null
          tipo?: string | null
          turma_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          acao_tomada?: string | null
          aluno_id?: string | null
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          gravidade?: string | null
          id?: string
          professor_id?: string | null
          responsavel_notificado?: boolean | null
          tipo?: string | null
          turma_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ocorrencias_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "ocorrencias_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      onboard_tokens: {
        Row: {
          academy_id: string | null
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          token: string
          updated_at: string | null
          used: boolean | null
          used_at: string | null
        }
        Insert: {
          academy_id?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          token: string
          updated_at?: string | null
          used?: boolean | null
          used_at?: string | null
        }
        Update: {
          academy_id?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          token?: string
          updated_at?: string | null
          used?: boolean | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboard_tokens_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboard_tokens_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      operational_costs: {
        Row: {
          active: boolean | null
          amount_brl: number
          category: string
          created_at: string | null
          description: string | null
          end_date: string | null
          frequency: string | null
          id: string
          name: string
          product: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          amount_brl?: number
          category: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name: string
          product?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          amount_brl?: number
          category?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name?: string
          product?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      os_breakdown: {
        Row: {
          count: number | null
          created_at: string | null
          id: string
          name: string | null
          percentage: number | null
          updated_at: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          id?: string
          name?: string | null
          percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          id?: string
          name?: string | null
          percentage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      page_popularity: {
        Row: {
          avg_time_seconds: number | null
          created_at: string | null
          id: string
          page: string | null
          unique_views: number | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          avg_time_seconds?: number | null
          created_at?: string | null
          id?: string
          page?: string | null
          unique_views?: number | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          avg_time_seconds?: number | null
          created_at?: string | null
          id?: string
          page?: string | null
          unique_views?: number | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      parental_permissions: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          key: string
          label: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          key: string
          label?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          key?: string
          label?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parental_permissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_charges: {
        Row: {
          academy_id: string
          billing_type: string
          boleto_barcode: string | null
          boleto_url: string | null
          created_at: string | null
          credit_card_token: string | null
          customer_id: string
          description: string
          due_date: string
          external_id: string | null
          id: string
          invoice_url: string | null
          net_value: number | null
          paid_at: string | null
          payment_method: string | null
          pix_copy_paste: string | null
          pix_qr_code: string | null
          status: string
          value: number
        }
        Insert: {
          academy_id: string
          billing_type?: string
          boleto_barcode?: string | null
          boleto_url?: string | null
          created_at?: string | null
          credit_card_token?: string | null
          customer_id: string
          description: string
          due_date: string
          external_id?: string | null
          id?: string
          invoice_url?: string | null
          net_value?: number | null
          paid_at?: string | null
          payment_method?: string | null
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          status?: string
          value: number
        }
        Update: {
          academy_id?: string
          billing_type?: string
          boleto_barcode?: string | null
          boleto_url?: string | null
          created_at?: string | null
          credit_card_token?: string | null
          customer_id?: string
          description?: string
          due_date?: string
          external_id?: string | null
          id?: string
          invoice_url?: string | null
          net_value?: number | null
          paid_at?: string | null
          payment_method?: string | null
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          status?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_charges_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_charges_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "payment_charges_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "payment_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_customers: {
        Row: {
          academy_id: string
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          external_id: string | null
          id: string
          name: string
          phone: string | null
          provider: string
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          external_id?: string | null
          id?: string
          name: string
          phone?: string | null
          provider?: string
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          external_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          provider?: string
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_customers_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_customers_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      payment_subscriptions: {
        Row: {
          academy_id: string
          billing_type: string
          created_at: string | null
          customer_id: string
          cycle: string
          description: string
          external_id: string | null
          id: string
          next_due_date: string
          status: string
          updated_at: string | null
          value: number
        }
        Insert: {
          academy_id: string
          billing_type?: string
          created_at?: string | null
          customer_id: string
          cycle?: string
          description: string
          external_id?: string | null
          id?: string
          next_due_date: string
          status?: string
          updated_at?: string | null
          value: number
        }
        Update: {
          academy_id?: string
          billing_type?: string
          created_at?: string | null
          customer_id?: string
          cycle?: string
          description?: string
          external_id?: string | null
          id?: string
          next_due_date?: string
          status?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_subscriptions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_subscriptions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "payment_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "payment_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          bill_id: string | null
          boleto_code: string | null
          created_at: string | null
          id: string
          method: string | null
          paid_at: string | null
          payment_url: string | null
          pix_code: string | null
          receipt_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          bill_id?: string | null
          boleto_code?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          paid_at?: string | null
          payment_url?: string | null
          pix_code?: string | null
          receipt_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          bill_id?: string | null
          boleto_code?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          paid_at?: string | null
          payment_url?: string | null
          pix_code?: string | null
          receipt_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      peak_hours: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          hour: number | null
          id: string
          session_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          hour?: number | null
          id?: string
          session_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          hour?: number | null
          id?: string
          session_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pedagogical_meetings: {
        Row: {
          academy_id: string
          ata: string | null
          created_at: string | null
          criado_por: string | null
          data: string
          id: string
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          ata?: string | null
          created_at?: string | null
          criado_por?: string | null
          data: string
          id?: string
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          ata?: string | null
          created_at?: string | null
          criado_por?: string | null
          data?: string
          id?: string
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedagogical_meetings_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedagogical_meetings_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "pedagogical_meetings_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          account_id: string | null
          avatar_url: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          gender: string | null
          id: string
          medical_notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          gender?: string | null
          id?: string
          medical_notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          medical_notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_by_device: {
        Row: {
          avg_cls: number | null
          avg_fcp: number | null
          avg_lcp: number | null
          created_at: string | null
          device_type: string | null
          id: string
          load_count: number | null
          updated_at: string | null
        }
        Insert: {
          avg_cls?: number | null
          avg_fcp?: number | null
          avg_lcp?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          load_count?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_cls?: number | null
          avg_fcp?: number | null
          avg_lcp?: number | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          load_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_by_page: {
        Row: {
          avg_cls: number | null
          avg_fcp: number | null
          avg_lcp: number | null
          created_at: string | null
          id: string
          load_count: number | null
          page: string | null
          updated_at: string | null
        }
        Insert: {
          avg_cls?: number | null
          avg_fcp?: number | null
          avg_lcp?: number | null
          created_at?: string | null
          id?: string
          load_count?: number | null
          page?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_cls?: number | null
          avg_fcp?: number | null
          avg_lcp?: number | null
          created_at?: string | null
          id?: string
          load_count?: number | null
          page?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_overview: {
        Row: {
          avg_cls: number | null
          avg_fcp: number | null
          avg_fid: number | null
          avg_lcp: number | null
          avg_ttfb: number | null
          created_at: string | null
          good_cls: number | null
          good_fcp: number | null
          good_lcp: number | null
          id: string
          needs_improvement_cls: number | null
          needs_improvement_fcp: number | null
          needs_improvement_lcp: number | null
          p75_cls: number | null
          p75_fcp: number | null
          p75_lcp: number | null
          p95_cls: number | null
          p95_fcp: number | null
          p95_lcp: number | null
          poor_cls: number | null
          poor_fcp: number | null
          poor_lcp: number | null
          total_page_loads: number | null
          updated_at: string | null
        }
        Insert: {
          avg_cls?: number | null
          avg_fcp?: number | null
          avg_fid?: number | null
          avg_lcp?: number | null
          avg_ttfb?: number | null
          created_at?: string | null
          good_cls?: number | null
          good_fcp?: number | null
          good_lcp?: number | null
          id?: string
          needs_improvement_cls?: number | null
          needs_improvement_fcp?: number | null
          needs_improvement_lcp?: number | null
          p75_cls?: number | null
          p75_fcp?: number | null
          p75_lcp?: number | null
          p95_cls?: number | null
          p95_fcp?: number | null
          p95_lcp?: number | null
          poor_cls?: number | null
          poor_fcp?: number | null
          poor_lcp?: number | null
          total_page_loads?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_cls?: number | null
          avg_fcp?: number | null
          avg_fid?: number | null
          avg_lcp?: number | null
          avg_ttfb?: number | null
          created_at?: string | null
          good_cls?: number | null
          good_fcp?: number | null
          good_lcp?: number | null
          id?: string
          needs_improvement_cls?: number | null
          needs_improvement_fcp?: number | null
          needs_improvement_lcp?: number | null
          p75_cls?: number | null
          p75_fcp?: number | null
          p75_lcp?: number | null
          p95_cls?: number | null
          p95_fcp?: number | null
          p95_lcp?: number | null
          poor_cls?: number | null
          poor_fcp?: number | null
          poor_lcp?: number | null
          total_page_loads?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_trend: {
        Row: {
          avg_cls: number | null
          avg_fcp: number | null
          avg_lcp: number | null
          created_at: string | null
          date: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avg_cls?: number | null
          avg_fcp?: number | null
          avg_lcp?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          avg_cls?: number | null
          avg_fcp?: number | null
          avg_lcp?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      planos_aula: {
        Row: {
          academy_id: string | null
          aquecimento: string | null
          created_at: string | null
          data: string | null
          encerramento: string | null
          id: string
          observacoes: string | null
          pratica: string | null
          professor_id: string | null
          status: string | null
          tecnica_principal: Json | null
          turma_id: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id?: string | null
          aquecimento?: string | null
          created_at?: string | null
          data?: string | null
          encerramento?: string | null
          id?: string
          observacoes?: string | null
          pratica?: string | null
          professor_id?: string | null
          status?: string | null
          tecnica_principal?: Json | null
          turma_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string | null
          aquecimento?: string | null
          created_at?: string | null
          data?: string | null
          encerramento?: string | null
          id?: string
          observacoes?: string | null
          pratica?: string | null
          professor_id?: string | null
          status?: string | null
          tecnica_principal?: Json | null
          turma_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_aula_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_aula_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "planos_aula_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_aula_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          academy_id: string | null
          created_at: string
          features: Json
          has_events: boolean | null
          has_financeiro: boolean | null
          has_store: boolean | null
          has_streaming: boolean | null
          id: string
          interval: string
          is_active: boolean | null
          max_classes: number
          max_professors: number
          max_students: number
          name: string
          price: number
          price_monthly: number | null
          price_yearly: number | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          academy_id?: string | null
          created_at?: string
          features?: Json
          has_events?: boolean | null
          has_financeiro?: boolean | null
          has_store?: boolean | null
          has_streaming?: boolean | null
          id?: string
          interval: string
          is_active?: boolean | null
          max_classes?: number
          max_professors?: number
          max_students?: number
          name: string
          price: number
          price_monthly?: number | null
          price_yearly?: number | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          academy_id?: string | null
          created_at?: string
          features?: Json
          has_events?: boolean | null
          has_financeiro?: boolean | null
          has_store?: boolean | null
          has_streaming?: boolean | null
          id?: string
          interval?: string
          is_active?: boolean | null
          max_classes?: number
          max_professors?: number
          max_students?: number
          name?: string
          price?: number
          price_monthly?: number | null
          price_yearly?: number | null
          slug?: string | null
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
          {
            foreignKeyName: "plans_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      platform_alerts: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          resolved: boolean | null
          severity: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          resolved?: boolean | null
          severity?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          resolved?: boolean | null
          severity?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_health_snapshots: {
        Row: {
          academy_id: string | null
          checked_at: string
          component: Database["public"]["Enums"]["platform_health_component_type"]
          consecutive_failures: number
          created_at: string
          details: Json
          environment: string | null
          error_rate_percent: number | null
          id: string
          latency_ms: number | null
          release_version: string | null
          status: Database["public"]["Enums"]["platform_signal_status"]
          uptime_percent: number | null
        }
        Insert: {
          academy_id?: string | null
          checked_at?: string
          component: Database["public"]["Enums"]["platform_health_component_type"]
          consecutive_failures?: number
          created_at?: string
          details?: Json
          environment?: string | null
          error_rate_percent?: number | null
          id?: string
          latency_ms?: number | null
          release_version?: string | null
          status?: Database["public"]["Enums"]["platform_signal_status"]
          uptime_percent?: number | null
        }
        Update: {
          academy_id?: string | null
          checked_at?: string
          component?: Database["public"]["Enums"]["platform_health_component_type"]
          consecutive_failures?: number
          created_at?: string
          details?: Json
          environment?: string | null
          error_rate_percent?: number | null
          id?: string
          latency_ms?: number | null
          release_version?: string | null
          status?: Database["public"]["Enums"]["platform_signal_status"]
          uptime_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_health_snapshots_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_health_snapshots_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      platform_incidents: {
        Row: {
          academy_id: string | null
          acknowledged_at: string | null
          created_at: string
          device_type:
            | Database["public"]["Enums"]["platform_device_type"]
            | null
          id: string
          incident_type: Database["public"]["Enums"]["platform_incident_type"]
          metadata: Json
          release_version: string | null
          resolved_at: string | null
          route_path: string | null
          severity: Database["public"]["Enums"]["platform_severity"]
          started_at: string
          status: Database["public"]["Enums"]["platform_status"]
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          academy_id?: string | null
          acknowledged_at?: string | null
          created_at?: string
          device_type?:
            | Database["public"]["Enums"]["platform_device_type"]
            | null
          id?: string
          incident_type: Database["public"]["Enums"]["platform_incident_type"]
          metadata?: Json
          release_version?: string | null
          resolved_at?: string | null
          route_path?: string | null
          severity?: Database["public"]["Enums"]["platform_severity"]
          started_at?: string
          status?: Database["public"]["Enums"]["platform_status"]
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          academy_id?: string | null
          acknowledged_at?: string | null
          created_at?: string
          device_type?:
            | Database["public"]["Enums"]["platform_device_type"]
            | null
          id?: string
          incident_type?: Database["public"]["Enums"]["platform_incident_type"]
          metadata?: Json
          release_version?: string | null
          resolved_at?: string | null
          route_path?: string | null
          severity?: Database["public"]["Enums"]["platform_severity"]
          started_at?: string
          status?: Database["public"]["Enums"]["platform_status"]
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_incidents_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_incidents_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      platform_plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean
          is_custom_price: boolean
          is_popular: boolean
          max_alunos: number | null
          max_professores: number | null
          max_storage_gb: number
          max_turmas: number | null
          max_unidades: number | null
          name: string
          overage_aluno: number
          overage_professor: number
          overage_storage_gb: number
          overage_unidade: number
          price_monthly: number
          sort_order: number
          tier: string
          trial_days: number
          trial_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_custom_price?: boolean
          is_popular?: boolean
          max_alunos?: number | null
          max_professores?: number | null
          max_storage_gb?: number
          max_turmas?: number | null
          max_unidades?: number | null
          name: string
          overage_aluno?: number
          overage_professor?: number
          overage_storage_gb?: number
          overage_unidade?: number
          price_monthly?: number
          sort_order?: number
          tier: string
          trial_days?: number
          trial_tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_custom_price?: boolean
          is_popular?: boolean
          max_alunos?: number | null
          max_professores?: number | null
          max_storage_gb?: number
          max_turmas?: number | null
          max_unidades?: number | null
          name?: string
          overage_aluno?: number
          overage_professor?: number
          overage_storage_gb?: number
          overage_unidade?: number
          price_monthly?: number
          sort_order?: number
          tier?: string
          trial_days?: number
          trial_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_risk_snapshots: {
        Row: {
          academy_id: string | null
          auth_failures: number | null
          created_at: string
          details: Json
          id: string
          notes: string | null
          overall_status: Database["public"]["Enums"]["platform_signal_status"]
          release_regression_percent: number | null
          repeated_error_growth_percent: number | null
          risk_score: number
          security_score: number | null
          snapshot_at: string
          suspicious_logins: number | null
          ux_score: number | null
        }
        Insert: {
          academy_id?: string | null
          auth_failures?: number | null
          created_at?: string
          details?: Json
          id?: string
          notes?: string | null
          overall_status?: Database["public"]["Enums"]["platform_signal_status"]
          release_regression_percent?: number | null
          repeated_error_growth_percent?: number | null
          risk_score?: number
          security_score?: number | null
          snapshot_at?: string
          suspicious_logins?: number | null
          ux_score?: number | null
        }
        Update: {
          academy_id?: string | null
          auth_failures?: number | null
          created_at?: string
          details?: Json
          id?: string
          notes?: string | null
          overall_status?: Database["public"]["Enums"]["platform_signal_status"]
          release_regression_percent?: number | null
          repeated_error_growth_percent?: number | null
          risk_score?: number
          security_score?: number | null
          snapshot_at?: string
          suspicious_logins?: number | null
          ux_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_risk_snapshots_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_risk_snapshots_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      pre_checkins: {
        Row: {
          academy_id: string
          class_date: string
          class_id: string
          created_at: string
          id: string
          status: string
          student_id: string
        }
        Insert: {
          academy_id: string
          class_date: string
          class_id: string
          created_at?: string
          id?: string
          status?: string
          student_id: string
        }
        Update: {
          academy_id?: string
          class_date?: string
          class_id?: string
          created_at?: string
          id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pre_checkins_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_checkins_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "pre_checkins_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_modules: {
        Row: {
          category: string
          created_at: string | null
          depends_on: string[] | null
          description: string | null
          features: Json | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
          slug: string
          sort_order: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          depends_on?: string[] | null
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
          slug: string
          sort_order?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          depends_on?: string[] | null
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      pricing_packages: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percent: number
          icon: string | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          module_slugs: string[]
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percent?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          module_slugs: string[]
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percent?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          module_slugs?: string[]
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      pricing_tiers: {
        Row: {
          classes_included: number
          created_at: string | null
          id: string
          is_active: boolean | null
          max_students: number
          min_students: number
          name: string
          price_monthly: number
          price_yearly: number
          professors_included: number
          slug: string
          sort_order: number | null
          units_included: number
        }
        Insert: {
          classes_included?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_students: number
          min_students: number
          name: string
          price_monthly: number
          price_yearly: number
          professors_included?: number
          slug: string
          sort_order?: number | null
          units_included?: number
        }
        Update: {
          classes_included?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_students?: number
          min_students?: number
          name?: string
          price_monthly?: number
          price_yearly?: number
          professors_included?: number
          slug?: string
          sort_order?: number | null
          units_included?: number
        }
        Relationships: []
      }
      professor_metrics: {
        Row: {
          academy_id: string
          avg_attendance: number | null
          avg_evaluation: number | null
          created_at: string | null
          id: string
          professor_id: string
          professor_name: string | null
          retention_rate: number | null
          total_classes: number | null
          total_students: number | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          avg_attendance?: number | null
          avg_evaluation?: number | null
          created_at?: string | null
          id?: string
          professor_id: string
          professor_name?: string | null
          retention_rate?: number | null
          total_classes?: number | null
          total_students?: number | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          avg_attendance?: number | null
          avg_evaluation?: number | null
          created_at?: string | null
          id?: string
          professor_id?: string
          professor_name?: string | null
          retention_rate?: number | null
          total_classes?: number | null
          total_students?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professor_metrics_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professor_metrics_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "professor_metrics_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_evolution_log: {
        Row: {
          created_at: string | null
          evolved_by: string | null
          from_role: string
          id: string
          preserved_data: Json | null
          profile_id: string
          reason: string | null
          to_role: string
        }
        Insert: {
          created_at?: string | null
          evolved_by?: string | null
          from_role: string
          id?: string
          preserved_data?: Json | null
          profile_id: string
          reason?: string | null
          to_role: string
        }
        Update: {
          created_at?: string | null
          evolved_by?: string | null
          from_role?: string
          id?: string
          preserved_data?: Json | null
          profile_id?: string
          reason?: string | null
          to_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_evolution_log_evolved_by_fkey"
            columns: ["evolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_evolution_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accent_color: string | null
          avatar: string | null
          avatar_url: string | null
          bio: string | null
          cpf: string | null
          created_at: string
          cref: string | null
          display_name: string
          favorite_color: string | null
          favorite_emoji: string | null
          guardian_pin_hash: string | null
          has_seen_tour: boolean | null
          height: number | null
          id: string
          injuries: string | null
          lifecycle_status: string | null
          needs_password_change: boolean | null
          nickname: string | null
          notification_email: boolean | null
          notification_push: boolean | null
          notification_sms: boolean | null
          objective: string | null
          parental_controls: Json | null
          person_id: string | null
          phone: string | null
          role: string
          specialties: Json | null
          theme_preference: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          accent_color?: string | null
          avatar?: string | null
          avatar_url?: string | null
          bio?: string | null
          cpf?: string | null
          created_at?: string
          cref?: string | null
          display_name: string
          favorite_color?: string | null
          favorite_emoji?: string | null
          guardian_pin_hash?: string | null
          has_seen_tour?: boolean | null
          height?: number | null
          id?: string
          injuries?: string | null
          lifecycle_status?: string | null
          needs_password_change?: boolean | null
          nickname?: string | null
          notification_email?: boolean | null
          notification_push?: boolean | null
          notification_sms?: boolean | null
          objective?: string | null
          parental_controls?: Json | null
          person_id?: string | null
          phone?: string | null
          role: string
          specialties?: Json | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          accent_color?: string | null
          avatar?: string | null
          avatar_url?: string | null
          bio?: string | null
          cpf?: string | null
          created_at?: string
          cref?: string | null
          display_name?: string
          favorite_color?: string | null
          favorite_emoji?: string | null
          guardian_pin_hash?: string | null
          has_seen_tour?: boolean | null
          height?: number | null
          id?: string
          injuries?: string | null
          lifecycle_status?: string | null
          needs_password_change?: boolean | null
          nickname?: string | null
          notification_email?: boolean | null
          notification_push?: boolean | null
          notification_sms?: boolean | null
          objective?: string | null
          parental_controls?: Json | null
          person_id?: string | null
          phone?: string | null
          role?: string
          specialties?: Json | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
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
      prospect_contacts: {
        Row: {
          canal: string
          created_at: string | null
          data: string
          id: string
          prospect_id: string
          resultado: string | null
          resumo: string
        }
        Insert: {
          canal: string
          created_at?: string | null
          data?: string
          id?: string
          prospect_id: string
          resultado?: string | null
          resumo: string
        }
        Update: {
          canal?: string
          created_at?: string | null
          data?: string
          id?: string
          prospect_id?: string
          resultado?: string | null
          resumo?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_contacts_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_contatos: {
        Row: {
          created_at: string | null
          data: string | null
          descricao: string | null
          id: string
          prospect_id: string
          responsavel: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          prospect_id: string
          responsavel?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          prospect_id?: string
          responsavel?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_contatos_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_observacoes: {
        Row: {
          autor: string | null
          created_at: string | null
          id: string
          prospect_id: string
          texto: string | null
          updated_at: string | null
        }
        Insert: {
          autor?: string | null
          created_at?: string | null
          id?: string
          prospect_id: string
          texto?: string | null
          updated_at?: string | null
        }
        Update: {
          autor?: string | null
          created_at?: string | null
          id?: string
          prospect_id?: string
          texto?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_observacoes_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          abordagem: Json | null
          academy_id: string | null
          alunos_estimados: number | null
          analise: Json | null
          atualizado_em: string | null
          bairro: string | null
          buscado_em: string | null
          canal_contato: string | null
          cidade: string | null
          classificacao: string | null
          created_at: string | null
          endereco: string | null
          estado: string | null
          facebook: string | null
          faturamento_estimado: number | null
          fonte: string | null
          google_maps_url: string | null
          google_place_id: string | null
          id: string
          instagram: string | null
          instagram_seguidores: number | null
          latitude: number | null
          longitude: number | null
          modalidades: string[] | null
          motivo_perda: string | null
          nome: string
          nota_google: number | null
          observacoes: string | null
          proximo_contato: string | null
          responsavel: string | null
          score_breakdown: Json | null
          score_total: number | null
          sinais_dor: string[] | null
          sinais_oportunidade: string[] | null
          sistema_detectado: string | null
          site: string | null
          status: string | null
          tamanho: string | null
          telefone: string | null
          total_avaliacoes: number | null
          ultimo_contato: string | null
        }
        Insert: {
          abordagem?: Json | null
          academy_id?: string | null
          alunos_estimados?: number | null
          analise?: Json | null
          atualizado_em?: string | null
          bairro?: string | null
          buscado_em?: string | null
          canal_contato?: string | null
          cidade?: string | null
          classificacao?: string | null
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          facebook?: string | null
          faturamento_estimado?: number | null
          fonte?: string | null
          google_maps_url?: string | null
          google_place_id?: string | null
          id?: string
          instagram?: string | null
          instagram_seguidores?: number | null
          latitude?: number | null
          longitude?: number | null
          modalidades?: string[] | null
          motivo_perda?: string | null
          nome: string
          nota_google?: number | null
          observacoes?: string | null
          proximo_contato?: string | null
          responsavel?: string | null
          score_breakdown?: Json | null
          score_total?: number | null
          sinais_dor?: string[] | null
          sinais_oportunidade?: string[] | null
          sistema_detectado?: string | null
          site?: string | null
          status?: string | null
          tamanho?: string | null
          telefone?: string | null
          total_avaliacoes?: number | null
          ultimo_contato?: string | null
        }
        Update: {
          abordagem?: Json | null
          academy_id?: string | null
          alunos_estimados?: number | null
          analise?: Json | null
          atualizado_em?: string | null
          bairro?: string | null
          buscado_em?: string | null
          canal_contato?: string | null
          cidade?: string | null
          classificacao?: string | null
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          facebook?: string | null
          faturamento_estimado?: number | null
          fonte?: string | null
          google_maps_url?: string | null
          google_place_id?: string | null
          id?: string
          instagram?: string | null
          instagram_seguidores?: number | null
          latitude?: number | null
          longitude?: number | null
          modalidades?: string[] | null
          motivo_perda?: string | null
          nome?: string
          nota_google?: number | null
          observacoes?: string | null
          proximo_contato?: string | null
          responsavel?: string | null
          score_breakdown?: Json | null
          score_total?: number | null
          sinais_dor?: string[] | null
          sinais_oportunidade?: string[] | null
          sistema_detectado?: string | null
          site?: string | null
          status?: string | null
          tamanho?: string | null
          telefone?: string | null
          total_avaliacoes?: number | null
          ultimo_contato?: string | null
        }
        Relationships: []
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
      question_votes: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_votes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "video_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          academy_id: string | null
          amount: number | null
          created_at: string | null
          description: string | null
          id: string
          method: string | null
          student_name: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id?: string | null
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          method?: string | null
          student_name?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string | null
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          method?: string | null
          student_name?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      recommendation_views: {
        Row: {
          created_at: string | null
          id: string
          source: string | null
          updated_at: string | null
          user_id: string | null
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          academy_id: string
          active: boolean | null
          code: string
          created_at: string | null
          discount_pct: number | null
          id: string
          max_uses: number | null
          referrer_id: string | null
          referrer_name: string | null
          reward_months: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          academy_id: string
          active?: boolean | null
          code: string
          created_at?: string | null
          discount_pct?: number | null
          id?: string
          max_uses?: number | null
          referrer_id?: string | null
          referrer_name?: string | null
          reward_months?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          academy_id?: string
          active?: boolean | null
          code?: string
          created_at?: string | null
          discount_pct?: number | null
          id?: string
          max_uses?: number | null
          referrer_id?: string | null
          referrer_name?: string | null
          reward_months?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_codes_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "referral_codes_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          academy_id: string
          converted_at: string | null
          created_at: string | null
          id: string
          referral_code: string | null
          referred_academy_name: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string | null
          referred_academy_name?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string | null
          referred_academy_name?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      relatorios_pedagogicos: {
        Row: {
          academy_id: string
          alunos_atencao: Json | null
          alunos_destaque: Json | null
          created_at: string | null
          id: string
          mes: string
          meta_proximo_mes: Json | null
          metricas: Json | null
          por_professor: Json | null
          resumo_executivo: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          alunos_atencao?: Json | null
          alunos_destaque?: Json | null
          created_at?: string | null
          id?: string
          mes: string
          meta_proximo_mes?: Json | null
          metricas?: Json | null
          por_professor?: Json | null
          resumo_executivo?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          alunos_atencao?: Json | null
          alunos_destaque?: Json | null
          created_at?: string | null
          id?: string
          mes?: string
          meta_proximo_mes?: Json | null
          metricas?: Json | null
          por_professor?: Json | null
          resumo_executivo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_pedagogicos_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_pedagogicos_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      report_sends: {
        Row: {
          academy_id: string | null
          created_at: string | null
          id: string
          recipient_email: string | null
          report_type: string | null
          sent_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          academy_id?: string | null
          created_at?: string | null
          id?: string
          recipient_email?: string | null
          report_type?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string | null
          created_at?: string | null
          id?: string
          recipient_email?: string | null
          report_type?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_sends_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_sends_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      retention: {
        Row: {
          cohort: string | null
          created_at: string | null
          id: string
          period: number | null
          rate: number | null
          retained: number | null
          updated_at: string | null
          users: number | null
        }
        Insert: {
          cohort?: string | null
          created_at?: string | null
          id?: string
          period?: number | null
          rate?: number | null
          retained?: number | null
          updated_at?: string | null
          users?: number | null
        }
        Update: {
          cohort?: string | null
          created_at?: string | null
          id?: string
          period?: number | null
          rate?: number | null
          retained?: number | null
          updated_at?: string | null
          users?: number | null
        }
        Relationships: []
      }
      reunioes_pedagogicas: {
        Row: {
          academy_id: string
          acoes_definidas: Json | null
          ata: string | null
          created_at: string | null
          criado_por: string | null
          data: string | null
          decisoes: Json | null
          id: string
          participantes: Json | null
          pauta: Json | null
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          acoes_definidas?: Json | null
          ata?: string | null
          created_at?: string | null
          criado_por?: string | null
          data?: string | null
          decisoes?: Json | null
          id?: string
          participantes?: Json | null
          pauta?: Json | null
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          acoes_definidas?: Json | null
          ata?: string | null
          created_at?: string | null
          criado_por?: string | null
          data?: string | null
          decisoes?: Json | null
          id?: string
          participantes?: Json | null
          pauta?: Json | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reunioes_pedagogicas_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reunioes_pedagogicas_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "reunioes_pedagogicas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "series_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
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
      session_history: {
        Row: {
          academy_id: string | null
          academy_name: string | null
          browser: string | null
          city: string | null
          connection_type: string | null
          created_at: string | null
          device_model: string | null
          device_type: string | null
          duration_minutes: number | null
          ended_at: string | null
          errors: Json | null
          id: string
          ip: string | null
          os: string | null
          page_history: Json | null
          pages_viewed: number | null
          performance_metrics: Json | null
          screen_resolution: string | null
          started_at: string | null
          updated_at: string | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          academy_id?: string | null
          academy_name?: string | null
          browser?: string | null
          city?: string | null
          connection_type?: string | null
          created_at?: string | null
          device_model?: string | null
          device_type?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          errors?: Json | null
          id?: string
          ip?: string | null
          os?: string | null
          page_history?: Json | null
          pages_viewed?: number | null
          performance_metrics?: Json | null
          screen_resolution?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          academy_id?: string | null
          academy_name?: string | null
          browser?: string | null
          city?: string | null
          connection_type?: string | null
          created_at?: string | null
          device_model?: string | null
          device_type?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          errors?: Json | null
          id?: string
          ip?: string | null
          os?: string | null
          page_history?: Json | null
          pages_viewed?: number | null
          performance_metrics?: Json | null
          screen_resolution?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_history_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_history_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "session_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      software_contract_template: {
        Row: {
          body_html: string
          created_at: string | null
          id: string
          plan_clauses: Json | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          body_html?: string
          created_at?: string | null
          id?: string
          plan_clauses?: Json | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          body_html?: string
          created_at?: string | null
          id?: string
          plan_clauses?: Json | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "software_contract_template_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      software_contracts: {
        Row: {
          academy_address: string | null
          academy_cnpj: string | null
          academy_id: string
          academy_name: string
          academy_owner_cpf: string | null
          academy_owner_email: string
          academy_owner_name: string
          academy_phone: string | null
          auto_renew: boolean | null
          billing_cycle: string | null
          contract_body_html: string | null
          contract_duration_months: number | null
          contract_start_date: string
          created_at: string | null
          digital_hash: string | null
          discount_percent: number | null
          id: string
          monthly_value_cents: number
          pdf_url: string | null
          plan_name: string
          plan_slug: string
          signature_ip: string | null
          signature_ua: string | null
          signed_at: string | null
          status: string | null
          template_version: number
          trial_ended_at: string | null
          trial_started_at: string | null
          updated_at: string | null
        }
        Insert: {
          academy_address?: string | null
          academy_cnpj?: string | null
          academy_id: string
          academy_name: string
          academy_owner_cpf?: string | null
          academy_owner_email: string
          academy_owner_name: string
          academy_phone?: string | null
          auto_renew?: boolean | null
          billing_cycle?: string | null
          contract_body_html?: string | null
          contract_duration_months?: number | null
          contract_start_date?: string
          created_at?: string | null
          digital_hash?: string | null
          discount_percent?: number | null
          id?: string
          monthly_value_cents: number
          pdf_url?: string | null
          plan_name: string
          plan_slug: string
          signature_ip?: string | null
          signature_ua?: string | null
          signed_at?: string | null
          status?: string | null
          template_version?: number
          trial_ended_at?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          academy_address?: string | null
          academy_cnpj?: string | null
          academy_id?: string
          academy_name?: string
          academy_owner_cpf?: string | null
          academy_owner_email?: string
          academy_owner_name?: string
          academy_phone?: string | null
          auto_renew?: boolean | null
          billing_cycle?: string | null
          contract_body_html?: string | null
          contract_duration_months?: number | null
          contract_start_date?: string
          created_at?: string | null
          digital_hash?: string | null
          discount_percent?: number | null
          id?: string
          monthly_value_cents?: number
          pdf_url?: string | null
          plan_name?: string
          plan_slug?: string
          signature_ip?: string | null
          signature_ua?: string | null
          signed_at?: string | null
          status?: string | null
          template_version?: number
          trial_ended_at?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "software_contracts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_contracts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      storage_usage: {
        Row: {
          academy_id: string
          id: string
          last_calculated_at: string | null
          storage_limit_bytes: number | null
          total_size_bytes: number | null
          total_videos: number | null
        }
        Insert: {
          academy_id: string
          id?: string
          last_calculated_at?: string | null
          storage_limit_bytes?: number | null
          total_size_bytes?: number | null
          total_videos?: number | null
        }
        Update: {
          academy_id?: string
          id?: string
          last_calculated_at?: string | null
          storage_limit_bytes?: number | null
          total_size_bytes?: number | null
          total_videos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_usage_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_usage_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      student_contracts: {
        Row: {
          academy_id: string
          auto_renew: boolean | null
          cancellation_date: string | null
          cancellation_reason: string | null
          contract_body_html: string | null
          created_at: string | null
          digital_hash: string | null
          duration_months: number
          end_date: string
          enrollment_fee_cents: number | null
          guardian_cpf: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_profile_id: string | null
          guardian_relationship: string | null
          guardian_signature_ip: string | null
          guardian_signature_ua: string | null
          id: string
          image_consent_accepted: boolean | null
          injury_waiver_accepted: boolean | null
          lgpd_consent_accepted: boolean | null
          medical_clearance_accepted: boolean | null
          membership_id: string | null
          modalities: string[] | null
          monthly_value_cents: number
          payment_day: number
          pdf_url: string | null
          plan_name: string
          signed_at: string | null
          source: string | null
          start_date: string
          status: string | null
          student_address: string | null
          student_birth_date: string | null
          student_cpf: string | null
          student_email: string
          student_name: string
          student_phone: string | null
          student_profile_id: string
          student_signature_ip: string | null
          student_signature_ua: string | null
          template_id: string | null
          template_version: number | null
          updated_at: string | null
          uploaded_file_url: string | null
        }
        Insert: {
          academy_id: string
          auto_renew?: boolean | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          contract_body_html?: string | null
          created_at?: string | null
          digital_hash?: string | null
          duration_months?: number
          end_date?: string
          enrollment_fee_cents?: number | null
          guardian_cpf?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_profile_id?: string | null
          guardian_relationship?: string | null
          guardian_signature_ip?: string | null
          guardian_signature_ua?: string | null
          id?: string
          image_consent_accepted?: boolean | null
          injury_waiver_accepted?: boolean | null
          lgpd_consent_accepted?: boolean | null
          medical_clearance_accepted?: boolean | null
          membership_id?: string | null
          modalities?: string[] | null
          monthly_value_cents: number
          payment_day?: number
          pdf_url?: string | null
          plan_name: string
          signed_at?: string | null
          source?: string | null
          start_date?: string
          status?: string | null
          student_address?: string | null
          student_birth_date?: string | null
          student_cpf?: string | null
          student_email: string
          student_name: string
          student_phone?: string | null
          student_profile_id: string
          student_signature_ip?: string | null
          student_signature_ua?: string | null
          template_id?: string | null
          template_version?: number | null
          updated_at?: string | null
          uploaded_file_url?: string | null
        }
        Update: {
          academy_id?: string
          auto_renew?: boolean | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          contract_body_html?: string | null
          created_at?: string | null
          digital_hash?: string | null
          duration_months?: number
          end_date?: string
          enrollment_fee_cents?: number | null
          guardian_cpf?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_profile_id?: string | null
          guardian_relationship?: string | null
          guardian_signature_ip?: string | null
          guardian_signature_ua?: string | null
          id?: string
          image_consent_accepted?: boolean | null
          injury_waiver_accepted?: boolean | null
          lgpd_consent_accepted?: boolean | null
          medical_clearance_accepted?: boolean | null
          membership_id?: string | null
          modalities?: string[] | null
          monthly_value_cents?: number
          payment_day?: number
          pdf_url?: string | null
          plan_name?: string
          signed_at?: string | null
          source?: string | null
          start_date?: string
          status?: string | null
          student_address?: string | null
          student_birth_date?: string | null
          student_cpf?: string | null
          student_email?: string
          student_name?: string
          student_phone?: string | null
          student_profile_id?: string
          student_signature_ip?: string | null
          student_signature_ua?: string | null
          template_id?: string | null
          template_version?: number | null
          updated_at?: string | null
          uploaded_file_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_contracts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_contracts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "student_contracts_guardian_profile_id_fkey"
            columns: ["guardian_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_contracts_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_contracts_student_profile_id_fkey"
            columns: ["student_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "academy_contract_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      student_evaluations: {
        Row: {
          behavior: number | null
          class_id: string | null
          comment: string | null
          created_at: string | null
          evolution: number | null
          id: string
          posture: number | null
          professor_id: string | null
          student_id: string
          student_name: string | null
          technique: number | null
          updated_at: string | null
        }
        Insert: {
          behavior?: number | null
          class_id?: string | null
          comment?: string | null
          created_at?: string | null
          evolution?: number | null
          id?: string
          posture?: number | null
          professor_id?: string | null
          student_id: string
          student_name?: string | null
          technique?: number | null
          updated_at?: string | null
        }
        Update: {
          behavior?: number | null
          class_id?: string | null
          comment?: string | null
          created_at?: string | null
          evolution?: number | null
          id?: string
          posture?: number | null
          professor_id?: string | null
          student_id?: string
          student_name?: string | null
          technique?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_evaluations_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_evaluations_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_financial_alerts: {
        Row: {
          academy_id: string
          alert_kind: string
          alert_reference_date: string
          channel: string
          created_at: string
          id: string
          membership_id: string
          message: string | null
          metadata: Json
          profile_id: string
          recipient_profile_id: string | null
          recipient_type: string
          remaining_checkins: number | null
          sent_at: string
          status: string
        }
        Insert: {
          academy_id: string
          alert_kind: string
          alert_reference_date?: string
          channel?: string
          created_at?: string
          id?: string
          membership_id: string
          message?: string | null
          metadata?: Json
          profile_id: string
          recipient_profile_id?: string | null
          recipient_type: string
          remaining_checkins?: number | null
          sent_at?: string
          status?: string
        }
        Update: {
          academy_id?: string
          alert_kind?: string
          alert_reference_date?: string
          channel?: string
          created_at?: string
          id?: string
          membership_id?: string
          message?: string | null
          metadata?: Json
          profile_id?: string
          recipient_profile_id?: string | null
          recipient_type?: string
          remaining_checkins?: number | null
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_financial_alerts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_financial_alerts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "student_financial_alerts_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_financial_alerts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_financial_alerts_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_financial_profiles: {
        Row: {
          academy_id: string
          alert_days_before_month_end: number
          amount_cents: number
          charge_mode: string
          checkin_goal_status: string
          created_at: string
          current_month_checkins: number
          discount_amount_cents: number
          due_day: number | null
          exemption_reason: string | null
          financial_model: string
          financial_status: string
          id: string
          last_alert_sent_at: string | null
          last_alert_sent_to_guardian: boolean
          last_alert_sent_to_owner: boolean
          last_alert_sent_to_student: boolean
          membership_id: string
          monthly_checkin_minimum: number
          next_due_date: string | null
          notes: string | null
          partnership_name: string | null
          partnership_transfer_mode: string | null
          payment_method_default: string
          period_end_date: string | null
          period_start_date: string | null
          profile_id: string
          recurrence: string
          scholarship_percent: number
          updated_at: string
        }
        Insert: {
          academy_id: string
          alert_days_before_month_end?: number
          amount_cents?: number
          charge_mode?: string
          checkin_goal_status?: string
          created_at?: string
          current_month_checkins?: number
          discount_amount_cents?: number
          due_day?: number | null
          exemption_reason?: string | null
          financial_model?: string
          financial_status?: string
          id?: string
          last_alert_sent_at?: string | null
          last_alert_sent_to_guardian?: boolean
          last_alert_sent_to_owner?: boolean
          last_alert_sent_to_student?: boolean
          membership_id: string
          monthly_checkin_minimum?: number
          next_due_date?: string | null
          notes?: string | null
          partnership_name?: string | null
          partnership_transfer_mode?: string | null
          payment_method_default?: string
          period_end_date?: string | null
          period_start_date?: string | null
          profile_id: string
          recurrence?: string
          scholarship_percent?: number
          updated_at?: string
        }
        Update: {
          academy_id?: string
          alert_days_before_month_end?: number
          amount_cents?: number
          charge_mode?: string
          checkin_goal_status?: string
          created_at?: string
          current_month_checkins?: number
          discount_amount_cents?: number
          due_day?: number | null
          exemption_reason?: string | null
          financial_model?: string
          financial_status?: string
          id?: string
          last_alert_sent_at?: string | null
          last_alert_sent_to_guardian?: boolean
          last_alert_sent_to_owner?: boolean
          last_alert_sent_to_student?: boolean
          membership_id?: string
          monthly_checkin_minimum?: number
          next_due_date?: string | null
          notes?: string | null
          partnership_name?: string | null
          partnership_transfer_mode?: string | null
          payment_method_default?: string
          period_end_date?: string | null
          period_start_date?: string | null
          profile_id?: string
          recurrence?: string
          scholarship_percent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_financial_profiles_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_financial_profiles_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "student_financial_profiles_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: true
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_financial_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_payments: {
        Row: {
          academy_id: string
          amount_cents: number
          asaas_customer_id: string | null
          asaas_payment_id: string | null
          billing_type: string
          created_at: string | null
          description: string
          due_date: string
          guardian_person_id: string | null
          id: string
          invoice_url: string | null
          membership_id: string | null
          paid_amount_cents: number | null
          paid_at: string | null
          payment_method: string | null
          payment_notes: string | null
          pix_payload: string | null
          pix_qr_code: string | null
          reference_month: string | null
          source: string | null
          status: string
          student_profile_id: string
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          amount_cents: number
          asaas_customer_id?: string | null
          asaas_payment_id?: string | null
          billing_type?: string
          created_at?: string | null
          description: string
          due_date: string
          guardian_person_id?: string | null
          id?: string
          invoice_url?: string | null
          membership_id?: string | null
          paid_amount_cents?: number | null
          paid_at?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          pix_payload?: string | null
          pix_qr_code?: string | null
          reference_month?: string | null
          source?: string | null
          status?: string
          student_profile_id: string
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          amount_cents?: number
          asaas_customer_id?: string | null
          asaas_payment_id?: string | null
          billing_type?: string
          created_at?: string | null
          description?: string
          due_date?: string
          guardian_person_id?: string | null
          id?: string
          invoice_url?: string | null
          membership_id?: string | null
          paid_amount_cents?: number | null
          paid_at?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          pix_payload?: string | null
          pix_qr_code?: string | null
          reference_month?: string | null
          source?: string | null
          status?: string
          student_profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_payments_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_payments_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "student_payments_guardian_person_id_fkey"
            columns: ["guardian_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_payments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_payments_student_profile_id_fkey"
            columns: ["student_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_timeline_events: {
        Row: {
          academy_id: string
          created_at: string | null
          description: string | null
          event_date: string
          event_type: string
          id: string
          metadata: Json | null
          profile_id: string
          title: string
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type: string
          id?: string
          metadata?: Json | null
          profile_id: string
          title: string
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          profile_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_timeline_events_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_timeline_events_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "student_timeline_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          parental_consent: boolean | null
          parental_consent_at: string | null
          parental_consent_by: string | null
          profile_id: string
          started_at: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          belt?: string
          created_at?: string
          id?: string
          parental_consent?: boolean | null
          parental_consent_at?: string | null
          parental_consent_by?: string | null
          profile_id: string
          started_at?: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          belt?: string
          created_at?: string
          id?: string
          parental_consent?: boolean | null
          parental_consent_at?: string | null
          parental_consent_by?: string | null
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
            foreignKeyName: "students_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
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
      support_feedback_assignments: {
        Row: {
          active: boolean
          assigned_at: string
          assigned_by_profile_id: string | null
          assigned_profile_id: string | null
          id: string
          item_id: string
          unassigned_at: string | null
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          assigned_by_profile_id?: string | null
          assigned_profile_id?: string | null
          id?: string
          item_id: string
          unassigned_at?: string | null
        }
        Update: {
          active?: boolean
          assigned_at?: string
          assigned_by_profile_id?: string | null
          assigned_profile_id?: string | null
          id?: string
          item_id?: string
          unassigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_feedback_assignments_assigned_by_profile_id_fkey"
            columns: ["assigned_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_feedback_assignments_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_feedback_assignments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "support_feedback_items"
            referencedColumns: ["id"]
          },
        ]
      }
      support_feedback_comments: {
        Row: {
          author_profile_id: string | null
          author_user_id: string | null
          body: string
          created_at: string
          id: string
          is_internal: boolean
          item_id: string
          metadata: Json
        }
        Insert: {
          author_profile_id?: string | null
          author_user_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
          item_id: string
          metadata?: Json
        }
        Update: {
          author_profile_id?: string | null
          author_user_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          item_id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "support_feedback_comments_author_profile_id_fkey"
            columns: ["author_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_feedback_comments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "support_feedback_items"
            referencedColumns: ["id"]
          },
        ]
      }
      support_feedback_item_tags: {
        Row: {
          created_at: string
          item_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          item_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          item_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_feedback_item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "support_feedback_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_feedback_item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "support_feedback_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      support_feedback_items: {
        Row: {
          academy_id: string | null
          app_version: string | null
          browser_name: string | null
          category: Database["public"]["Enums"]["support_feedback_category"]
          created_at: string
          description: string
          device_type: Database["public"]["Enums"]["platform_device_type"]
          external_reference: string | null
          first_response_at: string | null
          id: string
          is_customer_visible: boolean
          last_activity_at: string
          metadata: Json
          origin: Database["public"]["Enums"]["platform_event_origin"]
          os_name: string | null
          release_version: string | null
          reporter_profile_id: string | null
          reporter_user_id: string | null
          resolved_at: string | null
          route_path: string | null
          severity: Database["public"]["Enums"]["platform_severity"]
          source_page: string | null
          status: Database["public"]["Enums"]["platform_status"]
          title: string
          updated_at: string
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          academy_id?: string | null
          app_version?: string | null
          browser_name?: string | null
          category?: Database["public"]["Enums"]["support_feedback_category"]
          created_at?: string
          description: string
          device_type?: Database["public"]["Enums"]["platform_device_type"]
          external_reference?: string | null
          first_response_at?: string | null
          id?: string
          is_customer_visible?: boolean
          last_activity_at?: string
          metadata?: Json
          origin?: Database["public"]["Enums"]["platform_event_origin"]
          os_name?: string | null
          release_version?: string | null
          reporter_profile_id?: string | null
          reporter_user_id?: string | null
          resolved_at?: string | null
          route_path?: string | null
          severity?: Database["public"]["Enums"]["platform_severity"]
          source_page?: string | null
          status?: Database["public"]["Enums"]["platform_status"]
          title: string
          updated_at?: string
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          academy_id?: string | null
          app_version?: string | null
          browser_name?: string | null
          category?: Database["public"]["Enums"]["support_feedback_category"]
          created_at?: string
          description?: string
          device_type?: Database["public"]["Enums"]["platform_device_type"]
          external_reference?: string | null
          first_response_at?: string | null
          id?: string
          is_customer_visible?: boolean
          last_activity_at?: string
          metadata?: Json
          origin?: Database["public"]["Enums"]["platform_event_origin"]
          os_name?: string | null
          release_version?: string | null
          reporter_profile_id?: string | null
          reporter_user_id?: string | null
          resolved_at?: string | null
          route_path?: string | null
          severity?: Database["public"]["Enums"]["platform_severity"]
          source_page?: string | null
          status?: Database["public"]["Enums"]["platform_status"]
          title?: string
          updated_at?: string
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "support_feedback_items_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_feedback_items_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "support_feedback_items_reporter_profile_id_fkey"
            columns: ["reporter_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_feedback_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          label: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          label: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          label?: string
          slug?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          academy_id: string | null
          assigned_to: string | null
          category: string
          console_logs: string[] | null
          created_at: string | null
          description: string
          device_info: Json | null
          id: string
          messages: Json | null
          page_url: string | null
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          screenshot_url: string | null
          session_id: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          academy_id?: string | null
          assigned_to?: string | null
          category: string
          console_logs?: string[] | null
          created_at?: string | null
          description: string
          device_info?: Json | null
          id?: string
          messages?: Json | null
          page_url?: string | null
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          screenshot_url?: string | null
          session_id?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          academy_id?: string | null
          assigned_to?: string | null
          category?: string
          console_logs?: string[] | null
          created_at?: string | null
          description?: string
          device_info?: Json | null
          id?: string
          messages?: Json | null
          page_url?: string | null
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          screenshot_url?: string | null
          session_id?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      technical_evaluations: {
        Row: {
          average_score: number | null
          created_at: string | null
          criteria: Json | null
          id: string
          observations: string | null
          professor_id: string | null
          recommendation: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          average_score?: number | null
          created_at?: string | null
          criteria?: Json | null
          id?: string
          observations?: string | null
          professor_id?: string | null
          recommendation?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          average_score?: number | null
          created_at?: string | null
          criteria?: Json | null
          id?: string
          observations?: string | null
          professor_id?: string | null
          recommendation?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_evaluations_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technical_evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      telemetry_events: {
        Row: {
          academy_id: string | null
          created_at: string | null
          data: Json
          event_type: string
          id: string
          page: string | null
          session_id: string
          severity: string | null
          user_id: string
        }
        Insert: {
          academy_id?: string | null
          created_at?: string | null
          data?: Json
          event_type: string
          id?: string
          page?: string | null
          session_id: string
          severity?: string | null
          user_id: string
        }
        Update: {
          academy_id?: string | null
          created_at?: string | null
          data?: Json
          event_type?: string
          id?: string
          page?: string | null
          session_id?: string
          severity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      telemetry_sessions: {
        Row: {
          academy_id: string | null
          avg_cls: number | null
          avg_fcp: number | null
          avg_fid: number | null
          avg_lcp: number | null
          browser: string | null
          browser_version: string | null
          connection_speed: string | null
          connection_type: string | null
          created_at: string | null
          device_model: string | null
          device_type: string | null
          device_vendor: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          is_pwa: boolean | null
          last_activity_at: string | null
          locale: string | null
          os: string | null
          os_version: string | null
          pages_visited: string[] | null
          pixel_ratio: number | null
          profile_id: string | null
          role: string | null
          screen_height: number | null
          screen_width: number | null
          session_id: string
          slow_pages: string[] | null
          started_at: string
          timezone: string | null
          total_actions: number | null
          total_api_errors: number | null
          total_js_errors: number | null
          total_page_views: number | null
          touchscreen: boolean | null
          user_id: string
        }
        Insert: {
          academy_id?: string | null
          avg_cls?: number | null
          avg_fcp?: number | null
          avg_fid?: number | null
          avg_lcp?: number | null
          browser?: string | null
          browser_version?: string | null
          connection_speed?: string | null
          connection_type?: string | null
          created_at?: string | null
          device_model?: string | null
          device_type?: string | null
          device_vendor?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          is_pwa?: boolean | null
          last_activity_at?: string | null
          locale?: string | null
          os?: string | null
          os_version?: string | null
          pages_visited?: string[] | null
          pixel_ratio?: number | null
          profile_id?: string | null
          role?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id: string
          slow_pages?: string[] | null
          started_at?: string
          timezone?: string | null
          total_actions?: number | null
          total_api_errors?: number | null
          total_js_errors?: number | null
          total_page_views?: number | null
          touchscreen?: boolean | null
          user_id: string
        }
        Update: {
          academy_id?: string | null
          avg_cls?: number | null
          avg_fcp?: number | null
          avg_fid?: number | null
          avg_lcp?: number | null
          browser?: string | null
          browser_version?: string | null
          connection_speed?: string | null
          connection_type?: string | null
          created_at?: string | null
          device_model?: string | null
          device_type?: string | null
          device_vendor?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          is_pwa?: boolean | null
          last_activity_at?: string | null
          locale?: string | null
          os?: string | null
          os_version?: string | null
          pages_visited?: string[] | null
          pixel_ratio?: number | null
          profile_id?: string | null
          role?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string
          slow_pages?: string[] | null
          started_at?: string
          timezone?: string | null
          total_actions?: number | null
          total_api_errors?: number | null
          total_js_errors?: number | null
          total_page_views?: number | null
          touchscreen?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      theoretical_certificates: {
        Row: {
          certificate_url: string | null
          created_at: string | null
          id: string
          issued_at: string | null
          module_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          created_at?: string | null
          id?: string
          issued_at?: string | null
          module_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          created_at?: string | null
          id?: string
          issued_at?: string | null
          module_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theoretical_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      theoretical_lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theoretical_lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      theoretical_lessons: {
        Row: {
          content: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          module_id: string
          order_index: number | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          module_id: string
          order_index?: number | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          module_id?: string
          order_index?: number | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      theoretical_modules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          modality: string | null
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          modality?: string | null
          order_index?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          modality?: string | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      theoretical_quiz_attempts: {
        Row: {
          answers: Json | null
          created_at: string | null
          id: string
          passed: boolean | null
          quiz_id: string
          score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id: string
          score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id?: string
          score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theoretical_quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      theoretical_quizzes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          module_id: string | null
          passing_score: number | null
          questions: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          module_id?: string | null
          passing_score?: number | null
          questions?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          module_id?: string | null
          passing_score?: number | null
          questions?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      theory_certificates: {
        Row: {
          id: string
          issued_at: string | null
          module_id: string
          score: number
          user_id: string
          verification_code: string
        }
        Insert: {
          id?: string
          issued_at?: string | null
          module_id: string
          score: number
          user_id: string
          verification_code: string
        }
        Update: {
          id?: string
          issued_at?: string | null
          module_id?: string
          score?: number
          user_id?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "theory_certificates_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "theory_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      theory_lessons: {
        Row: {
          content: Json
          created_at: string | null
          duration_estimate: string | null
          id: string
          module_id: string
          sort_order: number | null
          title: string
          type: string
        }
        Insert: {
          content?: Json
          created_at?: string | null
          duration_estimate?: string | null
          id?: string
          module_id: string
          sort_order?: number | null
          title: string
          type: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          duration_estimate?: string | null
          id?: string
          module_id?: string
          sort_order?: number | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "theory_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "theory_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      theory_modules: {
        Row: {
          academy_id: string | null
          belt: string
          category: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          modality: string
          sort_order: number | null
          title: string
          total_lessons: number | null
        }
        Insert: {
          academy_id?: string | null
          belt: string
          category: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          modality: string
          sort_order?: number | null
          title: string
          total_lessons?: number | null
        }
        Update: {
          academy_id?: string | null
          belt?: string
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          modality?: string
          sort_order?: number | null
          title?: string
          total_lessons?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "theory_modules_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theory_modules_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      theory_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          lesson_id: string
          module_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id: string
          module_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theory_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "theory_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theory_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "theory_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      theory_quiz_attempts: {
        Row: {
          answers: Json | null
          attempted_at: string | null
          id: string
          module_id: string
          passed: boolean | null
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          attempted_at?: string | null
          id?: string
          module_id: string
          passed?: boolean | null
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          attempted_at?: string | null
          id?: string
          module_id?: string
          passed?: boolean | null
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theory_quiz_attempts_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "theory_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          created_at: string | null
          id: string
          is_internal: boolean | null
          sender_id: string | null
          sender_name: string | null
          text: string
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          sender_id?: string | null
          sender_name?: string | null
          text: string
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          sender_id?: string | null
          sender_name?: string | null
          text?: string
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      top_users: {
        Row: {
          created_at: string | null
          id: string
          pages_viewed: number | null
          session_count: number | null
          total_time_minutes: number | null
          updated_at: string | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pages_viewed?: number | null
          session_count?: number | null
          total_time_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pages_viewed?: number | null
          session_count?: number | null
          total_time_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      tournament_brackets: {
        Row: {
          category_id: string
          created_at: string | null
          generated_at: string | null
          id: string
          method: string | null
          status: string | null
          total_athletes: number | null
          total_rounds: number | null
          tournament_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          generated_at?: string | null
          id?: string
          method?: string | null
          status?: string | null
          total_athletes?: number | null
          total_rounds?: number | null
          tournament_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          generated_at?: string | null
          id?: string
          method?: string | null
          status?: string | null
          total_athletes?: number | null
          total_rounds?: number | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_brackets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tournament_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_brackets_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_categories: {
        Row: {
          age_range: string | null
          belt_range: string | null
          created_at: string | null
          gender: string | null
          id: string
          match_duration_seconds: number | null
          modality: string | null
          name: string
          status: string | null
          total_registrations: number | null
          tournament_id: string
          weight_range: string | null
        }
        Insert: {
          age_range?: string | null
          belt_range?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          match_duration_seconds?: number | null
          modality?: string | null
          name: string
          status?: string | null
          total_registrations?: number | null
          tournament_id: string
          weight_range?: string | null
        }
        Update: {
          age_range?: string | null
          belt_range?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          match_duration_seconds?: number | null
          modality?: string | null
          name?: string
          status?: string | null
          total_registrations?: number | null
          tournament_id?: string
          weight_range?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_categories_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_circuits: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          organizer_id: string | null
          region: string | null
          season: string
          slug: string
          status: string | null
          total_stages: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          organizer_id?: string | null
          region?: string | null
          season: string
          slug: string
          status?: string | null
          total_stages?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          organizer_id?: string | null
          region?: string | null
          season?: string
          slug?: string
          status?: string | null
          total_stages?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_circuits_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_feed: {
        Row: {
          author_id: string | null
          author_name: string | null
          category_id: string | null
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          match_id: string | null
          pinned: boolean | null
          title: string
          tournament_id: string
          type: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          match_id?: string | null
          pinned?: boolean | null
          title: string
          tournament_id: string
          type: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          match_id?: string | null
          pinned?: boolean | null
          title?: string
          tournament_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_feed_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_feed_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tournament_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_feed_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "tournament_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_feed_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_matches: {
        Row: {
          advantages_a: number | null
          advantages_b: number | null
          area_number: number | null
          bracket_id: string
          category_id: string
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          fighter_a_id: string | null
          fighter_a_name: string | null
          fighter_b_id: string | null
          fighter_b_name: string | null
          id: string
          mat_number: number | null
          method: string | null
          notes: string | null
          penalties_a: number | null
          penalties_b: number | null
          position: number
          round: number
          scheduled_time: string | null
          score_a: number | null
          score_b: number | null
          started_at: string | null
          status: string | null
          submission_name: string | null
          tournament_id: string
          winner_id: string | null
          winner_name: string | null
        }
        Insert: {
          advantages_a?: number | null
          advantages_b?: number | null
          area_number?: number | null
          bracket_id: string
          category_id: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          fighter_a_id?: string | null
          fighter_a_name?: string | null
          fighter_b_id?: string | null
          fighter_b_name?: string | null
          id?: string
          mat_number?: number | null
          method?: string | null
          notes?: string | null
          penalties_a?: number | null
          penalties_b?: number | null
          position: number
          round: number
          scheduled_time?: string | null
          score_a?: number | null
          score_b?: number | null
          started_at?: string | null
          status?: string | null
          submission_name?: string | null
          tournament_id: string
          winner_id?: string | null
          winner_name?: string | null
        }
        Update: {
          advantages_a?: number | null
          advantages_b?: number | null
          area_number?: number | null
          bracket_id?: string
          category_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          fighter_a_id?: string | null
          fighter_a_name?: string | null
          fighter_b_id?: string | null
          fighter_b_name?: string | null
          id?: string
          mat_number?: number | null
          method?: string | null
          notes?: string | null
          penalties_a?: number | null
          penalties_b?: number | null
          position?: number
          round?: number
          scheduled_time?: string | null
          score_a?: number | null
          score_b?: number | null
          started_at?: string | null
          status?: string | null
          submission_name?: string | null
          tournament_id?: string
          winner_id?: string | null
          winner_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_bracket_id_fkey"
            columns: ["bracket_id"]
            isOneToOne: false
            referencedRelation: "tournament_brackets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tournament_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_fighter_a_id_fkey"
            columns: ["fighter_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_fighter_b_id_fkey"
            columns: ["fighter_b_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_predictions: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          is_correct: boolean | null
          match_id: string | null
          points_earned: number | null
          predicted_method: string | null
          predicted_winner_id: string | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          match_id?: string | null
          points_earned?: number | null
          predicted_method?: string | null
          predicted_winner_id?: string | null
          tournament_id: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          match_id?: string | null
          points_earned?: number | null
          predicted_method?: string | null
          predicted_winner_id?: string | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_predictions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tournament_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "tournament_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_predictions_predicted_winner_id_fkey"
            columns: ["predicted_winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_predictions_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_registrations: {
        Row: {
          academy_id: string | null
          academy_name: string | null
          athlete_id: string
          athlete_name: string
          belt: string | null
          category_id: string
          checked_in_at: string | null
          created_at: string | null
          id: string
          payment_ref: string | null
          payment_status: string | null
          seed: number | null
          status: string | null
          tournament_id: string
          updated_at: string | null
          weigh_in_value: number | null
          weighed_in_at: string | null
          weight: number | null
        }
        Insert: {
          academy_id?: string | null
          academy_name?: string | null
          athlete_id: string
          athlete_name: string
          belt?: string | null
          category_id: string
          checked_in_at?: string | null
          created_at?: string | null
          id?: string
          payment_ref?: string | null
          payment_status?: string | null
          seed?: number | null
          status?: string | null
          tournament_id: string
          updated_at?: string | null
          weigh_in_value?: number | null
          weighed_in_at?: string | null
          weight?: number | null
        }
        Update: {
          academy_id?: string | null
          academy_name?: string | null
          athlete_id?: string
          athlete_name?: string
          belt?: string | null
          category_id?: string
          checked_in_at?: string | null
          created_at?: string | null
          id?: string
          payment_ref?: string | null
          payment_status?: string | null
          seed?: number | null
          status?: string | null
          tournament_id?: string
          updated_at?: string | null
          weigh_in_value?: number | null
          weighed_in_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_registrations_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_registrations_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "tournament_registrations_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_registrations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tournament_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          academy_id: string | null
          address: string | null
          banner_url: string | null
          circuit_id: string | null
          circuit_stage: number | null
          city: string | null
          created_at: string | null
          date: string
          description: string | null
          end_date: string | null
          id: string
          is_featured: boolean | null
          logo_url: string | null
          max_registrations: number | null
          modality: string | null
          name: string
          organizer_id: string | null
          published_at: string | null
          registration_deadline: string | null
          registration_fee: number | null
          rules: string | null
          slug: string
          state: string | null
          status: string | null
          total_academies: number | null
          total_areas: number | null
          total_registrations: number | null
          updated_at: string | null
          venue: string
        }
        Insert: {
          academy_id?: string | null
          address?: string | null
          banner_url?: string | null
          circuit_id?: string | null
          circuit_stage?: number | null
          city?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          max_registrations?: number | null
          modality?: string | null
          name: string
          organizer_id?: string | null
          published_at?: string | null
          registration_deadline?: string | null
          registration_fee?: number | null
          rules?: string | null
          slug: string
          state?: string | null
          status?: string | null
          total_academies?: number | null
          total_areas?: number | null
          total_registrations?: number | null
          updated_at?: string | null
          venue: string
        }
        Update: {
          academy_id?: string | null
          address?: string | null
          banner_url?: string | null
          circuit_id?: string | null
          circuit_stage?: number | null
          city?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          max_registrations?: number | null
          modality?: string | null
          name?: string
          organizer_id?: string | null
          published_at?: string | null
          registration_deadline?: string | null
          registration_fee?: number | null
          rules?: string | null
          slug?: string
          state?: string | null
          status?: string | null
          total_academies?: number | null
          total_areas?: number | null
          total_registrations?: number | null
          updated_at?: string | null
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournaments_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "tournaments_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "tournament_circuits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournaments_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_activity_log: {
        Row: {
          academy_id: string
          activity_type: string
          created_at: string | null
          details: Json | null
          id: string
          trial_student_id: string
        }
        Insert: {
          academy_id: string
          activity_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          trial_student_id: string
        }
        Update: {
          academy_id?: string
          activity_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          trial_student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_activity_log_trial_student_id_fkey"
            columns: ["trial_student_id"]
            isOneToOne: false
            referencedRelation: "trial_students"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_config: {
        Row: {
          academy_id: string
          auto_create_account: boolean | null
          conversion_discount_percent: number | null
          conversion_discount_valid_days: number | null
          created_at: string | null
          expired_message: string | null
          expiry_warning_message: string | null
          id: string
          require_email: boolean | null
          require_health_declaration: boolean | null
          require_phone: boolean | null
          send_day3_reminder: boolean | null
          send_day5_reminder: boolean | null
          send_expiry_notification: boolean | null
          send_post_expiry_offer: boolean | null
          send_welcome_whatsapp: boolean | null
          trial_classes_limit: number | null
          trial_duration_days: number | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          academy_id: string
          auto_create_account?: boolean | null
          conversion_discount_percent?: number | null
          conversion_discount_valid_days?: number | null
          created_at?: string | null
          expired_message?: string | null
          expiry_warning_message?: string | null
          id?: string
          require_email?: boolean | null
          require_health_declaration?: boolean | null
          require_phone?: boolean | null
          send_day3_reminder?: boolean | null
          send_day5_reminder?: boolean | null
          send_expiry_notification?: boolean | null
          send_post_expiry_offer?: boolean | null
          send_welcome_whatsapp?: boolean | null
          trial_classes_limit?: number | null
          trial_duration_days?: number | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          academy_id?: string
          auto_create_account?: boolean | null
          conversion_discount_percent?: number | null
          conversion_discount_valid_days?: number | null
          created_at?: string | null
          expired_message?: string | null
          expiry_warning_message?: string | null
          id?: string
          require_email?: boolean | null
          require_health_declaration?: boolean | null
          require_phone?: boolean | null
          send_day3_reminder?: boolean | null
          send_day5_reminder?: boolean | null
          send_expiry_notification?: boolean | null
          send_post_expiry_offer?: boolean | null
          send_welcome_whatsapp?: boolean | null
          trial_classes_limit?: number | null
          trial_duration_days?: number | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trial_config_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_config_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      trial_students: {
        Row: {
          academy_id: string
          admin_notes: string | null
          assigned_professor_id: string | null
          birth_date: string | null
          converted_at: string | null
          converted_plan: string | null
          created_at: string | null
          email: string | null
          experience_level: string | null
          expiry_notified: boolean | null
          feedback: string | null
          follow_up_date: string | null
          follow_up_done: boolean | null
          goals: string | null
          has_health_issues: boolean | null
          health_notes: string | null
          how_heard_about: string | null
          id: string
          membership_id: string | null
          modalities_interest: string[] | null
          name: string
          phone: string
          profile_id: string | null
          rating: number | null
          referred_by_profile_id: string | null
          source: string | null
          status: string | null
          trial_classes_attended: number | null
          trial_classes_limit: number | null
          trial_end_date: string
          trial_start_date: string
          updated_at: string | null
          would_recommend: boolean | null
        }
        Insert: {
          academy_id: string
          admin_notes?: string | null
          assigned_professor_id?: string | null
          birth_date?: string | null
          converted_at?: string | null
          converted_plan?: string | null
          created_at?: string | null
          email?: string | null
          experience_level?: string | null
          expiry_notified?: boolean | null
          feedback?: string | null
          follow_up_date?: string | null
          follow_up_done?: boolean | null
          goals?: string | null
          has_health_issues?: boolean | null
          health_notes?: string | null
          how_heard_about?: string | null
          id?: string
          membership_id?: string | null
          modalities_interest?: string[] | null
          name: string
          phone: string
          profile_id?: string | null
          rating?: number | null
          referred_by_profile_id?: string | null
          source?: string | null
          status?: string | null
          trial_classes_attended?: number | null
          trial_classes_limit?: number | null
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          academy_id?: string
          admin_notes?: string | null
          assigned_professor_id?: string | null
          birth_date?: string | null
          converted_at?: string | null
          converted_plan?: string | null
          created_at?: string | null
          email?: string | null
          experience_level?: string | null
          expiry_notified?: boolean | null
          feedback?: string | null
          follow_up_date?: string | null
          follow_up_done?: boolean | null
          goals?: string | null
          has_health_issues?: boolean | null
          health_notes?: string | null
          how_heard_about?: string | null
          id?: string
          membership_id?: string | null
          modalities_interest?: string[] | null
          name?: string
          phone?: string
          profile_id?: string | null
          rating?: number | null
          referred_by_profile_id?: string | null
          source?: string | null
          status?: string | null
          trial_classes_attended?: number | null
          trial_classes_limit?: number | null
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "trial_students_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_students_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "trial_students_assigned_professor_id_fkey"
            columns: ["assigned_professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_students_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_students_referred_by_profile_id_fkey"
            columns: ["referred_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          academy_id: string
          capacity: number | null
          created_at: string | null
          id: string
          modalidade: string | null
          nome: string
          professor_id: string | null
          schedule: Json | null
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          capacity?: number | null
          created_at?: string | null
          id?: string
          modalidade?: string | null
          nome: string
          professor_id?: string | null
          schedule?: Json | null
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          capacity?: number | null
          created_at?: string | null
          id?: string
          modalidade?: string | null
          nome?: string
          professor_id?: string | null
          schedule?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turmas_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "turmas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          id: string
          skipped_at: string | null
          started_at: string | null
          status: string
          tutorial_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          skipped_at?: string | null
          started_at?: string | null
          status?: string
          tutorial_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          skipped_at?: string | null
          started_at?: string | null
          status?: string
          tutorial_id?: string
          user_id?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "units_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          academy_id: string | null
          admin_reply: string | null
          created_at: string
          id: string
          message: string
          page_url: string | null
          profile_id: string | null
          rating: number | null
          status: string
          type: string
          user_agent: string | null
        }
        Insert: {
          academy_id?: string | null
          admin_reply?: string | null
          created_at?: string
          id?: string
          message: string
          page_url?: string | null
          profile_id?: string | null
          rating?: number | null
          status?: string
          type?: string
          user_agent?: string | null
        }
        Update: {
          academy_id?: string | null
          admin_reply?: string | null
          created_at?: string
          id?: string
          message?: string
          page_url?: string | null
          profile_id?: string | null
          rating?: number | null
          status?: string
          type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "user_feedback_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_audiences: {
        Row: {
          audience: string
          id: string
          video_id: string
        }
        Insert: {
          audience: string
          id?: string
          video_id: string
        }
        Update: {
          audience?: string
          id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_audiences_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_chapters: {
        Row: {
          academy_id: string
          created_at: string | null
          description: string | null
          id: string
          sort_order: number | null
          timestamp_seconds: number
          title: string
          video_id: string
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          sort_order?: number | null
          timestamp_seconds: number
          title: string
          video_id: string
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          sort_order?: number | null
          timestamp_seconds?: number
          title?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_chapters_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_chapters_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      video_class_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          class_id: string
          id: string
          video_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          class_id: string
          id?: string
          video_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          class_id?: string
          id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_class_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_class_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_class_assignments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_comments: {
        Row: {
          academy_id: string
          created_at: string | null
          id: string
          is_edited: boolean | null
          is_pinned: boolean | null
          is_professor: boolean | null
          likes_count: number | null
          parent_id: string | null
          text: string
          timestamp_seconds: number | null
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          is_professor?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          text: string
          timestamp_seconds?: number | null
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          is_professor?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          text?: string
          timestamp_seconds?: number | null
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_comments_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_comments_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "video_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "video_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      video_likes: {
        Row: {
          academy_id: string
          created_at: string | null
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_likes_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_likes_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      video_notes: {
        Row: {
          academy_id: string
          created_at: string | null
          id: string
          text: string
          timestamp_seconds: number | null
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          id?: string
          text: string
          timestamp_seconds?: number | null
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          id?: string
          text?: string
          timestamp_seconds?: number | null
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_notes_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_notes_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      video_progress: {
        Row: {
          id: string
          last_watched_at: string
          progress: number
          progress_percent: number | null
          progress_seconds: number | null
          student_id: string
          times_watched: number | null
          total_watch_time: number | null
          video_id: string
        }
        Insert: {
          id?: string
          last_watched_at?: string
          progress?: number
          progress_percent?: number | null
          progress_seconds?: number | null
          student_id: string
          times_watched?: number | null
          total_watch_time?: number | null
          video_id: string
        }
        Update: {
          id?: string
          last_watched_at?: string
          progress?: number
          progress_percent?: number | null
          progress_seconds?: number | null
          student_id?: string
          times_watched?: number | null
          total_watch_time?: number | null
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
      video_questions: {
        Row: {
          academy_id: string
          answer_professor_id: string | null
          answer_professor_name: string | null
          answer_text: string | null
          answer_video_url: string | null
          answered_at: string | null
          created_at: string | null
          id: string
          is_answered: boolean | null
          question: string
          timestamp_seconds: number | null
          user_id: string
          video_id: string
          votes_count: number | null
        }
        Insert: {
          academy_id: string
          answer_professor_id?: string | null
          answer_professor_name?: string | null
          answer_text?: string | null
          answer_video_url?: string | null
          answered_at?: string | null
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          question: string
          timestamp_seconds?: number | null
          user_id: string
          video_id: string
          votes_count?: number | null
        }
        Update: {
          academy_id?: string
          answer_professor_id?: string | null
          answer_professor_name?: string | null
          answer_text?: string | null
          answer_video_url?: string | null
          answered_at?: string | null
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          question?: string
          timestamp_seconds?: number | null
          user_id?: string
          video_id?: string
          votes_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_questions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_questions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      video_ratings: {
        Row: {
          academy_id: string
          created_at: string | null
          id: string
          rating: number
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          id?: string
          rating: number
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_ratings_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_ratings_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      video_saved: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_saved_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_saves: {
        Row: {
          academy_id: string
          created_at: string | null
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_saves_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_saves_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      video_series: {
        Row: {
          academy_id: string
          audience: string | null
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          min_belt: string | null
          modality: string | null
          professor_id: string | null
          sort_order: number | null
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          academy_id: string
          audience?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          min_belt?: string | null
          modality?: string | null
          professor_id?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          academy_id?: string
          audience?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          min_belt?: string | null
          modality?: string | null
          professor_id?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_series_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_series_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "video_series_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_series_items: {
        Row: {
          id: string
          series_id: string
          sort_order: number | null
          video_id: string
        }
        Insert: {
          id?: string
          series_id: string
          sort_order?: number | null
          video_id: string
        }
        Update: {
          id?: string
          series_id?: string
          sort_order?: number | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_series_items_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "video_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_series_items_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_shares: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          updated_at: string | null
          user_id: string | null
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_watch_history: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          progress_seconds: number | null
          updated_at: string | null
          user_id: string
          video_id: string
          watched_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          progress_seconds?: number | null
          updated_at?: string | null
          user_id: string
          video_id: string
          watched_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          progress_seconds?: number | null
          updated_at?: string | null
          user_id?: string
          video_id?: string
          watched_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_watch_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          academy_id: string
          belt_level: string
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration: number
          file_size_bytes: number | null
          id: string
          is_published: boolean | null
          likes_count: number | null
          mime_type: string | null
          min_belt: string | null
          modality: string | null
          published_at: string | null
          storage_path: string | null
          storage_url: string | null
          tags: string[] | null
          thumbnail_path: string | null
          thumbnail_storage_url: string | null
          title: string
          updated_at: string
          upload_status: string | null
          uploaded_by: string | null
          url: string
          views_count: number | null
        }
        Insert: {
          academy_id: string
          belt_level?: string
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration?: number
          file_size_bytes?: number | null
          id?: string
          is_published?: boolean | null
          likes_count?: number | null
          mime_type?: string | null
          min_belt?: string | null
          modality?: string | null
          published_at?: string | null
          storage_path?: string | null
          storage_url?: string | null
          tags?: string[] | null
          thumbnail_path?: string | null
          thumbnail_storage_url?: string | null
          title: string
          updated_at?: string
          upload_status?: string | null
          uploaded_by?: string | null
          url: string
          views_count?: number | null
        }
        Update: {
          academy_id?: string
          belt_level?: string
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration?: number
          file_size_bytes?: number | null
          id?: string
          is_published?: boolean | null
          likes_count?: number | null
          mime_type?: string | null
          min_belt?: string | null
          modality?: string | null
          published_at?: string | null
          storage_path?: string | null
          storage_url?: string | null
          tags?: string[] | null
          thumbnail_path?: string | null
          thumbnail_storage_url?: string | null
          title?: string
          updated_at?: string
          upload_status?: string | null
          uploaded_by?: string | null
          url?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
          {
            foreignKeyName: "videos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_configs: {
        Row: {
          academy_id: string
          created_at: string | null
          events: string[] | null
          id: string
          is_active: boolean | null
          secret: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          secret?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          secret?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_configs_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_configs_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          event: string | null
          id: string
          payload: Json | null
          response_body: string | null
          status_code: number | null
          success: boolean | null
          updated_at: string | null
          webhook_id: string
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          event?: string | null
          id?: string
          payload?: Json | null
          response_body?: string | null
          status_code?: number | null
          success?: boolean | null
          updated_at?: string | null
          webhook_id: string
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          event?: string | null
          id?: string
          payload?: Json | null
          response_body?: string | null
          status_code?: number | null
          success?: boolean | null
          updated_at?: string | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhook_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_log: {
        Row: {
          created_at: string | null
          event_type: string
          external_id: string | null
          id: string
          payload: Json
          processed: boolean | null
          source: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          external_id?: string | null
          id?: string
          payload: Json
          processed?: boolean | null
          source: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          external_id?: string | null
          id?: string
          payload?: Json
          processed?: boolean | null
          source?: string
        }
        Relationships: []
      }
      whatsapp_automations: {
        Row: {
          academy_id: string
          active: boolean | null
          created_at: string | null
          delay_hours: number | null
          description: string
          id: string
          template_slug: string
          trigger_name: string
        }
        Insert: {
          academy_id: string
          active?: boolean | null
          created_at?: string | null
          delay_hours?: number | null
          description: string
          id?: string
          template_slug: string
          trigger_name: string
        }
        Update: {
          academy_id?: string
          active?: boolean | null
          created_at?: string | null
          delay_hours?: number | null
          description?: string
          id?: string
          template_slug?: string
          trigger_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_automations_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_automations_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      whatsapp_configs: {
        Row: {
          academy_id: string
          active: boolean | null
          allowed_hours_end: number | null
          allowed_hours_start: number | null
          api_key: string | null
          created_at: string | null
          id: string
          instance_id: string | null
          phone_number: string | null
          provider: string
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          active?: boolean | null
          allowed_hours_end?: number | null
          allowed_hours_start?: number | null
          api_key?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          phone_number?: string | null
          provider?: string
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          active?: boolean | null
          allowed_hours_end?: number | null
          allowed_hours_start?: number | null
          api_key?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          phone_number?: string | null
          provider?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_configs_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_configs_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          academy_id: string
          created_at: string | null
          delivered_at: string | null
          error: string | null
          id: string
          read_at: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
          template_slug: string
          to_name: string | null
          to_phone: string
          variables: Json | null
        }
        Insert: {
          academy_id: string
          created_at?: string | null
          delivered_at?: string | null
          error?: string | null
          id?: string
          read_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          template_slug: string
          to_name?: string | null
          to_phone: string
          variables?: Json | null
        }
        Update: {
          academy_id?: string
          created_at?: string | null
          delivered_at?: string | null
          error?: string | null
          id?: string
          read_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          template_slug?: string
          to_name?: string | null
          to_phone?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          academy_id: string
          active: boolean | null
          category: string
          created_at: string | null
          id: string
          is_system: boolean | null
          name: string
          slug: string
          text: string
          variables: string[] | null
        }
        Insert: {
          academy_id: string
          active?: boolean | null
          category?: string
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          slug: string
          text: string
          variables?: string[] | null
        }
        Update: {
          academy_id?: string
          active?: boolean | null
          category?: string
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          slug?: string
          text?: string
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_templates_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "platform_health_risk_latest_v"
            referencedColumns: ["academy_id"]
          },
        ]
      }
    }
    Views: {
      platform_device_layout_metrics_v: {
        Row: {
          avg_layout_risk_score: number | null
          breakpoint: string | null
          device_type:
            | Database["public"]["Enums"]["platform_device_type"]
            | null
          last_captured_at: string | null
          resolution: string | null
          risky_snapshots: number | null
          snapshot_count: number | null
        }
        Relationships: []
      }
      platform_error_route_metrics_v: {
        Row: {
          auth_failures: number | null
          critical_count: number | null
          device_type:
            | Database["public"]["Enums"]["platform_device_type"]
            | null
          error_count: number | null
          impacted_tenants: number | null
          impacted_users: number | null
          last_seen_at: string | null
          release_version: string | null
          route_path: string | null
          timeout_count: number | null
        }
        Relationships: []
      }
      platform_health_risk_latest_v: {
        Row: {
          academy_id: string | null
          academy_name: string | null
          auth_failures: number | null
          components: Json | null
          overall_status:
            | Database["public"]["Enums"]["platform_signal_status"]
            | null
          release_regression_percent: number | null
          repeated_error_growth_percent: number | null
          risk_score: number | null
          security_score: number | null
          snapshot_at: string | null
          suspicious_logins: number | null
          ux_score: number | null
        }
        Relationships: []
      }
      platform_overview_daily_v: {
        Row: {
          access_count: number | null
          active_tenants: number | null
          active_users: number | null
          auth_failures: number | null
          avg_latency_ms: number | null
          day: string | null
          error_count: number | null
          timeouts: number | null
        }
        Relationships: []
      }
      platform_performance_route_metrics_v: {
        Row: {
          avg_api_latency_ms: number | null
          avg_lcp_ms: number | null
          avg_load_time_ms: number | null
          avg_ttfb_ms: number | null
          device_type:
            | Database["public"]["Enums"]["platform_device_type"]
            | null
          p95_lcp_ms: number | null
          p95_load_time_ms: number | null
          release_version: string | null
          route_path: string | null
          samples: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_age: { Args: { p_birth_date: string }; Returns: number }
      can_manage_student_financial: {
        Args: { p_academy_id: string }
        Returns: boolean
      }
      can_view_student_financial: {
        Args: { p_academy_id: string; p_profile_id: string }
        Returns: boolean
      }
      compute_checkin_goal_status: {
        Args: {
          p_current_month_checkins: number
          p_financial_model: string
          p_monthly_checkin_minimum: number
          p_reference_date?: string
        }
        Returns: string
      }
      compute_student_financial_status: {
        Args: {
          p_amount_cents: number
          p_financial_model: string
          p_next_due_date: string
          p_period_end_date?: string
          p_reference_date?: string
        }
        Returns: string
      }
      count_student_month_checkins: {
        Args: { p_profile_id: string; p_reference_date?: string }
        Returns: number
      }
      date_utc: { Args: { ts: string }; Returns: string }
      detect_data_health_issues: {
        Args: { p_academy_id: string }
        Returns: number
      }
      get_academy_id: { Args: never; Returns: string }
      get_current_user_id: { Args: never; Returns: string }
      get_dependents: {
        Args: { p_guardian_id: string }
        Returns: {
          birth_date: string
          dependent_id: string
          dependent_name: string
          email: string
          medical_notes: string
          phone: string
          relationship: string
        }[]
      }
      get_guardians: {
        Args: { p_dependent_id: string }
        Returns: {
          can_authorize: boolean
          email: string
          guardian_id: string
          guardian_name: string
          is_financial: boolean
          is_primary: boolean
          phone: string
          receives_billing: boolean
          receives_notifications: boolean
          relationship: string
        }[]
      }
      get_my_academy_ids: { Args: never; Returns: string[] }
      get_my_franchise_ids: { Args: never; Returns: string[] }
      get_my_profile_ids: { Args: never; Returns: string[] }
      get_user_role: { Args: never; Returns: string }
      is_member_of: { Args: { p_academy_id: string }; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
      is_superadmin_user: { Args: never; Returns: boolean }
      platform_breakpoint: { Args: { width_px: number }; Returns: string }
      seed_whatsapp_for_academy: {
        Args: { p_academy_id: string }
        Returns: undefined
      }
    }
    Enums: {
      platform_device_type:
        | "desktop"
        | "tablet"
        | "mobile"
        | "tv"
        | "bot"
        | "unknown"
      platform_event_origin:
        | "web"
        | "ios"
        | "android"
        | "api"
        | "system"
        | "worker"
        | "seed"
      platform_health_component_type:
        | "api"
        | "database"
        | "auth"
        | "jobs"
        | "storage"
        | "webhook"
        | "integration"
        | "frontend"
        | "realtime"
        | "queue"
      platform_incident_type:
        | "outage"
        | "degradation"
        | "security"
        | "performance"
        | "billing"
        | "integrity"
        | "integration"
        | "ux"
      platform_severity: "low" | "medium" | "high" | "critical"
      platform_signal_status:
        | "healthy"
        | "warning"
        | "critical"
        | "unknown"
        | "not_configured"
      platform_status:
        | "new"
        | "triaged"
        | "in_progress"
        | "waiting_customer"
        | "resolved"
        | "closed"
        | "archived"
      profile_lifecycle_status:
        | "draft"
        | "pending"
        | "invited"
        | "active"
        | "suspended"
        | "archived"
      support_feedback_category:
        | "feedback"
        | "complaint"
        | "suggestion"
        | "bug"
        | "question"
        | "incident"
        | "praise"
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
    Enums: {
      platform_device_type: [
        "desktop",
        "tablet",
        "mobile",
        "tv",
        "bot",
        "unknown",
      ],
      platform_event_origin: [
        "web",
        "ios",
        "android",
        "api",
        "system",
        "worker",
        "seed",
      ],
      platform_health_component_type: [
        "api",
        "database",
        "auth",
        "jobs",
        "storage",
        "webhook",
        "integration",
        "frontend",
        "realtime",
        "queue",
      ],
      platform_incident_type: [
        "outage",
        "degradation",
        "security",
        "performance",
        "billing",
        "integrity",
        "integration",
        "ux",
      ],
      platform_severity: ["low", "medium", "high", "critical"],
      platform_signal_status: [
        "healthy",
        "warning",
        "critical",
        "unknown",
        "not_configured",
      ],
      platform_status: [
        "new",
        "triaged",
        "in_progress",
        "waiting_customer",
        "resolved",
        "closed",
        "archived",
      ],
      profile_lifecycle_status: [
        "draft",
        "pending",
        "invited",
        "active",
        "suspended",
        "archived",
      ],
      support_feedback_category: [
        "feedback",
        "complaint",
        "suggestion",
        "bug",
        "question",
        "incident",
        "praise",
      ],
    },
  },
} as const
