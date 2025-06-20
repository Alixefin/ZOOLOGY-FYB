
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to automatically update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  nickname TEXT,
  birthday TEXT, -- e.g., "MM/DD/YYYY"
  relationship_status TEXT,
  state_of_origin TEXT,
  lga TEXT,
  favourite_course TEXT,
  favourite_lecturer TEXT,
  favourite_coursemates TEXT[], -- Array of strings
  hobbies TEXT[], -- Array of strings
  posts_held TEXT,
  best_level TEXT,
  worst_level TEXT,
  class_rep_quote TEXT,
  parting_words TEXT,
  image_url TEXT, -- URL to student's profile image
  flyer_image_url TEXT, -- URL to student's FYB flyer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for students updated_at
CREATE TRIGGER set_students_timestamp
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- App Settings Table (for logos, FYB week content - singleton pattern)
CREATE TABLE IF NOT EXISTS app_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Ensures only one row
  association_logo_url TEXT,
  school_logo_url TEXT,
  fyb_week_is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  fyb_week_title TEXT NOT NULL DEFAULT 'FYB Week Extravaganza!',
  fyb_week_schedule TEXT NOT NULL DEFAULT 'Detailed schedule coming soon...',
  fyb_week_activities TEXT NOT NULL DEFAULT 'Exciting activities lineup to be announced!',
  fyb_week_event_images JSONB DEFAULT '[]'::jsonb, -- Array of {id, src, name}
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for app_settings updated_at
CREATE TRIGGER set_app_settings_timestamp
BEFORE UPDATE ON app_settings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Insert initial default app_settings row if it doesn't exist
INSERT INTO app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;


-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table
CREATE POLICY "Allow public read access to students"
  ON students FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert students"
  ON students FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update students"
  ON students FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete students"
  ON students FOR DELETE
  USING (auth.role() = 'authenticated');

-- RLS Policies for app_settings table
CREATE POLICY "Allow public read access to app_settings"
  ON app_settings FOR SELECT
  USING (true);

-- Assuming the settings row (id=1) is created once (e.g., via seed or above insert)
-- Admins should only update this single row.
CREATE POLICY "Allow authenticated users to update app_settings"
  ON app_settings FOR UPDATE
  USING (auth.role() = 'authenticated' AND id = 1)
  WITH CHECK (auth.role() = 'authenticated' AND id = 1);

-- Optionally, if you need to allow an authenticated user to insert the initial settings row if it's missing:
-- CREATE POLICY "Allow authenticated users to insert initial app_settings"
--  ON app_settings FOR INSERT
--  WITH CHECK (auth.role() = 'authenticated' AND id = 1);
-- (Note: The INSERT ... ON CONFLICT above generally handles initial row creation better)

