
-- ==========================================
-- AUDIT & LOGGING INFRASTRUCTURE
-- ==========================================

-- 1. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action text NOT NULL,
    details text,
    level text DEFAULT 'INFO', -- 'INFO', 'WARNING', 'CRITICAL'
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp timestamptz DEFAULT now()
);

-- 2. Security Events Table
CREATE TABLE IF NOT EXISTS public.security_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email text,
    event_type text NOT NULL,
    details text,
    created_at timestamptz DEFAULT now()
);

-- RLS Configuration
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Admins/Owners can view everything
CREATE POLICY "Admins can view audit logs" ON public.audit_logs 
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

CREATE POLICY "Admins can view security logs" ON public.security_events 
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

-- 3. Logging RPCs (SECURITY DEFINER to bypass RLS for writing)
-- This allows the app to log "Login Failed" or "Session Established" even before the user session is fully ready.

CREATE OR REPLACE FUNCTION public.log_security_event(email text, event_type text, details text)
RETURNS void AS $$
BEGIN
    INSERT INTO public.security_events (user_email, event_type, details)
    VALUES (email, event_type, details);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_audit_entry(p_action text, p_details text, p_level text, p_user_id uuid DEFAULT NULL)
RETURNS void AS $$
BEGIN
    INSERT INTO public.audit_logs (action, details, level, user_id)
    VALUES (p_action, p_details, p_level, p_user_id);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
