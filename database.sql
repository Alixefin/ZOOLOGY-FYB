-- Drop existing tables if they exist to ensure a clean slate.
DROP TABLE IF EXISTS "public"."students";
DROP TABLE IF EXISTS "public"."app_settings";

-- Create the app_settings table to store global application settings like logos.
CREATE TABLE "public"."app_settings" (
    "id" bigint NOT NULL,
    "logos" jsonb,
    "fyb_week_settings" jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create the students table with the new structure for student profiles.
CREATE TABLE "public"."students" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "nickname" text,
    "best_level" text,
    "worst_level" text,
    "favourite_lecturer" text,
    "relationship_status" text,
    "alternative_career" text,
    "best_experience" text,
    "worst_experience" text,
    "will_miss" text,
    "image_src" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Define the primary keys for the tables.
ALTER TABLE ONLY "public"."app_settings" ADD CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."students" ADD CONSTRAINT "students_pkey" PRIMARY KEY ("id");

-- Insert a default row into app_settings so that the app has a settings object to update.
INSERT INTO "public"."app_settings" ("id", "logos", "fyb_week_settings") VALUES
(1, '{"schoolLogo": null, "associationLogo": null}', '{"title": "Cyber Clan FYB Week Extravaganza!", "isUnlocked": false, "schedule": "Detailed schedule coming soon...", "activities": "Exciting activities lineup to be announced!", "eventImages": []}');

-- Enable Row Level Security (RLS) on both tables.
-- This is a crucial security step. All access will be denied by default unless a policy grants it.
ALTER TABLE "public"."app_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;

-- Create policies for the app_settings table.
-- This policy allows anyone to read the application settings.
CREATE POLICY "Public read access for app settings" ON "public"."app_settings"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- This policy allows the application (using the 'anon' key) to perform all operations.
CREATE POLICY "Allow all operations for anon users on app settings" ON "public"."app_settings"
AS PERMISSIVE FOR ALL
TO anon
WITH CHECK (true);

-- Create policies for the students table.
-- This policy allows anyone to read the student profiles.
CREATE POLICY "Public read access for students" ON "public"."students"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- This policy allows the application (using the 'anon' key) to perform all operations.
CREATE POLICY "Allow all operations for anon users on students" ON "public"."students"
AS PERMISSIVE FOR ALL
TO anon
WITH CHECK (true);
