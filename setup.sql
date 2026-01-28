
-- ==========================================
-- SOMNOAI QUANTUM INFRASTRUCTURE (v4.0)
-- HIERARCHY: owner (3) > admin (2) > user (1)
-- ==========================================

-- 1. CORE REGISTRY TABLES (Enforce integrity)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    role text NOT NULL DEFAULT 'user' CHECK (role IN ('owner', 'admin', 'user')),
    full_name text DEFAULT '',
    avatar_url text DEFAULT '',
    is_blocked boolean NOT NULL DEFAULT false,
    is_initialized boolean NOT NULL DEFAULT false,
    has_app_data boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. SECURE NEURAL TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_app_meta_data->>'role', 'user'), 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    role = CASE 
      WHEN auth.jwt() ->> 'role' = 'owner' THEN EXCLUDED.role -- Only owner can change roles
      ELSE profiles.role 
    END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. HIERARCHICAL RLS POLICIES (JWT-DRIVEN)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Hierarchy visibility
CREATE POLICY "profiles_select_hierarchy" ON public.profiles
FOR SELECT USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'owner' OR 
    (auth.jwt() ->> 'role' = 'admin' AND role != 'owner')
);

-- UPDATE: Administrative suppression
-- Owner can update anyone. Admin can only update 'user' role nodes.
CREATE POLICY "profiles_update_hierarchy" ON public.profiles
FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'owner' OR 
    (auth.jwt() ->> 'role' = 'admin' AND role = 'user')
)
WITH CHECK (
    auth.jwt() ->> 'role' = 'owner' OR 
    (auth.jwt() ->> 'role' = 'admin' AND role = 'user')
);

-- 4. UTILITIES
CREATE OR REPLACE FUNCTION public.get_clearance_level(user_role text) 
RETURNS integer AS $$
BEGIN
  RETURN CASE 
    WHEN user_role = 'owner' THEN 3
    WHEN user_role = 'admin' THEN 2
    ELSE 1
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

NOTIFY pgrst, 'reload schema';
