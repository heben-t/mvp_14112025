-- ============================================================
-- Supabase Storage Buckets Setup
-- Run this in Supabase SQL Editor to create storage buckets
-- ============================================================

-- Create company-logos bucket (5MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Create pitch-decks bucket (50MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pitch-decks',
  'pitch-decks',
  true,
  52428800,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create documents bucket (20MB limit, private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  20971520,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Create videos bucket (500MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  524288000,
  ARRAY['video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Row Level Security (RLS) Policies for Storage
-- ============================================================

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Public can view pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

-- ============================================================
-- Company Logos Policies (Public bucket)
-- ============================================================

CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'company-logos');

CREATE POLICY "Users can delete their own logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- Pitch Decks Policies (Public bucket)
-- ============================================================

CREATE POLICY "Authenticated users can upload pitch decks"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pitch-decks');

CREATE POLICY "Public can view pitch decks"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'pitch-decks');

CREATE POLICY "Users can delete their own pitch decks"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'pitch-decks' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- Documents Policies (Private bucket - KYC documents)
-- ============================================================

CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- Videos Policies (Public bucket)
-- ============================================================

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'videos');

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- Verification Query
-- ============================================================

-- Run this to verify buckets were created successfully
SELECT id, name, public, file_size_limit, created_at 
FROM storage.buckets 
ORDER BY name;
