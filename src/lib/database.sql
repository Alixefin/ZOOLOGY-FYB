-- Drop existing tables if they exist to start fresh.
DROP TABLE IF EXISTS "students" CASCADE;
DROP TABLE IF EXISTS "awards" CASCADE;
DROP TABLE IF EXISTS "award_nominations" CASCADE;
DROP TABLE IF EXISTS "app_settings" CASCADE;
DROP TABLE IF EXISTS "fyb_week_events" CASCADE;
DROP TABLE IF EXISTS "fyb_week_gallery" CASCADE;

-- Create storage bucket for public assets if it doesn't exist
-- Note: This is illustrative. Bucket creation is typically done via Supabase UI or management API.
-- Ensure 'app-public-assets' bucket exists and is public.

-- Create students table
CREATE TABLE "students" (
  "id" text NOT NULL PRIMARY KEY,
  "name" text NOT NULL,
  "nickname" text,
  "best_level" text NOT NULL,
  "worst_level" text NOT NULL,
  "favourite_lecturer" text NOT NULL,
  "relationship_status" text NOT NULL,
  "alternative_career" text NOT NULL,
  "best_experience" text NOT NULL,
  "worst_experience" text NOT NULL,
  "will_miss" text NOT NULL,
  "image_src" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

-- Create awards table
CREATE TABLE "awards" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" text NOT NULL,
  "description" text,
  "created_at" timestamptz DEFAULT now()
);

-- Create award_nominations table
CREATE TABLE "award_nominations" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "award_id" uuid NOT NULL REFERENCES "awards"("id") ON DELETE CASCADE,
  "student_id" text NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "votes" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  UNIQUE("award_id", "student_id")
);

-- Create fyb_week_events table
CREATE TABLE "fyb_week_events" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "day_index" integer NOT NULL UNIQUE,
  "title" text NOT NULL,
  "description" text,
  "created_at" timestamptz DEFAULT now()
);

-- Create fyb_week_gallery table
CREATE TABLE "fyb_week_gallery" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "event_id" uuid NOT NULL REFERENCES "fyb_week_events"("id") ON DELETE CASCADE,
    "image_url" text NOT NULL,
    "created_at" timestamptz DEFAULT now()
);


-- Create app_settings table (as a key-value or singleton table)
CREATE TABLE "app_settings" (
  "id" integer PRIMARY KEY,
  "logos" jsonb,
  "voting_settings" jsonb,
  "fyb_week_settings" jsonb,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  CONSTRAINT "app_settings_singleton" CHECK (id = 1)
);

-- Insert default settings row
INSERT INTO "app_settings" (id, logos, voting_settings, fyb_week_settings)
VALUES (
  1,
  '{"associationLogo": null, "schoolLogo": null, "roastBackground": null}',
  '{"isVotingActive": false}',
  '{"isFybWeekActive": false, "startDate": null, "scheduleDesignImage": null}'
)
ON CONFLICT (id) DO NOTHING;


-- Create a function to increment votes
CREATE OR REPLACE FUNCTION increment_vote(nomination_id_in uuid)
RETURNS void AS $$
BEGIN
  UPDATE award_nominations
  SET votes = votes + 1
  WHERE id = nomination_id_in;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "awards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "award_nominations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fyb_week_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fyb_week_gallery" ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read students" ON "students" FOR SELECT USING (true);
CREATE POLICY "Public can read awards" ON "awards" FOR SELECT USING (true);
CREATE POLICY "Public can read award nominations" ON "award_nominations" FOR SELECT USING (true);
CREATE POLICY "Public can read app settings" ON "app_settings" FOR SELECT USING (true);
CREATE POLICY "Public can read fyb week events" ON "fyb_week_events" FOR SELECT USING (true);
CREATE POLICY "Public can read fyb week gallery" ON "fyb_week_gallery" FOR SELECT USING (true);

-- For simplicity in this project, we'll allow anon role to perform all actions.
-- In a real-world scenario, you would have more restrictive policies, likely
-- based on an 'auth.uid()' check for authenticated users with specific roles.
CREATE POLICY "Anon can do everything" ON "students" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon can do everything on awards" ON "awards" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon can do everything on nominations" ON "award_nominations" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon can do everything on settings" ON "app_settings" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon can do everything on fyb events" ON "fyb_week_events" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon can do everything on fyb gallery" ON "fyb_week_gallery" FOR ALL USING (true) WITH CHECK (true);
