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
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the app_settings table
CREATE TABLE public.app_settings (
    id BIGINT PRIMARY KEY,
    logos JSONB,
    fyb_week_settings JSONB,
    admin_pin_hash TEXT, -- Optional, for future use
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) for the tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the students table
CREATE POLICY "Allow public read access on students"
ON public.students FOR SELECT
USING (true);

CREATE POLICY "Allow insert for authenticated users on students"
ON public.students FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users on students"
ON public.students FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow delete for authenticated users on students"
ON public.students FOR DELETE
TO authenticated
USING (true);

-- Create RLS policies for the app_settings table
CREATE POLICY "Allow public read access on app_settings"
ON public.app_settings FOR SELECT
USING (true);

CREATE POLICY "Allow update for authenticated users on app_settings"
ON public.app_settings FOR UPDATE
TO authenticated
USING (true);

-- Seed initial data for app_settings (optional, but recommended)
INSERT INTO public.app_settings (id, logos, fyb_week_settings)
VALUES (
    1,
    '{"associationLogo": null, "schoolLogo": null}',
    '{"isUnlocked": false, "title": "FYB Week Extravaganza!", "schedule": "Detailed schedule coming soon...", "activities": "Exciting activities lineup to be announced!", "eventImages": []}'
) ON CONFLICT (id) DO NOTHING;


--
-- Supabase Storage Policies for 'app-public-assets' bucket
--
-- After creating the "app-public-assets" bucket in the Supabase Dashboard,
-- run these policies in the SQL Editor to secure it.

-- 1. Allow public read access to all files in the bucket
CREATE POLICY "Public read access for app-public-assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'app-public-assets' );

-- 2. Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'app-public-assets' );

-- 3. Allow authenticated users to update files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'app-public-assets' );

-- 4. Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'app-public-assets' );
