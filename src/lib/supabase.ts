import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const mockSupabase = {
  from: () => ({
    select: () => ({ eq: () => ({ single: () => ({ data: null, error: 'Supabase not configured' }), order: () => ({ data: null, error: 'Supabase not configured' }) }), order: () => ({ data: null, error: 'Supabase not configured' }), select: () => ({ data: null, error: 'Supabase not configured' }) }),
    insert: () => ({ data: null, error: 'Supabase not configured' }),
    upsert: () => ({ data: null, error: 'Supabase not configured' }),
    delete: () => ({ data: null, error: 'Supabase not configured' }),
    update: () => ({ data: null, error: 'Supabase not configured' }),
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    updateUser: () => Promise.resolve({ data: null, error: 'Supabase not configured' }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null })
  }
} as any;

export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : mockSupabase;
