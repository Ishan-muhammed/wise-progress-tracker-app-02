
-- Fix the database functions to be immutable/stable where appropriate
-- and address the search_path parameter security issues

-- 1. Fix the handle_new_user function to be more secure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  subject_name TEXT;
  subject_id UUID;
  subjects_array TEXT[];
  user_role TEXT;
BEGIN
  -- Set search_path for security
  SET search_path = public, auth;
  
  -- Get the role from metadata, default to 'teacher'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'teacher');
  
  -- Validate that the role is one of the allowed values
  IF user_role NOT IN ('teacher', 'admin') THEN
    user_role := 'teacher';
  END IF;
  
  -- Insert profile first
  INSERT INTO public.profiles (id, email, name, gender, age)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.raw_user_meta_data->>'gender',
    CASE 
      WHEN NEW.raw_user_meta_data->>'age' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'age')::INTEGER
      ELSE NULL
    END
  );
  
  -- Insert role with explicit casting
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role::public.app_role);
  
  -- Handle subjects if provided
  IF NEW.raw_user_meta_data ? 'subjects' THEN
    subjects_array := ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'subjects'));
    
    -- Insert each subject
    FOREACH subject_name IN ARRAY subjects_array LOOP
      -- Get subject ID by name with fully qualified reference
      SELECT s.id INTO subject_id 
      FROM public.subjects s 
      WHERE s.name = subject_name;
      
      -- Insert user-subject relationship if subject exists
      IF subject_id IS NOT NULL THEN
        INSERT INTO public.user_subjects (user_id, subject_id)
        VALUES (NEW.id, subject_id)
        ON CONFLICT (user_id, subject_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error for debugging
  RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. Fix the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. Update the get_current_user_role function with proper search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, auth;
