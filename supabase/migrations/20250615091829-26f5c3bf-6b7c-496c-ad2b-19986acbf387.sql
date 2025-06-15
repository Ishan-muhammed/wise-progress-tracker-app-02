
-- Create lessons table to store lesson submissions
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class TEXT NOT NULL,
  subject TEXT NOT NULL,
  lesson_number TEXT NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  assessment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Teachers can view their own lessons
CREATE POLICY "Teachers can view their own lessons" 
  ON public.lessons 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Teachers can create their own lessons
CREATE POLICY "Teachers can create their own lessons" 
  ON public.lessons 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Teachers can update their own lessons
CREATE POLICY "Teachers can update their own lessons" 
  ON public.lessons 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Teachers can delete their own lessons
CREATE POLICY "Teachers can delete their own lessons" 
  ON public.lessons 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Admins can view all lessons
CREATE POLICY "Admins can view all lessons" 
  ON public.lessons 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_lessons_user_id ON public.lessons(user_id);
CREATE INDEX idx_lessons_date ON public.lessons(date);
CREATE INDEX idx_lessons_class_subject ON public.lessons(class, subject);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_lessons_updated_at 
    BEFORE UPDATE ON public.lessons 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
