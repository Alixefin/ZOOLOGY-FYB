-- Drop old tables if they exist to ensure a clean slate
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS app_settings;

-- Create the new students table
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  best_level TEXT NOT NULL,
  worst_level TEXT NOT NULL,
  favourite_lecturer TEXT NOT NULL,
  relationship_status TEXT NOT NULL,
  alternative_career TEXT NOT NULL,
  best_experience TEXT NOT NULL,
  worst_experience TEXT NOT NULL,
  will_miss TEXT NOT NULL,
  image_src TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the app_settings table
CREATE TABLE app_settings (
  id INT PRIMARY KEY,
  logos JSONB,
  fyb_week_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the single row for app settings
INSERT INTO app_settings (id, logos, fyb_week_settings)
VALUES (1, '{"associationLogo": null, "schoolLogo": null}', '{"isUnlocked": false, "title": "Cyber Clan FYB Week Extravaganza!", "schedule": "Detailed schedule coming soon...", "activities": "Exciting activities lineup to be announced!", "eventImages": []}')
ON CONFLICT (id) DO NOTHING;


-- ======== ROW LEVEL SECURITY POLICIES ========

-- Drop existing policies to ensure a clean slate
-- Note: Using 'IF EXISTS' prevents errors if the policies don't exist.
DROP POLICY IF EXISTS "Allow public read access to students" ON public.students;
DROP POLICY IF EXISTS "Allow anon writes for students" ON public.students;
DROP POLICY IF EXISTS "Allow public read access to app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow anon modification of app settings" ON public.app_settings;


-- Enable Row Level Security (RLS) for the tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;


-- == Policies for 'students' table ==
-- 1. Allow anyone to read all student profiles
CREATE POLICY "Allow public read access to students"
ON public.students FOR SELECT
USING (true);

-- 2. Allow any client (using the anon key) to create, update, and delete students
CREATE POLICY "Allow anon writes for students"
ON public.students FOR ALL -- Covers INSERT, UPDATE, DELETE
USING (true)
WITH CHECK (true);


-- == Policies for 'app_settings' table ==
-- 1. Allow anyone to read the application settings (the single row with id = 1)
CREATE POLICY "Allow public read access to app settings"
ON public.app_settings FOR SELECT
USING (id = 1);

-- 2. Allow any client (using the anon key) to insert or update the single settings row
CREATE POLICY "Allow anon modification of app settings"
ON public.app_settings FOR ALL -- Covers INSERT, UPDATE
USING (id = 1)
WITH CHECK (id = 1);
