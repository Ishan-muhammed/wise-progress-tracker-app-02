
-- Create subjects table with the 6 Islamic studies subjects
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_subjects table for many-to-many relationship
CREATE TABLE public.user_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, subject_id)
);

-- Enable Row Level Security
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;

-- Create policies for subjects table (public read access)
CREATE POLICY "Anyone can view subjects" 
  ON public.subjects 
  FOR SELECT 
  TO public 
  USING (true);

-- Create policies for user_subjects table
CREATE POLICY "Users can view their own subjects" 
  ON public.user_subjects 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subjects" 
  ON public.user_subjects 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Insert the 6 Islamic studies subjects
INSERT INTO public.subjects (name, description) VALUES
  ('Aqeedah', 'Islamic theology and beliefs'),
  ('Quran', 'Quranic studies and recitation'),
  ('Hadith', 'Prophetic traditions and sayings'),
  ('Tajweed', 'Rules of Quranic recitation'),
  ('Fiqh', 'Islamic jurisprudence and law'),
  ('Arabic', 'Arabic language and grammar');

-- Update the handle_new_user function to handle multiple subjects
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  subject_name TEXT;
  subject_id UUID;
  subjects_array TEXT[];
BEGIN
  -- Insert profile
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
  
  -- Insert default role (teacher if not specified)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')::app_role
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
