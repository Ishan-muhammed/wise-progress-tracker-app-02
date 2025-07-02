-- Remove inactive status from the system
-- First, update any existing inactive records to active (safety measure)
UPDATE public.profiles 
SET status = 'active' 
WHERE status = 'inactive';

-- Update the CHECK constraint to only allow 'active' and 'archived'
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('active', 'archived'));