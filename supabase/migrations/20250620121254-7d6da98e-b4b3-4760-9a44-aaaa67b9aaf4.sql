
-- Add RLS policy to allow admins to delete user accounts
CREATE POLICY "Admins can delete user profiles" 
ON public.profiles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Add RLS policy to allow users to delete their own profiles
CREATE POLICY "Users can delete their own profiles" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Ensure cascade deletes are properly set up for user_roles
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure cascade deletes are properly set up for user_subjects
ALTER TABLE public.user_subjects DROP CONSTRAINT IF EXISTS user_subjects_user_id_fkey;
ALTER TABLE public.user_subjects ADD CONSTRAINT user_subjects_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure cascade deletes are properly set up for lessons
ALTER TABLE public.lessons DROP CONSTRAINT IF EXISTS lessons_user_id_fkey;
ALTER TABLE public.lessons ADD CONSTRAINT lessons_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create a function to handle admin user deletion
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  
  -- Only proceed if user is admin and not trying to delete themselves
  IF is_admin AND requesting_user_id != target_user_id THEN
    -- Delete from auth.users (this will cascade to all related tables)
    DELETE FROM auth.users WHERE id = target_user_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;
