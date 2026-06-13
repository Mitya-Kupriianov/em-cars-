-- Run this in Supabase SQL Editor AFTER creating bucket "car-images" in Dashboard > Storage

-- Make car-images bucket public
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to view images
CREATE POLICY "Public access to car images"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload car images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'car-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete car images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'car-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update/move images
CREATE POLICY "Authenticated users can update car images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'car-images'
  AND auth.role() = 'authenticated'
);
