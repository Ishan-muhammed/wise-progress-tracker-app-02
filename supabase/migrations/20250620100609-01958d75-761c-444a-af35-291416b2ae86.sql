
-- Create a table to store which classes each teacher is assigned to
CREATE TABLE public.user_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, class)
);

-- Enable Row Level Security
ALTER TABLE public.user_classes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own classes" 
  ON public.user_classes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own classes" 
  ON public.user_classes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classes" 
  ON public.user_classes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classes" 
  ON public.user_classes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow admins to view all user classes
CREATE POLICY "Admins can view all user classes" 
  ON public.user_classes 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create index for better performance
CREATE INDEX idx_user_classes_user_id ON public.user_classes(user_id);
CREATE INDEX idx_user_classes_class ON public.user_classes(class);
