import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../services/supabaseAdmin';

export async function requireAdminFromRequest(req: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.split(' ')[1];
  
  // Create a temporary client with the user's token to verify it
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  
  if (authError || !user) {
    throw new Error('Unauthorized: Invalid token');
  }

  // Check role in profiles table using admin client
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role, is_super_owner, is_blocked')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Unauthorized: User profile not found');
  }

  if (profile.is_blocked) {
    throw new Error('Unauthorized: User is blocked');
  }

  const isAdmin = profile.role === 'admin' || profile.role === 'super_owner' || profile.is_super_owner;
  
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin role required');
  }

  return user;
}
