import { getMYTTime, notifyAdmin as notifyTelegram } from './telegramService.ts';
import { supabase } from './supabaseService.ts';

/**
 * SOMNO LAB EMAIL BRIDGE v16.1
 * Synchronized Recipient Matrix & Trustpilot AFS Support.
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

const EVENT_MAP: Record<string, { en: string, es: string, zh: string, icon: string }> = {
  'USER_LOGIN': { en: '👤 Secure Access: Login Detected', es: '👤 Acceso Seguro: Inicio de Sesión', zh: '👤 安全访问：用户登录', icon: '🔐' },
  'RUNTIME_ERROR': { en: '🚨 System Exception', es: '🚨 Excepción del Sistema', zh: '🚨 系统运行异常', icon: '🔴' },
  'USER_SIGNUP': { en: '✨ New Subject Node Registered', es: '✨ Nuevo Nodo de Sujeto', zh: '✨ 新受试者注册', icon: '🟢' },
  'GA4_SYNC_FAILURE': { en: '📊 Telemetry Sync Failure', es: '📊 Fallo de Sincronización', zh: '📊 GA4 同步失败', icon: '🟡' },
  'GA4_PERMISSION_DENIED': { en: '🛡️ GA4 Access Denied (403)', es: '🛡️ GA4 Acceso Denegado', zh: '🛡️ GA4 访问被拒绝 (403)', icon: '🚫' },
  'SECURITY_BREACH': { en: '🛡️ Unauthorized Ingress Attempt', es: '🛡️ Ingreso No Autorizado', zh: '🛡️ 未经授权的入侵尝试', icon: '⛔' },
  'SYSTEM_SIGNAL': { en: '📡 System Signal', es: '📡 Señal del Sistema', zh: '📡 系统信号', icon: '📡' },
  'DIARY_LOG_ENTRY': { en: '📝 Biological Log Entry', es: '📝 Nuevo Diario', zh: '📝 新生物节律日志', icon: '📗' }
};

export const emailService = {
  sendAdminAlert: async (payload: { type: string; message: string; source?: string; error?: string }) => {
    try {
      // 1. Fetch current recipient matrix
      const { data: recipients, error: rError } = await supabase
        .from('notification_recipients')
        .select('email')
        .eq('is_active', true);

      // Graceful degradation: if registry is empty, skip silently
      if (rError || !recipients || recipients.length === 0) {
        return { success: false, error: 'NO_RECIPIENTS_LINKED' };
      }

      const mytTime = getMYTTime();
      const isoTime = new Date().toISOString();
      const nodeIdentity = 'sleepsomno.com';
      const rawDetails = payload.message || payload.error || 'N/A';
      const eventType = payload.type || 'SYSTEM_SIGNAL';
      
      const mapping = EVENT_MAP[eventType] || { en: eventType, es: eventType, zh: eventType, icon: '📡' };
      const isLogin = eventType === 'USER_LOGIN';
      const isSignup = eventType === 'USER_SIGNUP';
      const isIncident = eventType.includes('FAILURE') || eventType.includes('DENIED') || eventType.includes('ERROR') || eventType.includes('BREACH');
      
      const subjectPrefix = isLogin ? '🔑 [ACCESS_GRANTED]' : isIncident ? '🚨 [INCIDENT_ALERT]' : '🛡️ [SYSTEM_SIGNAL]';
      const subject = `${subjectPrefix} ${mapping.en}`;

      const html = `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px 20px; border-radius: 32px; border: 1px solid #1e293b; max-width: 600px; margin: auto;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h2 style="color: #ffffff; margin: 0; font-style: italic; letter-spacing: -1px; font-size: 24px;">${mapping.icon} SomnoAI Digital Sleep Lab</h2>
            <p style="font-size: 10px; color: #6366f1; text-transform: uppercase; letter-spacing: 5px; margin-top: 8px; font-weight: 800;">${isLogin ? 'Identity Pulse' : 'Incident Protocol'}</p>
          </div>
          <div style="background: rgba(99, 102, 241, 0.03); padding: 24px; border-radius: 20px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.1);">
            <div style="font-size: 13px; line-height: 1.8; color: #cbd5e1;">
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #818cf8; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">SECURITY DISPATCH</p>
              <b>Event:</b> ${mapping.en}<br/>
              <b>Details:</b> <code style="color: #818cf8; font-family: monospace;">${rawDetails.replace(/\n/g, '<br/>')}</code><br/>
              <b>UTC Timestamp:</b> ${isoTime}<br/>
              <b>Local Time:</b> ${mytTime}
            </div>
          </div>
          <div style="font-size: 9px; color: #475569; text-align: center; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
            SomnoAI Digital Sleep Lab • SECURE HUB: ${nodeIdentity}
          </div>
        </div>
      `;

      // 2. Dispatch to all active recipients in the matrix
      const promises = recipients.map((r: { email: string }) => emailService.sendSystemEmail(r.email, subject, html, undefined, isSignup));
      const results = await Promise.all(promises);
      
      return { success: results.some(r => r.success) };
    } catch (err) {
      return { success: false, error: 'DISPATCH_CRASHED' };
    }
  },

  sendSystemEmail: async (to: string, subject: string, html: string, secret?: string, isHighValueEvent?: boolean) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  getLoginLocation: async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) return 'Unknown Location';
      const data = await response.json();
      return `${data.city}, ${data.region}, ${data.country_name} (IP: ${data.ip})`;
    } catch (e) {
      return 'Unknown Location';
    }
  },

  sendBlockNotification: async (email: string, reason: string = 'Policy Violation') => {
    const subject = "Security Alert: Access Restricted - SomnoAI Digital Sleep Lab";
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px 20px; border-radius: 32px; border: 1px solid #1e293b; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #ffffff; margin: 0; font-style: italic; letter-spacing: -1px; font-size: 24px;">🛡️ SomnoAI Digital Sleep Lab</h2>
          <p style="font-size: 10px; color: #ef4444; text-transform: uppercase; letter-spacing: 5px; margin-top: 8px; font-weight: 800;">Security Protocol Activated</p>
        </div>
        <div style="background: rgba(239, 68, 68, 0.05); padding: 24px; border-radius: 20px; margin-bottom: 24px; border: 1px solid rgba(239, 68, 68, 0.2);">
          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            Your account <strong>${email}</strong> has been restricted by the <strong>SomnoAI Security Engine</strong>.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            <strong>Reason:</strong> ${reason}
          </p>
          <div style="background: rgba(239, 68, 68, 0.1); padding: 15px; border-radius: 12px; color: #f87171; font-weight: bold; margin: 20px 0; font-size: 13px; text-align: center;">
            ACCESS DENIED: VIOLATION OF LABORATORY TERMS
          </div>
          <p style="font-size: 13px; color: #94a3b8; font-style: italic;">
            If you believe this is an error, please contact our administrative core at admin@sleepsomno.com.
          </p>
        </div>
        <div style="font-size: 9px; color: #475569; text-align: center; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
          SomnoAI Digital Sleep Lab • SECURE HUB: sleepsomno.com
        </div>
      </div>
    `;
    
    // Send to user
    await emailService.sendSystemEmail(email, subject, html);
    
    // Send to admin via Email
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        notifyAdmin: true,
        subject: `[CRITICAL] Subject Node Blocked: ${email}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #ef4444;">Node Restriction Logged</h2>
            <p>Subject <strong>${email}</strong> has been automatically blocked by the security engine.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">SomnoAI Digital Sleep Lab • Automated Security Dispatch</p>
          </div>
        `
      }),
    });

    // Send to admin via Telegram
    await notifyTelegram({
      type: 'SECURITY_BREACH',
      message: `USER_BLOCKED: ${email}\nReason: ${reason}`,
      source: 'Security Engine'
    });
  },

  sendSignupNotification: async (email: string, name: string) => {
    const subject = "Welcome to the Lab: Node Registration Successful";
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px 20px; border-radius: 32px; border: 1px solid #1e293b; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #ffffff; margin: 0; font-style: italic; letter-spacing: -1px; font-size: 24px;">✨ SomnoAI Digital Sleep Lab</h2>
          <p style="font-size: 10px; color: #10b981; text-transform: uppercase; letter-spacing: 5px; margin-top: 8px; font-weight: 800;">Registration Confirmed</p>
        </div>
        <div style="background: rgba(16, 185, 129, 0.05); padding: 24px; border-radius: 20px; margin-bottom: 24px; border: 1px solid rgba(16, 185, 129, 0.2);">
          <p style="font-size: 16px; font-weight: bold; color: #ffffff; margin-bottom: 16px;">Welcome, ${name}.</p>
          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            Your subject node has been successfully integrated into the <strong>SomnoAI Digital Sleep Lab</strong>.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            You now have access to our neural analysis engines, biometric tracking protocols, and sleep optimization insights.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://sleepsomno.com/dashboard" style="background: #6366f1; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Enter Dashboard</a>
          </div>
        </div>
        <div style="font-size: 9px; color: #475569; text-align: center; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
          SomnoAI Digital Sleep Lab • SECURE HUB: sleepsomno.com
        </div>
      </div>
    `;
    await emailService.sendSystemEmail(email, subject, html);
    
    // Notify Admin
    await emailService.sendAdminAlert({
      type: 'USER_SIGNUP',
      message: `New Node Registered: ${email} (${name})`
    });
  },

  sendFailedLoginNotification: async (email: string, attempts: number) => {
    const subject = "Security Alert: Failed Login Attempt Detected";
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px 20px; border-radius: 32px; border: 1px solid #1e293b; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #ffffff; margin: 0; font-style: italic; letter-spacing: -1px; font-size: 24px;">🛡️ SomnoAI Digital Sleep Lab</h2>
          <p style="font-size: 10px; color: #f59e0b; text-transform: uppercase; letter-spacing: 5px; margin-top: 8px; font-weight: 800;">Security Warning</p>
        </div>
        <div style="background: rgba(245, 158, 11, 0.05); padding: 24px; border-radius: 20px; margin-bottom: 24px; border: 1px solid rgba(245, 158, 11, 0.2);">
          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            A failed login attempt was detected for your account <strong>${email}</strong>.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            <strong>Total Failed Attempts:</strong> ${attempts}/5
          </p>
          <p style="font-size: 13px; color: #94a3b8; font-style: italic; margin-top: 16px;">
            If this was not you, please secure your account immediately. Your account will be automatically restricted after 5 failed attempts.
          </p>
        </div>
        <div style="font-size: 9px; color: #475569; text-align: center; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
          SomnoAI Digital Sleep Lab • SECURE HUB: sleepsomno.com
        </div>
      </div>
    `;
    await emailService.sendSystemEmail(email, subject, html);
  },

  sendLoginNotification: async (email: string, location: string = 'Unknown Location') => {
    const subject = "Security Alert: New Login Detected - SomnoAI Digital Sleep Lab";
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px 20px; border-radius: 32px; border: 1px solid #1e293b; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #ffffff; margin: 0; font-style: italic; letter-spacing: -1px; font-size: 24px;">👤 SomnoAI Digital Sleep Lab</h2>
          <p style="font-size: 10px; color: #6366f1; text-transform: uppercase; letter-spacing: 5px; margin-top: 8px; font-weight: 800;">Access Notification</p>
        </div>
        <div style="background: rgba(99, 102, 241, 0.05); padding: 24px; border-radius: 20px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.2);">
          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            A new login was detected for your account <strong>${email}</strong>.
          </p>
          <div style="background: rgba(99, 102, 241, 0.1); padding: 15px; border-radius: 12px; color: #818cf8; margin: 20px 0; font-size: 13px;">
            <p style="margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 11px;">Access Details</p>
            <strong>Location:</strong> ${location}<br/>
            <strong>Timestamp:</strong> ${new Date().toISOString()}<br/>
            <strong>Status:</strong> SECURE HANDSHAKE COMPLETED
          </div>
          <p style="font-size: 13px; color: #94a3b8; font-style: italic;">
            If this was not you, please secure your account immediately by changing your password or contacting support.
          </p>
        </div>
        <div style="font-size: 9px; color: #475569; text-align: center; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
          SomnoAI Digital Sleep Lab • SECURE HUB: sleepsomno.com
        </div>
      </div>
    `;
    await emailService.sendSystemEmail(email, subject, html);
    
    // Also notify admin
    await emailService.sendAdminAlert({
      type: 'USER_LOGIN',
      message: `Login Detected: ${email} from ${location}`
    });
  }
};
