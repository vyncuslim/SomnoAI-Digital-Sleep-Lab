import { supabase, logAuditLog } from './supabaseService.ts';
import { emailService } from './emailService.ts';

export const securityService = {
  /**
   * Centralized handler for security violations.
   * Blocks the user, logs the event, and notifies both user and admin.
   */
  handleSecurityViolation: async (
    userId: string, 
    email: string, 
    reason: string, 
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH'
  ) => {
    console.warn(`[SECURITY] Violation detected for ${email}: ${reason}`);

    try {
      // 1. Block the user in the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_blocked: true })
        .eq('id', userId);

      if (updateError) console.error('Failed to update profile block status:', updateError);

      // 2. Call RPC to enforce block (if applicable/available on backend)
      // We wrap this in try-catch as the RPC might not exist in all environments
      try {
        await supabase.rpc('block_user', { target_email: email });
      } catch (rpcError) {
        console.warn('RPC block_user failed or not available:', rpcError);
      }

      // 3. Log to Audit Logs
      await logAuditLog(userId, 'SECURITY_VIOLATION', {
        reason,
        severity,
        timestamp: new Date().toISOString()
      });

      // 4. Log to Security Events table
      await supabase.from('security_events').insert([{
        user_id: userId,
        type: 'ACCOUNT_BLOCKED',
        details: reason,
        severity,
        ip_address: 'Client-Side Detected' // In a real app, get this from edge function
      }]);

      // 5. Send Notifications (User + Admin + Telegram)
      // emailService.sendBlockNotification handles all 3 channels
      await emailService.sendBlockNotification(email, reason);

      // 6. Force Sign Out
      await supabase.auth.signOut();

      return { success: true };

    } catch (error) {
      console.error('Security violation handling failed:', error);
      return { success: false, error };
    }
  },

  /**
   * Monitor login attempts and block if threshold exceeded.
   * Should be called after a failed login attempt.
   */
  handleFailedLogin: async (email: string) => {
    try {
      // 1. Get current profile to check attempts
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, failed_login_attempts, is_blocked')
        .eq('email', email)
        .single();

      if (error || !profiles) return; // User might not exist, ignore

      if (profiles.is_blocked) return; // Already blocked

      const newAttempts = (profiles.failed_login_attempts || 0) + 1;

      // 2. Update attempts
      await supabase
        .from('profiles')
        .update({ failed_login_attempts: newAttempts })
        .eq('id', profiles.id);

      // 3. Check threshold (e.g., 5 attempts)
      if (newAttempts >= 5) {
        await securityService.handleSecurityViolation(
          profiles.id,
          email,
          `Excessive failed login attempts (${newAttempts})`,
          'MEDIUM'
        );
      } else {
        // Just notify user of failed attempt
        await emailService.sendFailedLoginNotification(email, newAttempts);
      }

    } catch (err) {
      console.error('Failed login handling error:', err);
    }
  },

  /**
   * Check if the current user is allowed to access a specific area.
   * If not, trigger a violation.
   */
  validateAccess: async (userId: string, email: string, requiredRole: string[], currentRole: string) => {
    if (!requiredRole.includes(currentRole)) {
      await securityService.handleSecurityViolation(
        userId,
        email,
        `Unauthorized access attempt. Required: ${requiredRole.join('|')}, Actual: ${currentRole}`,
        'HIGH'
      );
      return false;
    }
    return true;
  }
};
