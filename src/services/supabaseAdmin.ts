import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize the Supabase Admin client with service role key
// This client bypasses RLS and is used for server-side operations
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : {
      from: () => ({
        select: () => ({ eq: () => ({ single: () => ({ data: null, error: { message: 'Supabase Admin not configured' } }) }), order: () => ({ data: null, error: { message: 'Supabase Admin not configured' } }) }),
        insert: () => ({ data: null, error: { message: 'Supabase Admin not configured' } }),
        upsert: () => ({ data: null, error: { message: 'Supabase Admin not configured' } }),
        delete: () => ({ data: null, error: { message: 'Supabase Admin not configured' } }),
        update: () => ({ data: null, error: { message: 'Supabase Admin not configured' } }),
      }),
      auth: {
        admin: {
          deleteUser: () => Promise.resolve({ error: { message: 'Supabase Admin not configured' } }),
          listUsers: () => Promise.resolve({ data: { users: [] }, error: { message: 'Supabase Admin not configured' } }),
        }
      },
      rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase Admin not configured' } })
    } as any;
