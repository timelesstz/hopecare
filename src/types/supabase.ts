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
          name: string
          role: 'ADMIN' | 'DONOR' | 'VOLUNTEER'
          status: 'ACTIVE' | 'INACTIVE'
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'ADMIN' | 'DONOR' | 'VOLUNTEER'
          status?: 'ACTIVE' | 'INACTIVE'
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'ADMIN' | 'DONOR' | 'VOLUNTEER'
          status?: 'ACTIVE' | 'INACTIVE'
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contents: {
        Row: {
          id: string
          title: string
          content: string
          type: string
          status: string
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type: string
          status: string
          author_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: string
          status?: string
          author_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      media: {
        Row: {
          id: string
          name: string
          url: string
          type: string
          size: number
          uploader_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          type: string
          size: number
          uploader_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          type?: string
          size?: number
          uploader_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          type: string
          value: number
          timestamp: string
        }
        Insert: {
          id?: string
          type: string
          value: number
          timestamp?: string
        }
        Update: {
          id?: string
          type?: string
          value?: number
          timestamp?: string
        }
      }
      volunteer_availability: {
        Row: {
          id: string
          volunteer_id: string
          day: string
          start_time: string
          end_time: string
          is_recurring: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          volunteer_id: string
          day: string
          start_time: string
          end_time: string
          is_recurring?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          volunteer_id?: string
          day?: string
          start_time?: string
          end_time?: string
          is_recurring?: boolean
          created_at?: string
          updated_at?: string
        }
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
  }
}
