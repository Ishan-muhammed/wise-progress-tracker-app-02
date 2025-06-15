
-- Update RLS policies for lessons table to allow admins to see all lessons
DROP POLICY IF EXISTS "Users can view their own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can view all lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users can manage their own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage all lessons" ON public.lessons;

-- Create new policies that properly handle admin access
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

-- Also ensure the get_current_user_role function works correctly with the user_roles table
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role::TEXT 
    FROM public.user_roles 
    WHERE user_id = auth.uid()
    ORDER BY 
      CASE 
        WHEN role = 'admin' THEN 1
        WHEN role = 'teacher' THEN 2
        ELSE 3
      END
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
