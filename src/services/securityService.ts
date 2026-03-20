import { supabase, logAuditLog, logSecurityEvent } from './supabaseService';
import { emailService } from './emailService';

const generateBlockCode = () => {
  return Array.from({length: 12}, () => Math.floor(Math.random() * 10)).join('');
};

export const securityService = {
  /**
   * Handles a failed login attempt by logging it and blocking the user if threshold is reached.
   */
  handleFailedLogin: async (email: string) => {
    try {
      // Try to get user ID from email for logging purposes
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
      const userId = profile?.id || null;

      // Report failed login via RPC which handles the logic in the database
      const { error } = await supabase.rpc('report_failed_login', { target_email: email });
      
      if (error) {
        console.error("RPC report_failed_login failed:", error);
      }

      // Log to security_events
      await logSecurityEvent(userId, 'FAILED_LOGIN_ATTEMPT', `Failed login attempt for email: ${email}`);

      await logAuditLog(userId, 'FAILED_LOGIN_ATTEMPT', { email });

      // Send security alert for failed login
      await emailService.sendSecurityAlert(email, 'Failed Login Attempt', 'A failed login attempt was detected for your account. If this wasn\'t you, please monitor your account.');
    } catch (error) {
      console.error("Security service failed to handle login error:", error);
    }
  },

  /**
   * Handles a security violation by logging it and potentially blocking the user.
   */
  handleSecurityViolation: async (userId: string, email: string, type: string, severity: string) => {
    try {
      // Log security event
      await logSecurityEvent(userId, type, `Severity: ${severity} | Violation detected.`);
      
      // If critical or high, block the user
      if (severity === 'CRITICAL' || severity === 'HIGH') {
        const blockCode = generateBlockCode();
        await supabase.from('profiles').update({ is_blocked: true, block_code: blockCode }).eq('id', userId);
        await supabase.rpc('block_user', { user_id: userId });
        
        // Log the blocking event to security_events
        await logSecurityEvent(userId, 'USER_BLOCKED', `User blocked due to ${severity} violation: ${type}. Block code: ${blockCode}`);

        await emailService.sendBlockNotification(email, `Security violation detected: ${type}.`, blockCode);
      }
      
      await logAuditLog(userId, 'SECURITY_VIOLATION', { type, severity });
    } catch (error) {
      console.error("Security service failed to handle violation:", error);
    }
  },

  /**
   * Unblocks a user and resets their failed login attempts.
   */
  unblockUser: async (userId: string, email: string, reason: string) => {
    try {
      // Update profile status
      await supabase.from('profiles').update({ 
        is_blocked: false, 
        failed_login_attempts: 0,
        block_code: null
      }).eq('id', userId);
      
      // Reset login attempts in the tracking table
      await supabase.rpc('reset_login_attempts', { target_email: email });
      
      // Log the unblocking event to security_events
      await logSecurityEvent(userId, 'USER_UNBLOCKED', `User unblocked. Reason: ${reason}`);

      await logAuditLog('ADMIN', 'USER_UNBLOCK', { userId, email, reason });
    } catch (error) {
      console.error("Security service failed to unblock user:", error);
    }
  }
};
