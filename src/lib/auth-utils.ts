import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../services/supabaseAdmin';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export async function getUserFromRequest(req: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export async function requireUserFromRequest(req: any) {
  const user = await getUserFromRequest(req);
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  return user;
}

export async function isAdmin(userId: string) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, is_super_owner')
    .eq('id', userId)
    .single();

  return profile?.role === 'admin' || profile?.is_super_owner;
}
