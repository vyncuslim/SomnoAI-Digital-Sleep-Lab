import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../services/supabaseAdmin';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export async function getUserFromRequest(req: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[AUTH-UTILS] Supabase URL or Anon Key is missing in environment variables');
      return null;
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    
    if (authError) {
      console.error('[AUTH-UTILS] getUser error:', authError);
      return null;
    }

    if (!user) {
      console.warn('[AUTH-UTILS] No user found for token');
      return null;
    }

    // Check if user is blocked in the profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_blocked, block_code')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.warn('[AUTH-UTILS] Error fetching profile for block check:', profileError);
      // We continue if profile fetch fails, unless it's a critical error
    }

    if (profile?.is_blocked) {
      console.warn(`[AUTH-UTILS] Blocked user ${user.id} attempted to access API`);
      return null;
    }

    return user;
  } catch (error) {
    console.error('[AUTH-UTILS] Unexpected error in getUserFromRequest:', error);
    return null;
  }
}

export async function requireUserFromRequest(req: any) {
  const user = await getUserFromRequest(req);
  if (!user) {
    // Check if it was a block or just unauthenticated
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      const { data: { user: authUser } } = await userClient.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('is_blocked, block_code')
          .eq('id', authUser.id)
          .single();
        if (profile?.is_blocked) {
          throw new Error(`Account Blocked: ${profile.block_code || 'Violation of terms'}`);
        }
      }
    }
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
