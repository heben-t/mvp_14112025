import { createServerSupabaseClient } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, generateStoragePath, STORAGE_BUCKETS, StorageBucket } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - just verify there's a user session
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      console.error('Auth error in upload:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Upload request from user:', user.id);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as StorageBucket;
    const prefix = formData.get('prefix') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!bucket || !Object.values(STORAGE_BUCKETS).includes(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
    }

    const maxSizes: Record<StorageBucket, number> = {
      [STORAGE_BUCKETS.LOGOS]: 5 * 1024 * 1024,
      [STORAGE_BUCKETS.PITCH_DECKS]: 50 * 1024 * 1024,
      [STORAGE_BUCKETS.DOCUMENTS]: 20 * 1024 * 1024,
      [STORAGE_BUCKETS.VIDEOS]: 500 * 1024 * 1024,
    };

    if (file.size > maxSizes[bucket]) {
      return NextResponse.json(
        { error: `File too large. Max size: ${Math.round(maxSizes[bucket] / 1024 / 1024)}MB` },
        { status: 400 }
      );
    }

    const allowedTypes: Record<StorageBucket, string[]> = {
      [STORAGE_BUCKETS.LOGOS]: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
      [STORAGE_BUCKETS.PITCH_DECKS]: ['application/pdf'],
      [STORAGE_BUCKETS.DOCUMENTS]: ['application/pdf', 'image/jpeg', 'image/png'],
      [STORAGE_BUCKETS.VIDEOS]: ['video/mp4', 'video/webm'],
    };

    if (!allowedTypes[bucket].includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${allowedTypes[bucket].join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`Uploading file: ${file.name} (${file.size} bytes) to bucket: ${bucket}`);

    const storagePath = generateStoragePath(user.id, file.name, prefix || undefined);
    const result = await uploadFile(bucket, storagePath, file);

    console.log('Upload successful:', result.path);

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
