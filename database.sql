-- This script resets your Supabase database tables for the Cyber Clan FYB Week app.
-- To use this, navigate to the "SQL Editor" in your Supabase project dashboard,
-- paste the entire content of this file, and click "Run".

-- Step 1: Drop existing tables to ensure a clean slate.
-- The CASCADE option will automatically drop dependent objects.
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;

-- Step 2: Create the new 'students' table with the updated schema.
-- This schema matches the fields in the updated StudentForm component.
CREATE TABLE public.students (
    id TEXT PRIMARY KEY NOT NULL, -- User-provided ID
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
    image_src TEXT, -- URL link to an image
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Create the 'app_settings' table to store global application settings.
-- This table is designed to hold a single row of data (with id = 1).
CREATE TABLE public.app_settings (
    id INT PRIMARY KEY NOT NULL,
    logos JSONB,
    fyb_week_settings JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 4: Enable Row Level Security (RLS) for the tables.
-- This is a standard security best practice.
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies to allow public read access to the data.
-- This is necessary so the application can fetch data without requiring users to log in.
CREATE POLICY "Allow public read access to students" ON public.students
FOR SELECT USING (true);

CREATE POLICY "Allow public read access to app settings" ON public.app_settings
FOR SELECT USING (true);

-- Step 6: Create a trigger function to automatically update the 'updated_at' timestamp on any row update.
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Attach the trigger to both tables.
CREATE TRIGGER on_students_updated
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER on_app_settings_updated
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Final Note on Supabase Storage:
-- This SQL script does NOT clear out your Supabase Storage bucket ('app-public-assets').
-- If you want to clear old images that were previously uploaded, you must do so manually
-- via the Supabase dashboard. Navigate to Storage -> app-public-assets and delete
-- the folders or files as needed.
