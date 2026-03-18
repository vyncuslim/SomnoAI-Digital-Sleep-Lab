import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../services/supabaseAdmin';
import { auditLogger } from '../services/auditLog';

export async function requireAdminFromRequest(req: any) {
  const authHeader = req.headers.authorization;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    await auditLogger.logAdmin({
      source: 'api',
      level: 'warning',
      action: 'admin_auth_failure',
      status: 'failed',
      actorUserId: null,
      ipAddress: ip as string,
      userAgent: userAgent as string,
      message: 'Missing or invalid Authorization header'
    });
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
    await auditLogger.logAdmin({
      source: 'api',
      level: 'warning',
      action: 'admin_auth_failure',
      status: 'failed',
      actorUserId: null,
      ipAddress: ip as string,
      userAgent: userAgent as string,
      message: 'Unauthorized: Invalid token'
    });
    throw new Error('Unauthorized: Invalid token');
  }

  // Check role in profiles table using admin client
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role, is_super_owner, is_blocked')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    await auditLogger.logAdmin({
      source: 'api',
      level: 'warning',
      action: 'admin_auth_failure',
      status: 'failed',
      actorUserId: user.id,
      ipAddress: ip as string,
      userAgent: userAgent as string,
      message: 'Unauthorized: User profile not found'
    });
    throw new Error('Unauthorized: User profile not found');
  }

  if (profile.is_blocked) {
    await auditLogger.logAdmin({
      source: 'api',
      level: 'warning',
      action: 'admin_auth_failure',
      status: 'failed',
      actorUserId: user.id,
      ipAddress: ip as string,
      userAgent: userAgent as string,
      message: 'Unauthorized: User is blocked'
    });
    throw new Error('Unauthorized: User is blocked');
  }

  const isAdmin = profile.role === 'admin' || profile.is_super_owner;
  
  if (!isAdmin) {
    await auditLogger.logAdmin({
      source: 'api',
      level: 'warning',
      action: 'admin_auth_failure',
      status: 'failed',
      actorUserId: user.id,
      ipAddress: ip as string,
      userAgent: userAgent as string,
      message: 'Unauthorized: Admin role required'
    });
    throw new Error('Unauthorized: Admin role required');
  }

  await auditLogger.logAdmin({
    source: 'api',
    level: 'info',
    action: 'admin_auth_success',
    status: 'success',
    actorUserId: user.id,
    ipAddress: ip as string,
    userAgent: userAgent as string,
    message: `Admin access granted to ${user.email}`
  });

  return user;
}
