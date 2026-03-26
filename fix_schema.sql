-- Fix missing columns in analytics_device
ALTER TABLE public.analytics_device ADD COLUMN IF NOT EXISTS device_type text DEFAULT 'desktop';
ALTER TABLE public.analytics_device ADD COLUMN IF NOT EXISTS browser text;
ALTER TABLE public.analytics_device ADD COLUMN IF NOT EXISTS os text;

-- Try to add unique constraint (will fail gracefully if it already exists or if there are duplicates, but we need it for ON CONFLICT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'analytics_device_device_type_browser_os_key'
    ) THEN
        ALTER TABLE public.analytics_device ADD CONSTRAINT analytics_device_device_type_browser_os_key UNIQUE (device_type, browser, os);
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add unique constraint to analytics_device: %', SQLERRM;
END $$;

-- Fix missing columns in analytics_country
ALTER TABLE public.analytics_country ADD COLUMN IF NOT EXISTS country_code text DEFAULT 'US';
ALTER TABLE public.analytics_country ADD COLUMN IF NOT EXISTS country_name text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'analytics_country_country_code_key'
    ) THEN
        ALTER TABLE public.analytics_country ADD CONSTRAINT analytics_country_country_code_key UNIQUE (country_code);
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add unique constraint to analytics_country: %', SQLERRM;
END $$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS block_code text;

-- Fix missing columns in user_app_status
CREATE TABLE IF NOT EXISTS public.user_app_status (
    user_id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    last_seen timestamptz DEFAULT now(),
    is_online boolean DEFAULT true,
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_app_status ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT true;
ALTER TABLE public.user_app_status ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT now();
ALTER TABLE public.user_app_status ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.user_app_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage user_app_status" ON public.user_app_status;
CREATE POLICY "Admin manage user_app_status" ON public.user_app_status FOR ALL TO authenticated USING (public.is_admin_check(auth.uid()));

DROP POLICY IF EXISTS "Users view own user_app_status" ON public.user_app_status;
CREATE POLICY "Users view own user_app_status" ON public.user_app_status FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert/update own user_app_status" ON public.user_app_status;
CREATE POLICY "Users insert/update own user_app_status" ON public.user_app_status FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Ensure the RPCs exist and are correct
CREATE OR REPLACE FUNCTION public.increment_device_analytics(d_type text, browser_info text, os_info text)
RETURNS void AS $$
BEGIN
    INSERT INTO public.analytics_device (device_type, browser, os, visitor_count)
    VALUES (d_type, browser_info, os_info, 1)
    ON CONFLICT (device_type, browser, os) DO UPDATE 
    SET visitor_count = analytics_device.visitor_count + 1,
        last_updated = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_country_analytics(c_code text, c_name text)
RETURNS void AS $$
BEGIN
    INSERT INTO public.analytics_country (country_code, country_name, visitor_count)
    VALUES (c_code, c_name, 1)
    ON CONFLICT (country_code) DO UPDATE 
    SET visitor_count = analytics_country.visitor_count + 1,
        last_updated = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reload schema cache so the frontend can see the new columns immediately
NOTIFY pgrst, 'reload schema';
