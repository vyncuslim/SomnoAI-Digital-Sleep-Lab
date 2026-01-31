
-- ==========================================
-- SECURITY LOGGING INFRASTRUCTURE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.security_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email text,
    event_type text NOT NULL, -- 'LOGIN_SUCCESS', 'LOGIN_FAIL', 'RATE_LIMIT', 'BLOCK_EVASION'
    details text,
    ip_metadata text, -- Sanitized/Anonymized info
    created_at timestamptz DEFAULT now()
);

-- RLS for Security Logs
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security logs" ON public.security_events 
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

-- Function to allow public logging of auth failures (internal use)
CREATE OR REPLACE FUNCTION public.log_security_event(email text, event_type text, details text)
RETURNS void AS $$
BEGIN
    INSERT INTO public.security_events (user_email, event_type, details)
    VALUES (email, event_type, details);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
