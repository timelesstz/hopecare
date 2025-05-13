export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          role: string
          status: string | null
          email_verified: boolean | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          avatar_url: string | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          role?: string
          status?: string | null
          email_verified?: boolean | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          avatar_url?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          role?: string
          status?: string | null
          email_verified?: boolean | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          avatar_url?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      donor_profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          address: string | null
          preferred_causes: string[] | null
          donation_frequency: string | null
          donation_amount: number | null
          tax_receipt_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          preferred_causes?: string[] | null
          donation_frequency?: string | null
          donation_amount?: number | null
          tax_receipt_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          preferred_causes?: string[] | null
          donation_frequency?: string | null
          donation_amount?: number | null
          tax_receipt_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donor_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      volunteer_profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          address: string | null
          skills: string[] | null
          availability: string[] | null
          interests: string[] | null
          experience: string | null
          applied_opportunities: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          skills?: string[] | null
          availability?: string[] | null
          interests?: string[] | null
          experience?: string | null
          applied_opportunities?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          skills?: string[] | null
          availability?: string[] | null
          interests?: string[] | null
          experience?: string | null
          applied_opportunities?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_profiles: {
        Row: {
          id: string
          full_name: string | null
          position: string | null
          department: string | null
          access_level: string | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          position?: string | null
          department?: string | null
          access_level?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          position?: string | null
          department?: string | null
          access_level?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      donations: {
        Row: {
          id: string
          donor_id: string | null
          amount: number
          currency: string | null
          payment_method: string | null
          payment_status: string | null
          transaction_id: string | null
          campaign: string | null
          donation_date: string | null
          is_anonymous: boolean | null
          message: string | null
          receipt_sent: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_id?: string | null
          amount: number
          currency?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
          campaign?: string | null
          donation_date?: string | null
          is_anonymous?: boolean | null
          message?: string | null
          receipt_sent?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_id?: string | null
          amount?: number
          currency?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
          campaign?: string | null
          donation_date?: string | null
          is_anonymous?: boolean | null
          message?: string | null
          receipt_sent?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: Json | null
          excerpt: string | null
          featured_image: string | null
          author_id: string | null
          status: string | null
          categories: string[] | null
          tags: string[] | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content?: Json | null
          excerpt?: string | null
          featured_image?: string | null
          author_id?: string | null
          status?: string | null
          categories?: string[] | null
          tags?: string[] | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: Json | null
          excerpt?: string | null
          featured_image?: string | null
          author_id?: string | null
          status?: string | null
          categories?: string[] | null
          tags?: string[] | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pages: {
        Row: {
          id: string
          title: string
          slug: string
          content: Json | null
          meta_description: string | null
          featured_image: string | null
          author_id: string | null
          status: string | null
          template: string | null
          parent_id: string | null
          sort_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content?: Json | null
          meta_description?: string | null
          featured_image?: string | null
          author_id?: string | null
          status?: string | null
          template?: string | null
          parent_id?: string | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: Json | null
          meta_description?: string | null
          featured_image?: string | null
          author_id?: string | null
          status?: string | null
          template?: string | null
          parent_id?: string | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "pages"
            referencedColumns: ["id"]
          }
        ]
      }
      opportunities: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string | null
          date: string | null
          duration: number | null
          skills_required: string[] | null
          coordinator: string | null
          status: string | null
          image: string | null
          max_volunteers: number | null
          current_volunteers: number | null
          applicants: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location?: string | null
          date?: string | null
          duration?: number | null
          skills_required?: string[] | null
          coordinator?: string | null
          status?: string | null
          image?: string | null
          max_volunteers?: number | null
          current_volunteers?: number | null
          applicants?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          location?: string | null
          date?: string | null
          duration?: number | null
          skills_required?: string[] | null
          coordinator?: string | null
          status?: string | null
          image?: string | null
          max_volunteers?: number | null
          current_volunteers?: number | null
          applicants?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      email_verification_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          used: boolean
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          used?: boolean
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          used?: boolean
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_verification_tokens_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      role_permissions: {
        Row: {
          id: string
          role: string
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role: string
          permissions: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: string
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      volunteer_certifications: {
        Row: {
          id: string
          volunteer_id: string
          name: string
          issue_date: string
          expiry_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          volunteer_id: string
          name: string
          issue_date: string
          expiry_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          volunteer_id?: string
          name?: string
          issue_date?: string
          expiry_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_certifications_volunteer_id_fkey"
            columns: ["volunteer_id"]
            referencedRelation: "volunteer_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      volunteer_applications: {
        Row: {
          id: string
          volunteer_id: string
          opportunity_id: string
          status: string
          message: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          volunteer_id: string
          opportunity_id: string
          status?: string
          message?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          volunteer_id?: string
          opportunity_id?: string
          status?: string
          message?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_applications_volunteer_id_fkey"
            columns: ["volunteer_id"]
            referencedRelation: "volunteer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          }
        ]
      }
      volunteer_hours: {
        Row: {
          id: string
          volunteer_id: string
          opportunity_id: string | null
          hours: number
          activity_date: string
          description: string | null
          status: string
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          volunteer_id: string
          opportunity_id?: string | null
          hours: number
          activity_date: string
          description?: string | null
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          volunteer_id?: string
          opportunity_id?: string | null
          hours?: number
          activity_date?: string
          description?: string | null
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_hours_volunteer_id_fkey"
            columns: ["volunteer_id"]
            referencedRelation: "volunteer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_hours_opportunity_id_fkey"
            columns: ["opportunity_id"]
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_hours_approved_by_fkey"
            columns: ["approved_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      background_checks: {
        Row: {
          id: string
          volunteer_id: string
          status: string
          check_type: string
          requested_by: string | null
          approved_by: string | null
          requested_at: string
          completed_at: string | null
          expires_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          volunteer_id: string
          status?: string
          check_type: string
          requested_by?: string | null
          approved_by?: string | null
          requested_at?: string
          completed_at?: string | null
          expires_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          volunteer_id?: string
          status?: string
          check_type?: string
          requested_by?: string | null
          approved_by?: string | null
          requested_at?: string
          completed_at?: string | null
          expires_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "background_checks_volunteer_id_fkey"
            columns: ["volunteer_id"]
            referencedRelation: "volunteer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "background_checks_requested_by_fkey"
            columns: ["requested_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "background_checks_approved_by_fkey"
            columns: ["approved_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      donation_metadata: {
        Row: {
          id: string
          donation_id: string
          key: string
          value: string
          created_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          key: string
          value: string
          created_at?: string
        }
        Update: {
          id?: string
          donation_id?: string
          key?: string
          value?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_metadata_donation_id_fkey"
            columns: ["donation_id"]
            referencedRelation: "donations"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
