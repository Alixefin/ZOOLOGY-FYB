
-- This is the complete schema for your application's database.
-- It includes tables for students and application settings,
-- as well as all necessary row-level security policies.
-- To set up or reset your database, run this entire script in your Supabase SQL Editor.

-- 1. Create Tables
-- -----------------

-- Create the students table
create table students (
  id uuid primary key,
  name text not null,
  nickname text,
  birthday text not null,
  relationship_status text not null,
  state_of_origin text not null,
  lga text not null,
  favourite_course text not null,
  favourite_lecturer text not null,
  favourite_coursemates text[] not null default '{}'::text[],
  hobbies text[] not null default '{}'::text[],
  posts_held text not null,
  best_level text not null,
  worst_level text not null,
  class_rep_quote text not null,
  parting_words text not null,
  image_src text,
  flyer_image_src text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create the app_settings table
create table app_settings (
  id bigint primary key,
  logos jsonb,
  fyb_week_settings jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);


-- 2. Enable Row Level Security (RLS)
-- -----------------------------------
-- RLS is on by default for new tables, but this ensures it is enabled.

alter table students enable row level security;
alter table app_settings enable row level security;


-- 3. Create Row Level Security Policies
-- ---------------------------------------

-- Policies for 'students' table
-- Allow anyone to read all student data
drop policy if exists "Allow public read access to students" on public.students;
create policy "Allow public read access to students" on public.students
  for select using (true);

-- Allow anyone to insert, update, or delete student data.
-- This is permissive to match the app's client-side PIN protection model.
drop policy if exists "Allow public write access to students" on public.students;
create policy "Allow public write access to students" on public.students
  for all using (true) with check (true);


-- Policies for 'app_settings' table
-- Allow anyone to read the application settings
drop policy if exists "Allow public read access to app settings" on public.app_settings;
create policy "Allow public read access to app settings" on public.app_settings
  for select using (true);

-- Allow anyone to insert or update the application settings.
-- This is permissive to match the app's client-side PIN protection model.
drop policy if exists "Allow public write access to app settings" on public.app_settings;
create policy "Allow public write access to app settings" on public.app_settings
  for all using (true) with check (true);


-- 4. Supabase Storage Policies
-- ------------------------------
-- These policies control access to your 'app-public-assets' storage bucket.

-- Allow anyone to view images in the bucket.
drop policy if exists "Allow public read access to assets" on storage.objects;
create policy "Allow public read access to assets" on storage.objects
  for select using ( bucket_id = 'app-public-assets' );

-- Allow anyone to upload, update, and delete images.
-- This is permissive to match the app's client-side PIN protection model.
drop policy if exists "Allow public write access to assets" on storage.objects;
create policy "Allow public write access to assets" on storage.objects
  for all using ( bucket_id = 'app-public-assets' ) with check ( bucket_id = 'app-public-assets' );
