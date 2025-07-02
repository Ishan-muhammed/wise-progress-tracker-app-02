-- Add status fields to profiles table for teacher management
ALTER TABLE public.profiles 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN archived_by UUID REFERENCES public.profiles(id),
ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for better performance on status filtering
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_last_active ON public.profiles(last_active_at);

-- Create function to update last_active_at when teachers create/update lessons
CREATE OR REPLACE FUNCTION public.update_teacher_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_active_at for the teacher when they create or update a lesson
  UPDATE public.profiles 
  SET last_active_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update teacher activity
CREATE TRIGGER trigger_update_teacher_activity
  AFTER INSERT OR UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_teacher_activity();

-- Update existing teachers' last_active_at based on their most recent lesson
UPDATE public.profiles 
SET last_active_at = (
  SELECT MAX(lessons.updated_at)
  FROM public.lessons 
  WHERE lessons.user_id = profiles.id
)
WHERE EXISTS (
  SELECT 1 FROM public.lessons WHERE lessons.user_id = profiles.id
);

-- Create function for admins to archive teachers
CREATE OR REPLACE FUNCTION public.archive_teacher(
  teacher_id UUID,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requesting_user_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Get the requesting user's ID
  requesting_user_id := auth.uid();
  
  -- Check if the requesting user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = requesting_user_id 
    AND role = 'admin'
  ) INTO is_admin;
  
  -- Only proceed if user is admin
  IF is_admin THEN
    -- Archive the teacher
    UPDATE public.profiles 
    SET 
      status = 'archived',
      archived_at = now(),
      archived_by = requesting_user_id
    WHERE id = teacher_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Create function to restore archived teachers
CREATE OR REPLACE FUNCTION public.restore_teacher(teacher_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requesting_user_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Get the requesting user's ID
  requesting_user_id := auth.uid();
  
  -- Check if the requesting user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = requesting_user_id 
    AND role = 'admin'
  ) INTO is_admin;
  
  -- Only proceed if user is admin
  IF is_admin THEN
    -- Restore the teacher
    UPDATE public.profiles 
    SET 
      status = 'active',
      archived_at = NULL,
      archived_by = NULL
    WHERE id = teacher_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;