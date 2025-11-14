import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for admin operations (server-side only)
export function getServiceRoleClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Alias for getServiceRoleClient
export const getSupabaseClient = getServiceRoleClient;

export const STORAGE_BUCKETS = {
  LOGOS: 'company-logos',
  PITCH_DECKS: 'pitch-decks',
  DOCUMENTS: 'documents',
  VIDEOS: 'videos',
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File,
  options?: { upsert?: boolean }
): Promise<{ url: string; path: string }> {
  // Use service role client to bypass RLS
  const serviceClient = getServiceRoleClient();
  
  const { data, error } = await serviceClient.storage
    .from(bucket)
    .upload(path, file, {
      upsert: options?.upsert ?? false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = serviceClient.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}

export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  // Use service role client to bypass RLS
  const serviceClient = getServiceRoleClient();
  const { error } = await serviceClient.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export async function getPublicUrl(bucket: StorageBucket, path: string): Promise<string> {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function generateStoragePath(userId: string, filename: string, prefix?: string): string {
  const timestamp = Date.now();
  const extension = getFileExtension(filename);
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  if (prefix) {
    return `${prefix}/${userId}/${timestamp}-${sanitizedName}`;
  }
  
  return `${userId}/${timestamp}-${sanitizedName}`;
}
