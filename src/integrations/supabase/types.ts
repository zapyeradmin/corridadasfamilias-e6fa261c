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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          city: string | null
          created_at: string
          description: string | null
          edition: string | null
          event_date: string
          id: string
          is_active: boolean
          location: string | null
          name: string
          slug: string
          state: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          description?: string | null
          edition?: string | null
          event_date: string
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          slug: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          description?: string | null
          edition?: string | null
          event_date?: string
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          slug?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_published: boolean
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_published?: boolean
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_published?: boolean
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lots: {
        Row: {
          child_price_cents: number | null
          created_at: string
          ends_at: string
          event_id: string
          id: string
          is_active: boolean
          max_slots: number | null
          name: string
          price_cents: number
          sort_order: number
          starts_at: string
          updated_at: string
        }
        Insert: {
          child_price_cents?: number | null
          created_at?: string
          ends_at: string
          event_id: string
          id?: string
          is_active?: boolean
          max_slots?: number | null
          name: string
          price_cents: number
          sort_order?: number
          starts_at: string
          updated_at?: string
        }
        Update: {
          child_price_cents?: number | null
          created_at?: string
          ends_at?: string
          event_id?: string
          id?: string
          is_active?: boolean
          max_slots?: number | null
          name?: string
          price_cents?: number
          sort_order?: number
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lots_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          checkout_url: string | null
          created_at: string
          external_reference: string | null
          id: string
          paid_at: string | null
          provider: string
          provider_event_id: string | null
          provider_session_id: string | null
          raw_payload: Json
          registration_id: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount_cents: number
          checkout_url?: string | null
          created_at?: string
          external_reference?: string | null
          id?: string
          paid_at?: string | null
          provider?: string
          provider_event_id?: string | null
          provider_session_id?: string | null
          raw_payload?: Json
          registration_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          checkout_url?: string | null
          created_at?: string
          external_reference?: string | null
          id?: string
          paid_at?: string | null
          provider?: string
          provider_event_id?: string | null
          provider_session_id?: string | null
          raw_payload?: Json
          registration_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          accepted_lgpd: boolean
          accepted_terms: boolean
          amount_cents: number
          birth_date: string
          category: string
          cpf: string
          cpf_normalized: string
          created_at: string
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          event_id: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          lot_id: string
          medical_notes: string | null
          metadata: Json
          protocol: string
          shirt_size: Database["public"]["Enums"]["shirt_size"]
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
          whatsapp: string
        }
        Insert: {
          accepted_lgpd?: boolean
          accepted_terms?: boolean
          amount_cents: number
          birth_date: string
          category: string
          cpf: string
          cpf_normalized: string
          created_at?: string
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          event_id: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          lot_id: string
          medical_notes?: string | null
          metadata?: Json
          protocol?: string
          shirt_size: Database["public"]["Enums"]["shirt_size"]
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          whatsapp: string
        }
        Update: {
          accepted_lgpd?: boolean
          accepted_terms?: boolean
          amount_cents?: number
          birth_date?: string
          category?: string
          cpf?: string
          cpf_normalized?: string
          created_at?: string
          email?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          event_id?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          lot_id?: string
          medical_notes?: string | null
          metadata?: Json
          protocol?: string
          shirt_size?: Database["public"]["Enums"]["shirt_size"]
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          is_public?: boolean
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          logo_url: string
          name: string
          sort_order: number
          tier: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          logo_url: string
          name: string
          sort_order?: number
          tier?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          logo_url?: string
          name?: string
          sort_order?: number
          tier?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      normalize_cpf: { Args: { _cpf: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "staff"
      gender: "M" | "F"
      payment_status:
        | "pending"
        | "processing"
        | "paid"
        | "failed"
        | "canceled"
        | "refunded"
      registration_status:
        | "pending"
        | "processing"
        | "paid"
        | "failed"
        | "canceled"
        | "refunded"
      shirt_size: "PP" | "P" | "M" | "G" | "GG" | "XGG"
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
      app_role: ["admin", "staff"],
      gender: ["M", "F"],
      payment_status: [
        "pending",
        "processing",
        "paid",
        "failed",
        "canceled",
        "refunded",
      ],
      registration_status: [
        "pending",
        "processing",
        "paid",
        "failed",
        "canceled",
        "refunded",
      ],
      shirt_size: ["PP", "P", "M", "G", "GG", "XGG"],
    },
  },
} as const
