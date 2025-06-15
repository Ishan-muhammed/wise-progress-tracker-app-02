
-- Enable RLS on all tables if not already enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own subjects" ON public.user_subjects;
DROP POLICY IF EXISTS "Users can manage their own subjects" ON public.user_subjects;
DROP POLICY IF EXISTS "Anyone can view subjects" ON public.subjects;

-- Create RLS policies
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own roles" 
  ON public.user_roles 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own subjects" 
  ON public.user_subjects 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subjects" 
  ON public.user_subjects 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view subjects" 
  ON public.subjects 
  FOR SELECT 
  TO public 
  USING (true);

-- Add unique constraint to prevent duplicate user-subject relationships
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_subjects_user_id_subject_id_key'
    ) THEN
        ALTER TABLE public.user_subjects ADD CONSTRAINT user_subjects_user_id_subject_id_key UNIQUE (user_id, subject_id);
    END IF;
END $$;

-- Completely rewrite the handle_new_user function with better error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  current_subject_name TEXT;
  found_subject_id UUID;
  subjects_list TEXT[];
  selected_role TEXT;
BEGIN
  -- Log the start of user creation
  RAISE LOG 'Starting handle_new_user for user: %', NEW.id;
  
  -- Get and validate the role
  selected_role := COALESCE(NEW.raw_user_meta_data->>'role', 'teacher');
  IF selected_role NOT IN ('teacher', 'admin') THEN
    selected_role := 'teacher';
  END IF;
  
  RAISE LOG 'Creating user with role: %', selected_role;
  
  -- Step 1: Insert the user profile
  BEGIN
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
    RAISE LOG 'Successfully created profile for user: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RAISE;
  END;
  
  -- Step 2: Insert the user role
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, selected_role::public.app_role);
    RAISE LOG 'Successfully assigned role % to user: %', selected_role, NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error assigning role to user %: %', NEW.id, SQLERRM;
    RAISE;
  END;
  
  -- Step 3: Handle subjects if provided
  IF NEW.raw_user_meta_data ? 'subjects' THEN
    BEGIN
      subjects_list := ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'subjects'));
      RAISE LOG 'Processing % subjects for user: %', array_length(subjects_list, 1), NEW.id;
      
      -- Process each subject
      FOREACH current_subject_name IN ARRAY subjects_list LOOP
        -- Find the subject ID using explicit table alias
        SELECT subjects_table.id INTO found_subject_id 
        FROM public.subjects AS subjects_table 
        WHERE LOWER(subjects_table.name) = LOWER(current_subject_name);
        
        -- Insert user-subject relationship if subject exists
        IF found_subject_id IS NOT NULL THEN
          BEGIN
            INSERT INTO public.user_subjects (user_id, subject_id)
            VALUES (NEW.id, found_subject_id)
            ON CONFLICT (user_id, subject_id) DO NOTHING;
            RAISE LOG 'Successfully linked subject % to user: %', current_subject_name, NEW.id;
          EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Error linking subject % to user %: %', current_subject_name, NEW.id, SQLERRM;
            -- Don't raise here, continue with other subjects
          END;
        ELSE
          RAISE LOG 'Subject not found: %', current_subject_name;
        END IF;
      END LOOP;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error processing subjects for user %: %', NEW.id, SQLERRM;
      -- Don't raise here, user creation should still succeed
    END;
  END IF;
  
  RAISE LOG 'Successfully completed handle_new_user for user: %', NEW.id;
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Critical error in handle_new_user for user %: %', NEW.id, SQLERRM;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
