
-- Main App Settings Table
-- Stores singleton settings like logos and FYB Week content.
create table
  public.app_settings (
    id bigint not null,
    logos jsonb null,
    fyb_week_settings jsonb null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint app_settings_pkey primary key (id)
  ) tablespace pg_default;

-- Seed the singleton row for app_settings
insert into public.app_settings(id, logos, fyb_week_settings)
values (1, '{}', '{}')
on conflict (id) do nothing;

-- Students Table
-- Stores all student profile information.
create table
  public.students (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    name text not null,
    nickname text null,
    birthday text null,
    relationship_status text null,
    state_of_origin text null,
    lga text null,
    favourite_course text null,
    favourite_lecturer text null,
    favourite_coursemates text[] null,
    hobbies text[] null,
    posts_held text null,
    -- Ensure these columns exist and are named correctly
    best_level text null,
    worst_level text null,
    class_rep_quote text null,
    parting_words text null,
    image_src text null,
    flyer_image_src text null,
    constraint students_pkey primary key (id)
  ) tablespace pg_default;

----------------------------------------------------
--- Row-Level Security (RLS) Policies for Tables ---
----------------------------------------------------

-- Grant all actions on app_settings as it's for the admin panel
alter table public.app_settings enable row level security;
create policy "Allow full access to app settings" on public.app_settings for all using (true) with check (true);

-- Grant all actions on students as it's for the admin panel
alter table public.students enable row level security;
create policy "Allow full access to students" on public.students for all using (true) with check (true);


-----------------------------------------------
--- Supabase Storage and Assets Policies    ---
-----------------------------------------------

-- Policies for 'app-public-assets' bucket
-- Allow public read access to all files
create policy "Public read access for all assets" on storage.objects for select using (bucket_id = 'app-public-assets');

-- Allow authenticated users to upload, update, and delete files
create policy "Allow inserts for authenticated users" on storage.objects for insert with check (auth.role() = 'anon');
create policy "Allow updates for authenticated users" on storage.objects for update using (auth.role() = 'anon');
create policy "Allow deletes for authenticated users" on storage.objects for delete using (auth.role() = 'anon');
