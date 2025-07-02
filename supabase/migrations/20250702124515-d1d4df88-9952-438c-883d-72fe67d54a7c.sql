-- Add academic_year column to syllabus table
ALTER TABLE public.syllabus 
ADD COLUMN academic_year TEXT NOT NULL DEFAULT '2025/26';

-- Drop the existing unique constraint
DROP INDEX IF EXISTS syllabus_subject_class_key;

-- Create new unique constraint that includes academic_year
CREATE UNIQUE INDEX syllabus_subject_class_academic_year_key 
ON public.syllabus (subject, class, academic_year);

-- Update existing records to use current academic year (2025/26)
UPDATE public.syllabus 
SET academic_year = '2025/26' 
WHERE academic_year = '2025/26';