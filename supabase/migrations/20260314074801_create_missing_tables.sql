-- Create missing tables for AdminDashboard

CREATE TABLE IF NOT EXISTS public.analytics_daily (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date date NOT NULL UNIQUE,
    page_views integer DEFAULT 0,
    unique_visitors integer DEFAULT 0,
    bounce_rate numeric DEFAULT 0,
    avg_session_duration integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address text,
    user_agent text,
    severity text DEFAULT 'INFO',
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sleep_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL,
    score integer DEFAULT 0,
    total_duration integer DEFAULT 0,
    deep_ratio numeric DEFAULT 0,
    rem_ratio numeric DEFAULT 0,
    efficiency numeric DEFAULT 0,
    heart_rate_data jsonb DEFAULT '{}'::jsonb,
    stages jsonb DEFAULT '[]'::jsonb,
    ai_insights jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email text,
    type text NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'open',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.error_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    error_message text NOT NULL,
    error_stack text,
    context text,
    severity text DEFAULT 'ERROR',
    details jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.communications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    subject text,
    body text NOT NULL,
    type text DEFAULT 'email',
    status text DEFAULT 'sent',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    is_published boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for Admin access
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['analytics_daily', 'security_events', 'sleep_records', 'feedback', 'error_logs', 'communications', 'reviews'])
    LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS "Admin full access" ON public.%I;
            CREATE POLICY "Admin full access" ON public.%I
            FOR ALL TO authenticated
            USING (public.is_admin_check(auth.uid()));
        ', t, t);
    END LOOP;
END $$;

-- Allow users to insert error logs
DROP POLICY IF EXISTS "Users can insert error logs" ON public.error_logs;
CREATE POLICY "Users can insert error logs" ON public.error_logs
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow users to insert feedback
DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback;
CREATE POLICY "Users can insert feedback" ON public.feedback
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow users to read their own sleep records
DROP POLICY IF EXISTS "Users can read own sleep records" ON public.sleep_records;
CREATE POLICY "Users can read own sleep records" ON public.sleep_records
FOR SELECT TO authenticated
USING (user_id = auth.uid());
