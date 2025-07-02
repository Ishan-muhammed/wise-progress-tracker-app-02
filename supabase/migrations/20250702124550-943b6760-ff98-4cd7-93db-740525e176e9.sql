-- Add academic_year column to syllabus table
ALTER TABLE public.syllabus 
ADD COLUMN academic_year TEXT NOT NULL DEFAULT '2025/26';

-- Drop the existing unique constraint
ALTER TABLE public.syllabus 
DROP CONSTRAINT IF EXISTS syllabus_subject_class_key;

-- Create new unique constraint that includes academic_year
ALTER TABLE public.syllabus 
ADD CONSTRAINT syllabus_subject_class_academic_year_key 
UNIQUE (subject, class, academic_year);

-- Update existing records to use current academic year (2025/26)
UPDATE public.syllabus 
SET academic_year = '2025/26' 
WHERE academic_year = '2025/26';