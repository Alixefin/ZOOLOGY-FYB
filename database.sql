
-- Drop old tables and functions if they exist to ensure a clean slate
DROP FUNCTION IF EXISTS "increment_vote"(uuid);
DROP TABLE IF EXISTS "award_nominations" CASCADE;
DROP TABLE IF EXISTS "awards" CASCADE;
DROP TABLE IF EXISTS "students" CASCADE;
DROP TABLE IF EXISTS "app_settings" CASCADE;


-- Create students table
CREATE TABLE "students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "best_level" TEXT,
    "worst_level" TEXT,
    "favourite_lecturer" TEXT,
    "relationship_status" TEXT,
    "alternative_career" TEXT,
    "best_experience" TEXT,
    "worst_experience" TEXT,
    "will_miss" TEXT,
    "image_src" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create app_settings table
CREATE TABLE "app_settings" (
    "id" INT PRIMARY KEY,
    "logos" JSONB,
    "voting_settings" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create awards table
CREATE TABLE "awards" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create award_nominations table
CREATE TABLE "award_nominations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "award_id" UUID NOT NULL REFERENCES "awards"(id) ON DELETE CASCADE,
    "student_id" TEXT NOT NULL REFERENCES "students"(id) ON DELETE CASCADE,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("award_id", "student_id") -- a student can only be nominated once per award
);

-- Enable RLS
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "awards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "award_nominations" ENABLE ROW LEVEL SECURITY;

-- Policies for students
CREATE POLICY "Allow public read access to students" ON "students" FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to students" ON "students" FOR ALL USING (true) WITH CHECK (true);

-- Policies for app_settings
CREATE POLICY "Allow public read access to app settings" ON "app_settings" FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to app settings" ON "app_settings" FOR ALL USING (true) WITH CHECK (true);

-- Policies for awards
CREATE POLICY "Allow public read access to awards" ON "awards" FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to awards" ON "awards" FOR ALL USING (true) WITH CHECK (true);

-- Policies for award_nominations
CREATE POLICY "Allow public read access to nominations" ON "award_nominations" FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to nominations" ON "award_nominations" FOR ALL USING (true) WITH CHECK (true);
-- Allow authenticated users (i.e., via the anon key) to update votes via the RPC function
CREATE POLICY "Allow vote increment" ON "award_nominations" FOR UPDATE USING (true) WITH CHECK(true);


-- Function to increment votes safely
CREATE OR REPLACE FUNCTION increment_vote(nomination_id_in uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.award_nominations
  SET votes = votes + 1
  WHERE id = nomination_id_in;
END;
$$ LANGUAGE plpgsql;

-- Grant usage on the function to the public role so it can be called via the API
GRANT EXECUTE ON FUNCTION increment_vote(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_vote(uuid) TO service_role;
