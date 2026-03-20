-- Remove phone column and related logic

-- 1. Update handle_new_user to not insert phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, provider, role, is_super_owner)
    VALUES (
        new.id, 
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        new.app_metadata->>'provider',
        CASE WHEN new.email = 'ongyuze1401@gmail.com' THEN 'owner' ELSE 'user' END,
        CASE WHEN new.email = 'ongyuze1401@gmail.com' THEN true ELSE false END
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update record_failed_login to not check phone
CREATE OR REPLACE FUNCTION public.record_failed_login(target_email text)
RETURNS void AS $$
DECLARE
  current_attempts int;
  v_is_blocked boolean;
BEGIN
  -- Handle empty input
  IF target_email IS NULL OR target_email = '' THEN
    RETURN;
  END IF;

  -- Check if user is already blocked
  SELECT is_blocked INTO v_is_blocked FROM public.profiles 
  WHERE email = target_email;
  
  IF v_is_blocked THEN
    RAISE EXCEPTION 'Security policy: Too many failed attempts. Please try again later.';
  END IF;

  INSERT INTO public.login_attempts (email, attempts, last_attempt)
  VALUES (target_email, 1, now())
  ON CONFLICT (email) DO UPDATE 
  SET attempts = public.login_attempts.attempts + 1,
      last_attempt = now()
  RETURNING attempts INTO current_attempts;

  -- Block if attempts >= 5
  IF current_attempts >= 5 THEN
    UPDATE public.profiles 
    SET is_blocked = true, 
        failed_login_attempts = current_attempts,
        block_code = 'BRUTE_FORCE_PROTECTION'
    WHERE email = target_email;
  ELSE
    UPDATE public.profiles 
    SET failed_login_attempts = current_attempts 
    WHERE email = target_email;
  END IF;
  
  -- Log to security_events
  INSERT INTO public.security_events (event_type, type, details, severity)
  VALUES ('FAILED_LOGIN', 'FAILED_LOGIN', jsonb_build_object('identifier', target_email, 'attempts', current_attempts), 'WARNING');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update get_user_by_email to not check phone
CREATE OR REPLACE FUNCTION public.get_user_by_email(target_email text)
RETURNS SETOF public.profiles AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.profiles WHERE email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Drop phone column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone;

-- 5. Make email NOT NULL again if it was removed
-- Note: We only do this if there are no existing rows with NULL email
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email IS NULL) THEN
    ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;
  END IF;
END $$;
