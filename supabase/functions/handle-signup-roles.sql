
-- This function will be called after user signup to handle multiple roles
CREATE OR REPLACE FUNCTION public.handle_signup_roles()
RETURNS TRIGGER AS $$
DECLARE
  role_item TEXT;
  roles_array TEXT[];
BEGIN
  -- Check if roles array exists in metadata
  IF NEW.raw_user_meta_data ? 'roles' THEN
    roles_array := ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'roles'));
    
    -- Insert each role (skipping the first one as it's handled by the main trigger)
    FOR i IN 2..array_length(roles_array, 1) LOOP
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, roles_array[i]::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
