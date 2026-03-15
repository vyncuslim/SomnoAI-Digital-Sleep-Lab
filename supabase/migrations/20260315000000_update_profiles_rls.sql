-- Create a function to check if a user is an admin or super owner
CREATE OR REPLACE FUNCTION public.is_admin_or_super_owner(uid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = uid 
    AND (role = 'admin' OR is_super_owner = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Profiles visibility policy
DROP POLICY IF EXISTS "Profiles visibility" ON public.profiles;
CREATE POLICY "Profiles visibility" ON public.profiles
FOR SELECT TO authenticated
USING (
    (auth.uid() = id AND is_blocked = false)
    OR 
    public.is_admin_or_super_owner(auth.uid())
);
