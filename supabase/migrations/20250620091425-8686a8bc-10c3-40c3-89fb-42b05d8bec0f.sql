
-- Create syllabus table to manage subject lesson totals per class
CREATE TABLE public.syllabus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  class TEXT NOT NULL,
  total_lessons INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(subject, class)
);

-- Enable RLS for syllabus table
ALTER TABLE public.syllabus ENABLE ROW LEVEL SECURITY;

-- Create policies for admin-only access to syllabus
CREATE POLICY "Admins can view syllabus" ON public.syllabus
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert syllabus" ON public.syllabus
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update syllabus" ON public.syllabus
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete syllabus" ON public.syllabus
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_syllabus_updated_at
  BEFORE UPDATE ON public.syllabus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Pre-populate syllabus with current subjects for classes 8-12
INSERT INTO public.syllabus (subject, class, total_lessons) VALUES
  ('Aqeedah', '8', 20),
  ('Quran', '8', 20),
  ('Hadith', '8', 20),
  ('Tajweed', '8', 20),
  ('Fiqh', '8', 20),
  ('Arabic', '8', 20),
  ('Aqeedah', '9', 20),
  ('Quran', '9', 20),
  ('Hadith', '9', 20),
  ('Tajweed', '9', 20),
  ('Fiqh', '9', 20),
  ('Arabic', '9', 20),
  ('Aqeedah', '10', 20),
  ('Quran', '10', 20),
  ('Hadith', '10', 20),
  ('Tajweed', '10', 20),
  ('Fiqh', '10', 20),
  ('Arabic', '10', 20),
  ('Aqeedah', '11', 20),
  ('Quran', '11', 20),
  ('Hadith', '11', 20),
  ('Tajweed', '11', 20),
  ('Fiqh', '11', 20),
  ('Arabic', '11', 20),
  ('Aqeedah', '12', 20),
  ('Quran', '12', 20),
  ('Hadith', '12', 20),
  ('Tajweed', '12', 20),
  ('Fiqh', '12', 20),
  ('Arabic', '12', 20);
