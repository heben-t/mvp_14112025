/**
 * Supabase Auth Configuration
 * This file provides server-side Supabase client creation utilities
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server component - cookies are read-only
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Server component - cookies are read-only
          }
        },
      },
    }
  );
}

export async function getSession() {
  const supabase = createServerSupabaseClient();
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function getSessionUser() {
  const supabase = createServerSupabaseClient();
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting session user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
}

export async function getCurrentUser() {
  const supabase = createServerSupabaseClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Get user details from public.users table
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, name, role, image')
      .eq('id', user.id)
      .single();

    return userData;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}
