import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Return a mock client if config is missing to avoid build errors
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => ({
        select: () => ({ eq: () => ({ single: () => ({ data: null, error: 'Supabase not configured' }) }), order: () => ({ data: null, error: 'Supabase not configured' }), select: () => ({ data: null, error: 'Supabase not configured' }) }),
        insert: () => ({ data: null, error: 'Supabase not configured' }),
        upsert: () => ({ data: null, error: 'Supabase not configured' }),
        delete: () => ({ data: null, error: 'Supabase not configured' }),
        update: () => ({ data: null, error: 'Supabase not configured' }),
      }),
      auth: {
        updateUser: () => Promise.resolve({ data: null, error: 'Supabase not configured' })
      }
    } as any;
