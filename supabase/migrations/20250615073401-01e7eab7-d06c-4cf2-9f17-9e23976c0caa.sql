
-- Add the role column to the user_roles table
ALTER TABLE public.user_roles ADD COLUMN role public.app_role NOT NULL DEFAULT 'teacher';

-- Create a unique constraint to prevent duplicate role assignments
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role);
