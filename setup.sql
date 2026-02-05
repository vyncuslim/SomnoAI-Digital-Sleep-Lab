-- ==========================================
-- SOMNO LAB CORE SCHEMA (V10.5)
-- ==========================================

-- 1. Profiles Table (Extended with 'editor' role)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text,
    role text DEFAULT 'user' NOT NULL,
    is_super_owner boolean DEFAULT false,
    is_blocked boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT profiles_role_check CHECK (role IN ('user', 'editor', 'admin', 'owner'))
);

-- 2. Ensure identity trigger is valid
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'full_name',
        'user' -- Defaulting to 'user' which satisfies the check constraint
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Audit Logs Matrix
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    action text NOT NULL,
    details text,
    level text DEFAULT 'INFO',
    created_at timestamptz DEFAULT now()
);

-- 4. Notification Recipients Matrix
CREATE TABLE IF NOT EXISTS public.notification_recipients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    label text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Initialize default recipient
INSERT INTO public.notification_recipients (email, label) 
VALUES ('contact@sleepsomno.com', 'Primary Lab Admin')
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- SECURITY POLICIES (RLS)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can see their own, admins see all
CREATE POLICY "Profiles visibility" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.role IN ('admin', 'owner') OR p.is_super_owner = true)
));

-- Audit Logs: Admin only
CREATE POLICY "Admin audit access" ON public.audit_logs
FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)
));

-- Recipients: Admin only
CREATE POLICY "Admin recipient management" ON public.notification_recipients
FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)
));