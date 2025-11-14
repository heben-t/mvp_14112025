# Supabase Storage Setup

This guide explains how to set up and configure Supabase Storage for file uploads in the AI ROI Dashboard.

## Storage Buckets

The application uses four storage buckets:

1. **company-logos** - Company/startup logos (max 5MB)
   - Allowed types: image/jpeg, image/png, image/webp, image/svg+xml
   - Public access enabled

2. **pitch-decks** - Startup pitch decks (max 50MB)
   - Allowed types: application/pdf
   - Public access enabled

3. **documents** - KYC and verification documents (max 20MB)
   - Allowed types: application/pdf, image/jpeg, image/png
   - Private access (requires authentication)

4. **videos** - Video content for VSL (max 500MB)
   - Allowed types: video/mp4, video/webm
   - Public access enabled

## Setup Instructions

### 1. Create Storage Buckets

In your Supabase dashboard:

1. Go to **Storage** in the left sidebar
2. Click **Create bucket** for each of the following:

#### Company Logos Bucket
```
Name: company-logos
Public: Yes
File size limit: 5MB
Allowed MIME types: image/*
```

#### Pitch Decks Bucket
```
Name: pitch-decks
Public: Yes
File size limit: 50MB
Allowed MIME types: application/pdf
```

#### Documents Bucket
```
Name: documents
Public: No
File size limit: 20MB
Allowed MIME types: application/pdf, image/*
```

#### Videos Bucket
```
Name: videos
Public: Yes
File size limit: 500MB
Allowed MIME types: video/*
```

### 2. Configure Storage Policies

For each bucket, you need to set up Row Level Security (RLS) policies.

#### Company Logos (Public Upload)

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

-- Allow public read access
CREATE POLICY "Public can view logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Pitch Decks (Public Upload)

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload pitch decks"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pitch-decks');

-- Allow public read access
CREATE POLICY "Public can view pitch decks"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pitch-decks');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own pitch decks"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pitch-decks' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Documents (Private Access)

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow users to view only their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Videos (Public Upload)

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Allow public read access
CREATE POLICY "Public can view videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. Environment Variables

Make sure your `.env.local` file has the following Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase dashboard under **Settings → API**.

## Usage in Application

### File Upload Component

The application uses a reusable `FileUpload` component:

```tsx
import { FileUpload } from '@/components/ui/file-upload';
import { STORAGE_BUCKETS } from '@/lib/supabase';

<FileUpload
  label="Company Logo"
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  preview="image"
  onUpload={(file) => handleUpload(file, STORAGE_BUCKETS.LOGOS)}
  currentUrl={logoUrl}
  onRemove={() => setLogoUrl('')}
/>
```

### Upload Handler

```tsx
const handleUpload = async (file: File, bucket: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.url; // Public URL of uploaded file
};
```

## Features Implemented

✅ **Startup Onboarding**
- Company logo upload
- Business license upload (KYC)
- Founder ID document upload (KYC)

✅ **Investor Onboarding**
- Accreditation document upload

✅ **Campaign Creation**
- Pitch deck upload (PDF)
- VSL video URL support

✅ **File Management**
- Drag-and-drop support
- File type validation
- Size limit enforcement
- Progress indicators
- Remove/replace functionality

## Security Features

- ✅ Server-side file validation
- ✅ File type restrictions per bucket
- ✅ Size limits per bucket
- ✅ Authentication required for uploads
- ✅ User-scoped file access for private documents
- ✅ Public access for campaign materials
- ✅ Automatic file path generation with user ID

## Troubleshooting

### Upload Fails with 403 Error
- Check that RLS policies are correctly set up
- Verify user is authenticated
- Ensure bucket exists and is accessible

### Files Not Displaying
- Verify bucket is set to public if needed
- Check file URL is correctly stored in database
- Confirm file extension is supported

### Large File Upload Timeout
- Consider implementing resumable uploads for files >100MB
- Increase Next.js API route timeout if needed
- Use progress callbacks for better UX

## Next Steps

- [ ] Add image compression for logos
- [ ] Implement video thumbnail generation
- [ ] Add PDF preview functionality
- [ ] Set up CDN for faster file delivery
- [ ] Implement file versioning
- [ ] Add bulk upload capability
