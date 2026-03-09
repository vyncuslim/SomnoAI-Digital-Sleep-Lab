-- ==========================================
-- DIGITAL SLEEP LAB SCHEMA UPDATE (V1.3.0)
-- ==========================================

-- 1. Add missing columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS block_code text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS last_login timestamptz,
ADD COLUMN IF NOT EXISTS is_paying boolean DEFAULT false;

-- 2. Create security_events table
CREATE TABLE IF NOT EXISTS public.security_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    type text NOT NULL,
    details text,
    ip_address text,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS on security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Admin can view security events
DROP POLICY IF EXISTS "Admin view security events" ON public.security_events;
CREATE POLICY "Admin view security events" ON public.security_events
FOR SELECT TO authenticated
USING (public.is_admin_check(auth.uid()));

-- Anyone can insert security events (for logging purposes)
DROP POLICY IF EXISTS "Anyone can insert security events" ON public.security_events;
CREATE POLICY "Anyone can insert security events" ON public.security_events
FOR INSERT TO authenticated, anon
WITH CHECK (true);

-- 4. Update report_failed_login to log to security_events
CREATE OR REPLACE FUNCTION public.report_failed_login(target_email text)
RETURNS void AS $$
DECLARE
  current_attempts int;
  uid uuid;
BEGIN
  -- Get user ID if exists
  SELECT id INTO uid FROM public.profiles WHERE email = target_email;

  INSERT INTO public.login_attempts (email, attempts, last_attempt)
  VALUES (target_email, 1, now())
  ON CONFLICT (email) DO UPDATE 
  SET attempts = public.login_attempts.attempts + 1,
      last_attempt = now()
  RETURNING attempts INTO current_attempts;

  -- Log security event
  INSERT INTO public.security_events (user_id, type, details)
  VALUES (uid, 'FAILED_LOGIN', 'Failed login attempt for email: ' || target_email || '. Attempt count: ' || current_attempts);

  IF current_attempts >= 5 THEN
    UPDATE public.profiles SET is_blocked = true, failed_login_attempts = current_attempts WHERE email = target_email;
    
    -- Log block event
    INSERT INTO public.security_events (user_id, type, details)
    VALUES (uid, 'USER_BLOCKED', 'User blocked due to excessive failed login attempts.');
  ELSE
    UPDATE public.profiles SET failed_login_attempts = current_attempts WHERE email = target_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Helper for Founder Dashboard Analytics
CREATE OR REPLACE FUNCTION public.get_founder_stats()
RETURNS json AS $$
DECLARE
  total_users int;
  new_today int;
  active_users int;
  paying_users int;
  country_distribution json;
BEGIN
  SELECT count(*) INTO total_users FROM public.profiles;
  SELECT count(*) INTO new_today FROM public.profiles WHERE created_at >= now() - interval '24 hours';
  SELECT count(*) INTO active_users FROM public.profiles WHERE last_login >= now() - interval '30 days';
  SELECT count(*) INTO paying_users FROM public.profiles WHERE is_paying = true OR subscription_plan != 'free';
  
  SELECT json_object_agg(country, count) INTO country_distribution
  FROM (
    SELECT COALESCE(country, 'Unknown') as country, count(*) as count
    FROM public.profiles
    GROUP BY country
  ) t;

  RETURN json_build_object(
    'total_users', total_users,
    'new_today', new_today,
    'active_users', active_users,
    'paying_users', paying_users,
    'country_distribution', country_distribution
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
