
-- Let's recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  subject_name TEXT;
  subject_id UUID;
  subjects_array TEXT[];
  user_role TEXT;
BEGIN
  -- Get the role from metadata, default to 'teacher'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'teacher');
  
  -- Insert profile (without role column)
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
  VALUES (
    NEW.id,
    user_role::app_role
  );
  
  -- Handle subjects if provided
  IF NEW.raw_user_meta_data ? 'subjects' THEN
    subjects_array := ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'subjects'));
    
    -- Insert each subject
    FOREACH subject_name IN ARRAY subjects_array LOOP
      -- Get subject ID by name
      SELECT id INTO subject_id 
      FROM public.subjects 
      WHERE name = subject_name;
      
      -- Insert user-subject relationship if subject exists
      IF subject_id IS NOT NULL THEN
        INSERT INTO public.user_subjects (user_id, subject_id)
        VALUES (NEW.id, subject_id)
        ON CONFLICT (user_id, subject_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
