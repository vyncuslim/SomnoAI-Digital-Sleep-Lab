-- Fix audit_logs table and write_audit_log function
-- This migration aligns the database with the TypeScript auditLog service

-- 1. Ensure audit_logs table has all required columns
-- We use a DO block to add columns safely
DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'source') THEN
        ALTER TABLE public.audit_logs ADD COLUMN source text DEFAULT 'system';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'level') THEN
        ALTER TABLE public.audit_logs ADD COLUMN level text DEFAULT 'info';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'category') THEN
        ALTER TABLE public.audit_logs ADD COLUMN category text DEFAULT 'system';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'status') THEN
        ALTER TABLE public.audit_logs ADD COLUMN status text DEFAULT 'success';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'target_user_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN target_user_id uuid REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'session_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN session_id text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'request_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN request_id text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'path') THEN
        ALTER TABLE public.audit_logs ADD COLUMN path text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'method') THEN
        ALTER TABLE public.audit_logs ADD COLUMN method text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'error_code') THEN
        ALTER TABLE public.audit_logs ADD COLUMN error_code text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'message') THEN
        ALTER TABLE public.audit_logs ADD COLUMN message text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'metadata') THEN
        ALTER TABLE public.audit_logs ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
    END IF;

    -- Ensure details column is jsonb (if it exists as text, we might need to convert it)
    -- In setup.sql it was text, in migration it was jsonb. Let's make it jsonb.
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'details' AND data_type = 'text') THEN
        ALTER TABLE public.audit_logs ALTER COLUMN details TYPE jsonb USING details::jsonb;
    END IF;
END $$;

-- 2. Drop existing function to avoid signature conflicts
DROP FUNCTION IF EXISTS public.write_audit_log(uuid, text, jsonb, text, text);
DROP FUNCTION IF EXISTS public.write_audit_log(text, text, text, text, text, uuid, uuid, text, text, text, text, text, text, text, text, jsonb);

-- 3. Create/Update the function to accept all parameters from the TypeScript service
CREATE OR REPLACE FUNCTION public.write_audit_log(
  p_source text DEFAULT 'system',
  p_level text DEFAULT 'info',
  p_category text DEFAULT 'system',
  p_action text DEFAULT 'unknown',
  p_status text DEFAULT 'success',
  p_actor_user_id uuid DEFAULT null,
  p_target_user_id uuid DEFAULT null,
  p_session_id text DEFAULT null,
  p_request_id text DEFAULT null,
  p_ip_address text DEFAULT null,
  p_user_agent text DEFAULT null,
  p_path text DEFAULT null,
  p_method text DEFAULT null,
  p_error_code text DEFAULT null,
  p_message text DEFAULT null,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_logs (
    source, level, category, action, status, 
    user_id, target_user_id, session_id, request_id, 
    ip_address, user_agent, path, method, 
    error_code, message, metadata
  )
  VALUES (
    p_source, p_level, p_category, p_action, p_status, 
    p_actor_user_id, p_target_user_id, p_session_id, p_request_id, 
    p_ip_address, p_user_agent, p_path, p_method, 
    p_error_code, p_message, p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure profiles table has all required columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_super_owner') THEN
        ALTER TABLE public.profiles ADD COLUMN is_super_owner boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'provider') THEN
        ALTER TABLE public.profiles ADD COLUMN provider text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email text;
    END IF;
END $$;

-- 5. Fix handle_new_user trigger to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_email text;
    v_full_name text;
BEGIN
    -- Extract email and name with fallbacks
    v_email := COALESCE(new.email, new.raw_user_meta_data->>'email', 'no-email-' || new.id || '@placeholder.com');
    v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '');

    -- Handle potential email conflicts where the email exists but with a different ID
    -- This can happen if auth.users and public.profiles get out of sync
    UPDATE public.profiles 
    SET email = email || '_old_' || id 
    WHERE email = v_email AND id != new.id;

    INSERT INTO public.profiles (id, email, full_name, avatar_url, provider, role)
    VALUES (
        new.id, 
        v_email, 
        v_full_name,
        new.raw_user_meta_data->>'avatar_url',
        new.app_metadata->>'provider',
        'user'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        provider = COALESCE(EXCLUDED.provider, profiles.provider),
        updated_at = now();
    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- On any error, return NEW so the auth.users insert still succeeds
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
