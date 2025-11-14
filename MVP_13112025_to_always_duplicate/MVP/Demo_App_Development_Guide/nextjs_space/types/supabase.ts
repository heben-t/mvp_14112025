/**
 * Supabase Database Type Definitions
 * Auto-generated types for type-safe database queries
 */

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
          name: string | null
          role: 'STARTUP' | 'INVESTOR'
          image: string | null
          emailVerified: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role: 'STARTUP' | 'INVESTOR'
          image?: string | null
          emailVerified?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'STARTUP' | 'INVESTOR'
          image?: string | null
          emailVerified?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      startup_profiles: {
        Row: {
          id: string
          userId: string
          companyName: string | null
          industry: string | null
          stage: string | null
          onboardingComplete: boolean
          createdAt: string
          updatedAt: string
        }
      }
      investor_profiles: {
        Row: {
          id: string
          userId: string
          onboardingComplete: boolean
          createdAt: string
          updatedAt: string
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
