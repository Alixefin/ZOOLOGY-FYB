-- Drop tables in reverse order of creation to handle dependencies
DROP TABLE IF EXISTS "public"."award_nominations";
DROP TABLE IF EXISTS "public"."awards";
DROP TABLE IF EXISTS "public"."students";
DROP TABLE IF EXISTS "public"."fyb_week_events";
DROP TABLE IF EXISTS "public"."app_settings";

-- Create students table
CREATE TABLE "public"."students" (
    "id" text NOT NULL,
    "name" character varying NOT NULL,
    "nickname" character varying,
    "best_level" character varying,
    "worst_level" character varying,
    "favourite_lecturer" character varying,
    "relationship_status" character varying,
    "alternative_career" character varying,
    "best_experience" text,
    "worst_experience" text,
    "will_miss" text,
    "image_src" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "public"."students" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "public"."students" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on user_id" ON "public"."students" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for users based on user_id" ON "public"."students" FOR DELETE USING (true);

-- Create awards table
CREATE TABLE "public"."awards" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" character varying NOT NULL,
    "description" text,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "awards_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "public"."awards" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "public"."awards" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "public"."awards" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on user_id" ON "public"."awards" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for users based on user_id" ON "public"."awards" FOR DELETE USING (true);

-- Create award_nominations table
CREATE TABLE "public"."award_nominations" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "award_id" uuid NOT NULL,
    "student_id" text NOT NULL,
    "votes" integer NOT NULL DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "award_nominations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "award_nominations_award_id_fkey" FOREIGN KEY (award_id) REFERENCES awards(id) ON DELETE CASCADE,
    CONSTRAINT "award_nominations_student_id_fkey" FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT "award_nominations_award_id_student_id_key" UNIQUE ("award_id", "student_id")
);
ALTER TABLE "public"."award_nominations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "public"."award_nominations" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "public"."award_nominations" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on user_id" ON "public"."award_nominations" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for users based on user_id" ON "public"."award_nominations" FOR DELETE USING (true);

-- Create app_settings table
CREATE TABLE "public"."app_settings" (
    "id" integer NOT NULL,
    "logos" jsonb,
    "voting_settings" jsonb,
    "fyb_week_settings" jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "public"."app_settings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "public"."app_settings" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "public"."app_settings" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on user_id" ON "public"."app_settings" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for users based on user_id" ON "public"."app_settings" FOR DELETE USING (true);

-- Create fyb_week_events table
CREATE TABLE "public"."fyb_week_events" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "day_index" integer NOT NULL UNIQUE,
    "title" character varying NOT NULL,
    "description" text,
    "image_src" text,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "fyb_week_events_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "public"."fyb_week_events" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "public"."fyb_week_events" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "public"."fyb_week_events" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on user_id" ON "public"."fyb_week_events" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for users based on user_id" ON "public"."fyb_week_events" FOR DELETE USING (true);

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('app-public-assets', 'app-public-assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- Create the increment_vote function
CREATE OR REPLACE FUNCTION increment_vote(nomination_id_in uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.award_nominations
  SET votes = votes + 1
  WHERE id = nomination_id_in;
END;
$$ LANGUAGE plpgsql;

-- Create a single settings row if it doesn't exist
INSERT INTO "public"."app_settings" (id, logos, voting_settings, fyb_week_settings)
VALUES (1, '{"associationLogo": null, "schoolLogo": null, "roastBackground": null}', '{"isVotingActive": false}', '{"isFybWeekActive": false}')
ON CONFLICT (id) DO NOTHING;
