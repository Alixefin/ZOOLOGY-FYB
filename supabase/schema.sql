-- 1. Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
    id BIGINT PRIMARY KEY,
    logos JSONB,
    fyb_week_settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create students table
CREATE TABLE IF NOT EXISTS students (
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

-- 3. Function to update the 'updated_at' column
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger to automatically update 'updated_at' on student update
DROP TRIGGER IF EXISTS on_student_update ON students;
CREATE TRIGGER on_student_update
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- 5. RLS for app_settings table
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to app settings" ON app_settings;
CREATE POLICY "Allow public read access to app settings" ON app_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow public write access to app settings" ON app_settings;
CREATE POLICY "Allow public write access to app settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);


-- 6. RLS for students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to students" ON students;
CREATE POLICY "Allow public read access to students" ON students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to students" ON students;
DROP POLICY IF EXISTS "Allow public write access to students" ON students;
CREATE POLICY "Allow public write access to students" ON students FOR ALL USING (true) WITH CHECK (true);

-- 7. Create a singleton row in app_settings if it doesn't exist.
INSERT INTO app_settings (id, logos, fyb_week_settings)
VALUES (1, '{"associationLogo": null, "schoolLogo": null}', '{"isUnlocked": false, "title": "FYB Week Extravaganza!", "schedule": "Detailed schedule coming soon...", "activities": "Exciting activities lineup to be announced!", "eventImages": []}')
ON CONFLICT (id) DO NOTHING;

/************************************************************************************
 * Supabase Storage Policies
 *
 * Notes:
 * - These policies should be applied AFTER creating the 'app-public-assets' bucket.
 * - These policies allow public read access, which is suitable for this app.
 * - Write access (insert, update, delete) is made public to align with the app's
 *   client-side admin PIN logic.
 ************************************************************************************/

-- 1. Public read access for all files in the 'app-public-assets' bucket
DROP POLICY IF EXISTS "Allow public read access to app assets" ON storage.objects;
CREATE POLICY "Allow public read access to app assets" ON storage.objects 
FOR SELECT USING (bucket_id = 'app-public-assets');

-- 2. Allow anyone to insert files into the 'app-public-assets' bucket
DROP POLICY IF EXISTS "Allow admin insert on app assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert on app assets" ON storage.objects;
CREATE POLICY "Allow public insert on app assets" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'app-public-assets');

-- 3. Allow anyone to update files in the 'app-public-assets' bucket
DROP POLICY IF EXISTS "Allow admin update on app assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update on app assets" ON storage.objects;
CREATE POLICY "Allow public update on app assets" ON storage.objects 
FOR UPDATE USING (bucket_id = 'app-public-assets');

-- 4. Allow anyone to delete files from the 'app-public-assets' bucket
DROP POLICY IF EXISTS "Allow admin delete on app assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete on app assets" ON storage.objects;
CREATE POLICY "Allow public delete on app assets" ON storage.objects 
FOR DELETE USING (bucket_id = 'app-public-assets');
