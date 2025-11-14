import { supabase } from './supabase';

export type UploadBucket = 'avatars' | 'pitch-decks' | 'documents' | 'logos';

interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export async function uploadFile(
  file: File,
  bucket: UploadBucket,
  userId: string
): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: '', path: '', error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function deleteFile(
  bucket: UploadBucket,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

export async function getFileUrl(bucket: UploadBucket, path: string): Promise<string> {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
