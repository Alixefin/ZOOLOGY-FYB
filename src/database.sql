-- This script only resets the 'students' table.
-- It will remove all existing student data.

-- Drop the students table if it exists
DROP TABLE IF EXISTS "public"."students" CASCADE;

-- Re-create the Students Table
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "best_level" TEXT NOT NULL,
    "worst_level" TEXT NOT NULL,
    "favourite_lecturer" TEXT NOT NULL,
    "relationship_status" TEXT NOT NULL,
    "alternative_career" TEXT NOT NULL,
    "best_experience" TEXT NOT NULL,
    "worst_experience" TEXT NOT NULL,
    "will_miss" TEXT NOT NULL,
    "image_src" TEXT,
    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- Enable Row Level Security (RLS) for the new students table
ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for the new students table
-- Allow public read access
CREATE POLICY "Allow public read access on students" ON "public"."students" FOR SELECT USING (true);
-- Allow all actions for service_role (used by server-side operations)
CREATE POLICY "Allow all actions for service_role on students" ON "public"."students" FOR ALL USING (true) WITH CHECK (true);

-- Note: Other tables (awards, award_nominations, app_settings) and the storage bucket are not affected by this script.
-- If your foreign key from 'award_nominations' to 'students' was dropped by CASCADE, you may need to recreate it.
-- However, since nominations are likely tied to specific students, clearing the students table means associated nominations should also be cleared.
-- You will need to re-add students and then re-nominate them for awards.
