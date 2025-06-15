
-- Create a security definer function to safely get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role::TEXT 
    FROM public.user_roles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create comprehensive RLS policies for profiles table
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy 2: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Policy 4: Admins can update all profiles
CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.get_current_user_role() = 'admin');

-- Also enable proper RLS on lessons table for admin access
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Drop existing lesson policies if they exist
DROP POLICY IF EXISTS "Users can view their own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can view all lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users can manage their own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage all lessons" ON public.lessons;

-- Create lesson policies
CREATE POLICY "Users can view their own lessons" 
  ON public.lessons 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all lessons" 
  ON public.lessons 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can manage their own lessons" 
  ON public.lessons 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all lessons" 
  ON public.lessons 
  FOR ALL 
  USING (public.get_current_user_role() = 'admin');
