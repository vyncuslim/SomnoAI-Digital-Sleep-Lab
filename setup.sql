
-- 1. Create or verify the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text, 
  role text DEFAULT 'user',
  is_blocked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create or verify the user_data table with biometrics
CREATE TABLE IF NOT EXISTS public.user_data (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  age integer DEFAULT 0,
  height float DEFAULT 0,
  weight float DEFAULT 0,
  gender text DEFAULT 'prefer-not-to-say',
  setup_completed boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Safety: Explicitly add columns if they were missed in a previous run
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_data' AND column_name='age') THEN
        ALTER TABLE public.user_data ADD COLUMN age integer DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_data' AND column_name='height') THEN
        ALTER TABLE public.user_data ADD COLUMN height float DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_data' AND column_name='weight') THEN
        ALTER TABLE public.user_data ADD COLUMN weight float DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_data' AND column_name='gender') THEN
        ALTER TABLE public.user_data ADD COLUMN gender text DEFAULT 'prefer-not-to-say';
    END IF;
END $$;

-- 4. Re-apply RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own data" ON public.user_data;
CREATE POLICY "Users can view own data" ON public.user_data FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own data" ON public.user_data;
CREATE POLICY "Users can update own data" ON public.user_data FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own data" ON public.user_data;
CREATE POLICY "Users can insert own data" ON public.user_data FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. THE CRITICAL FIX: Tell PostgREST to reload the schema cache immediately.
-- Run this in the Supabase SQL Editor if you see 'column not found' errors.
NOTIFY pgrst, 'reload schema';
