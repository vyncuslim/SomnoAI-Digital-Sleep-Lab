import { getMYTTime } from './telegramService.ts';
import { supabase } from './supabaseService.ts';

/**
 * SOMNO LAB EMAIL BRIDGE v16.0
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
    // 1. Fetch current recipient matrix
    const { data: recipients } = await supabase
      .from('notification_recipients')
      .select('email')
      .eq('is_active', true);

    if (!recipients || recipients.length === 0) {
      console.warn("[Email_Bridge] No active recipients found in registry.");
      return { success: false, error: 'NO_RECIPIENTS' };
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
          <h2 style="color: #ffffff; margin: 0; font-style: italic; letter-spacing: -1px; font-size: 24px;">${mapping.icon} SOMNO LAB</h2>
          <p style="font-size: 10px; color: #6366f1; text-transform: uppercase; letter-spacing: 5px; margin-top: 8px; font-weight: 800;">${isLogin ? 'Identity Pulse' : 'Incident Protocol'}</p>
        </div>
        <div style="background: rgba(99, 102, 241, 0.03); padding: 24px; border-radius: 20px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.1);">
          <div style="font-size: 13px; line-height: 1.8; color: #cbd5e1;">
            <p style="margin: 0 0 12px 0; font-size: 11px; color: #818cf8; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">🇬🇧 [ENGLISH]</p>
            <b>Event:</b> ${mapping.en}<br/>
            <b>Details:</b> <code style="color: #818cf8; font-family: monospace;">${rawDetails.replace(/\n/g, '<br/>')}</code><br/>
            <b>UTC Timestamp:</b> ${isoTime}
          </div>
        </div>
        <div style="background: rgba(99, 102, 241, 0.03); padding: 24px; border-radius: 20px; border: 1px solid rgba(99, 102, 241, 0.1);">
          <div style="font-size: 13px; line-height: 1.8; color: #cbd5e1;">
            <p style="margin: 0 0 12px 0; font-size: 11px; color: #818cf8; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">🇨🇳 [中文]</p>
            <b>事件类型:</b> ${mapping.zh}<br/>
            <b>详细日志:</b> <code style="color: #818cf8; font-family: monospace;">${rawDetails.replace(/\n/g, '<br/>')}</code><br/>
            <b>当地时间:</b> ${mytTime}
          </div>
        </div>
        <div style="font-size: 9px; color: #475569; text-align: center; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
          SOMNO LAB DIGITAL SLEEP LAB • SECURE HUB: ${nodeIdentity}
        </div>
      </div>
    `;

    // 2. Dispatch to all recipients
    // Flag signup as High Value to trigger Trustpilot AFS
    const promises = recipients.map(r => emailService.sendSystemEmail(r.email, subject, html, undefined, isSignup));
    const results = await Promise.all(promises);
    
    return { success: results.some(r => r.success) };
  },

  sendSystemEmail: async (to: string, subject: string, html: string, secret?: string, isHighValueEvent?: boolean) => {
    const finalSecret = secret || INTERNAL_LAB_KEY;
    try {
      const response = await fetch('/api/send-system-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, secret: finalSecret, isHighValueEvent }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
};