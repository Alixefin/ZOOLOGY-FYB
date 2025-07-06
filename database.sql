
-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS public.award_votes;
DROP TABLE IF EXISTS public.award_nominations;
DROP TABLE IF EXISTS public.awards;
DROP TABLE IF EXISTS public.students;
DROP TABLE IF EXISTS public.app_settings;

-- Create app_settings table
-- This table stores global settings for the application.
CREATE TABLE public.app_settings (
    id smallint PRIMARY KEY,
    logos jsonb null,
    voting_settings jsonb null,
    fyb_week_settings jsonb null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-- RLS for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read app settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to update their own settings" ON public.app_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (true);

-- Create students table
-- This table stores student profiles.
CREATE TABLE public.students (
    id text not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    name text not null,
    nickname text null,
    best_level text null,
    worst_level text null,
    favourite_lecturer text null,
    relationship_status text null,
    alternative_career text null,
    best_experience text null,
    worst_experience text null,
    will_miss text null,
    image_src text null,
    CONSTRAINT students_pkey PRIMARY KEY (id)
);
-- RLS for students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.students FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON public.students FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users only" ON public.students FOR DELETE TO authenticated USING (true);

-- Create awards table
CREATE TABLE public.awards (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    name text not null,
    description text null,
    CONSTRAINT awards_pkey PRIMARY KEY (id)
);
-- RLS for awards
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.awards FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.awards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON public.awards FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users only" ON public.awards FOR DELETE TO authenticated USING (true);

-- Create award_nominations table
CREATE TABLE public.award_nominations (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    award_id uuid not null,
    student_id text not null,
    votes integer not null default 0,
    CONSTRAINT award_nominations_pkey PRIMARY KEY (id),
    CONSTRAINT award_nominations_award_id_fkey FOREIGN KEY (award_id) REFERENCES awards (id) ON DELETE CASCADE,
    CONSTRAINT award_nominations_student_id_fkey FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
);
-- RLS for award_nominations
ALTER TABLE public.award_nominations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.award_nominations FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.award_nominations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON public.award_nominations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users only" ON public.award_nominations FOR DELETE TO authenticated USING (true);

-- Function to increment votes
create or replace function increment_vote (nomination_id_in uuid)
returns void as
$$
  update public.award_nominations
  set votes = votes + 1
  where id = nomination_id_in;
$$
language sql volatile;

-- Seed initial app_settings row if it doesn't exist
INSERT INTO public.app_settings (id, logos, voting_settings, fyb_week_settings)
SELECT 1, '{"associationLogo": null, "schoolLogo": null}', '{"isVotingActive": false}', '{"isFybWeekActive": false}'
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings WHERE id = 1);

-- Grant usage on schema public to postgres and anon roles
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
