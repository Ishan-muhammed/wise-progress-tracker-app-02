
-- Add RLS policies for user_roles table to allow users to read their own roles
-- This is critical for the authentication flow to work properly

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to manage their own roles (for admin functionality)
CREATE POLICY "Users can manage their own roles" 
  ON public.user_roles 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Also allow admins to view all roles
CREATE POLICY "Admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');
