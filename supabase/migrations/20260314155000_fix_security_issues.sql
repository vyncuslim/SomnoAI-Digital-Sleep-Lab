-- Fix C-2: Prevent role escalation
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger AS $$
BEGIN
  -- Allow service role (auth.uid() is null) or admins to change roles
  IF auth.uid() IS NULL OR public.is_admin_check(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- For normal users, revert any changes to sensitive fields
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role = OLD.role;
  END IF;
  IF NEW.is_super_owner IS DISTINCT FROM OLD.is_super_owner THEN
    NEW.is_super_owner = OLD.is_super_owner;
  END IF;
  IF NEW.is_blocked IS DISTINCT FROM OLD.is_blocked THEN
    NEW.is_blocked = OLD.is_blocked;
  END IF;
  IF NEW.failed_login_attempts IS DISTINCT FROM OLD.failed_login_attempts THEN
    NEW.failed_login_attempts = OLD.failed_login_attempts;
  END IF;
  IF NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan THEN
    NEW.subscription_plan = OLD.subscription_plan;
  END IF;
  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
    NEW.subscription_status = OLD.subscription_status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_role_security ON public.profiles;
CREATE TRIGGER enforce_role_security
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- Fix C-1: Ensure RLS is enabled and policies are strict
-- We already have "Profiles visibility" in setup.sql, but let's make sure profiles can't be listed by normal users
DROP POLICY IF EXISTS "Profiles visibility" ON public.profiles;
CREATE POLICY "Profiles visibility" ON public.profiles
FOR SELECT TO authenticated
USING (
    (auth.uid() = id AND is_blocked = false)
    OR 
    public.is_admin_check(auth.uid())
);

-- Ensure audit_logs is strict
DROP POLICY IF EXISTS "Admin view logs" ON public.audit_logs;
CREATE POLICY "Admin view logs" ON public.audit_logs
FOR SELECT TO authenticated
USING (public.is_admin_check(auth.uid()));

-- Ensure security_events is strict
DROP POLICY IF EXISTS "Admin full access" ON public.security_events;
CREATE POLICY "Admin full access" ON public.security_events
FOR ALL TO authenticated
USING (public.is_admin_check(auth.uid()));
