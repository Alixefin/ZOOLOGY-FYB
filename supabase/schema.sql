-- Create the students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nickname TEXT,
  birthday TEXT,
  relationship_status TEXT,
  state_of_origin TEXT,
  lga TEXT,
  favourite_course TEXT,
  favourite_lecturer TEXT,
  favourite_coursemates TEXT[],
  hobbies TEXT[],
  posts_held TEXT,
  best_level TEXT,
  worst_level TEXT,
  class_rep_quote TEXT,
  parting_words TEXT,
  image_src TEXT,
  flyer_image_src TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the app_settings table (singleton)
CREATE TABLE public.app_settings (
  id INT PRIMARY KEY,
  logos JSONB,
  fyb_week_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the singleton row for app_settings
INSERT INTO public.app_settings (id, logos, fyb_week_settings)
VALUES (
  1,
  '{"associationLogo": null, "schoolLogo": null}',
  '{"isUnlocked": false, "title": "FYB Week Extravaganza!", "schedule": "Detailed schedule coming soon...", "activities": "Exciting activities lineup to be announced!", "eventImages": []}'
)
ON CONFLICT (id) DO NOTHING;


-- Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table
-- 1. Allow public read access to everyone
CREATE POLICY "Allow public read access on students"
ON public.students FOR SELECT
USING (true);

-- 2. Allow authenticated users to insert new students
CREATE POLICY "Allow insert for authenticated users on students"
ON public.students FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Allow authenticated users to update their own records
CREATE POLICY "Allow update for authenticated users on students"
ON public.students FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Allow authenticated users to delete their own records
CREATE POLICY "Allow delete for authenticated users on students"
ON public.students FOR DELETE
TO authenticated
USING (true);


-- RLS Policies for app_settings table
-- 1. Allow public read access to everyone
CREATE POLICY "Allow public read access on app_settings"
ON public.app_settings FOR SELECT
USING (true);

-- 2. Allow authenticated users to update settings
CREATE POLICY "Allow update for authenticated users on app_settings"
ON public.app_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);


-- Supabase Storage Policies
-- Policies for the 'app-public-assets' bucket

-- 1. Allow public read access to all files in the bucket
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'app-public-assets' );

-- 2. Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'app-public-assets' );

-- 3. Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'app-public-assets' );

-- 4. Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'app-public-assets' );
