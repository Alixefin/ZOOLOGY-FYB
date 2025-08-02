
-- Drop existing tables with CASCADE to remove dependent objects
DROP TABLE IF EXISTS public.award_nominations CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.awards CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.increment_vote(nomination_id_in text);

-- 1. Create Students Table
-- This table stores individual student profiles. The ID is text to accommodate various formats.
CREATE TABLE public.students (
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
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to students" ON public.students FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');


-- 2. Create Awards Table
-- This table stores the different award categories.
CREATE TABLE public.awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to awards" ON public.awards FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to awards" ON public.awards FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');


-- 3. Create Award Nominations Table
-- This table links students to awards they are nominated for.
CREATE TABLE public.award_nominations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    award_id UUID REFERENCES public.awards(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    votes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(award_id, student_id) -- Ensures a student can only be nominated once per award
);
ALTER TABLE public.award_nominations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to nominations" ON public.award_nominations FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to nominations" ON public.award_nominations FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');


-- 4. Create App Settings Table
-- A key-value style table to hold various global application settings.
-- We will use a single row with a fixed ID for simplicity.
CREATE TABLE public.app_settings (
    id INT PRIMARY KEY,
    logos JSONB,
    voting_settings JSONB,
    fyb_week_settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to app settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to app settings" ON public.app_settings FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');


-- 5. Create Storage Bucket
-- A dedicated bucket for public assets like logos.
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-public-assets', 'app-public-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access to app assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'app-public-assets' );

CREATE POLICY "Allow admin full access to app assets"
ON storage.objects FOR ALL
USING ( bucket_id = 'app-public-assets' AND auth.role() = 'service_role' )
WITH CHECK ( bucket_id = 'app-public-assets' AND auth.role() = 'service_role' );


-- 6. Create Vote Increment Function
-- A secure RPC function to increment votes. This prevents users from setting vote counts directly.
CREATE OR REPLACE FUNCTION public.increment_vote(nomination_id_in UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.award_nominations
  SET votes = votes + 1
  WHERE id = nomination_id_in;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function to the public role
GRANT EXECUTE ON FUNCTION public.increment_vote(UUID) TO anon, authenticated;

-- Seed the settings table with a default row if it doesn't exist
INSERT INTO public.app_settings (id, logos, voting_settings, fyb_week_settings)
VALUES (1, '{"associationLogo": null, "schoolLogo": null, "roastBackground": null}', '{"isVotingActive": false}', '{"isFybWeekActive": false}')
ON CONFLICT (id) DO NOTHING;

-- Trigger to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_student_update
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER on_settings_update
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();
