-- This is a NON-DESTRUCTIVE script. It will not delete your existing data.
-- It fixes the relationship between the 'award_nominations' and 'students' tables.

-- First, we safely remove the old, potentially incorrect foreign key constraint if it exists.
-- This prevents errors if the script is run more than once.
ALTER TABLE public.award_nominations
DROP CONSTRAINT IF EXISTS award_nominations_student_id_fkey;

-- Next, we add the correct foreign key constraint.
-- This tells Supabase that 'award_nominations.student_id' refers to a record in the 'students' table.
-- This will fix the query error in the application.
ALTER TABLE public.award_nominations
ADD CONSTRAINT award_nominations_student_id_fkey
FOREIGN KEY (student_id) REFERENCES public.students (id) ON DELETE CASCADE;

-- This enables the new relationship to be used in queries.
NOTIFY pgrst, 'reload schema';
