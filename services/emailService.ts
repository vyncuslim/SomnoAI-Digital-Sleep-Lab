
import { getMYTTime } from './telegramService.ts';

/**
 * SOMNO LAB EMAIL BRIDGE v12.0
 * Protocol: Multi-lingual Alert Synthesis (EN/ES/ZH)
 */

const ADMIN_EMAIL = 'ongyuze1401@gmail.com';
const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

const EVENT_MAP: Record<string, { en: string, es: string, zh: string }> = {
  'USER_LOGIN': { en: '👤 Subject Login', es: '👤 Inicio de Sesión', zh: '👤 用户登录' },
  'RUNTIME_ERROR': { en: '🚨 System Exception', es: '🚨 Excepción del Sistema', zh: '🚨 系统运行异常' },
  'USER_SIGNUP': { en: '✨ New Subject Node', es: '✨ Nuevo Nodo de Sujeto', zh: '✨ 新受试者注册' },
  'GA4_SYNC_FAILURE': { en: '📊 Telemetry Sync Failure', es: '📊 Fallo de Sincronización', zh: '📊 GA4 同步失败' },
  'SECURITY_BREACH_ATTEMPT': { en: '🛡️ Unauthorized Ingress', es: '🛡️ Ingreso No Autorizado', zh: '🛡️ 未经授权的入侵尝试' },
  'SYSTEM_SIGNAL': { en: '📡 System Signal', es: '📡 Señal del Sistema', zh: '📡 系统信号' }
};

export const emailService = {
  sendAdminAlert: async (payload: { type: string; message: string; source?: string; error?: string }) => {
    const mytTime = getMYTTime();
    const isoTime = new Date().toISOString();
    const nodeIdentity = 'sleepsomno.com';
    const rawDetails = payload.message || payload.error || 'N/A';
    const eventType = payload.type || 'SYSTEM_SIGNAL';
    
    const mapping = EVENT_MAP[eventType] || { en: eventType, es: eventType, zh: eventType };

    // 构造高保真三语 HTML 邮件内容
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px 20px; border-radius: 32px; border: 1px solid #1e293b; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #ffffff; margin: 0; font-style: italic; letter-spacing: -1px; font-size: 24px;">🛡️ SOMNO LAB 节点告警</h2>
          <p style="font-size: 10px; color: #6366f1; text-transform: uppercase; letter-spacing: 5px; margin-top: 8px; font-weight: 800;">Node Alert Protocol</p>
        </div>

        <!-- ENGLISH SECTOR -->
        <div style="background: rgba(99, 102, 241, 0.03); padding: 24px; border-radius: 20px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.1);">
          <p style="margin: 0 0 12px 0; font-size: 11px; color: #818cf8; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">🇬🇧 [ENGLISH]</p>
          <div style="font-size: 13px; line-height: 1.8; color: #cbd5e1;">
            <b>Type:</b> ${mapping.en}<br/>
            <b>Node:</b> ${nodeIdentity}<br/>
            <b>Log:</b> <code style="color: #818cf8;">${rawDetails}</code><br/>
            <b>Time:</b> ${isoTime}
          </div>
        </div>

        <!-- ESPAÑOL SECTOR -->
        <div style="background: rgba(99, 102, 241, 0.03); padding: 24px; border-radius: 20px; margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.1);">
          <p style="margin: 0 0 12px 0; font-size: 11px; color: #818cf8; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">🇪🇸 [ESPAÑOL]</p>
          <div style="font-size: 13px; line-height: 1.8; color: #cbd5e1;">
            <b>Tipo:</b> ${mapping.es}<br/>
            <b>Nodo:</b> ${nodeIdentity}<br/>
            <b>Registro:</b> <code style="color: #818cf8;">${rawDetails}</code><br/>
            <b>Tiempo:</b> ${isoTime}
          </div>
        </div>

        <!-- CHINESE SECTOR -->
        <div style="background: rgba(99, 102, 241, 0.03); padding: 24px; border-radius: 20px; border: 1px solid rgba(99, 102, 241, 0.1);">
          <p style="margin: 0 0 12px 0; font-size: 11px; color: #818cf8; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">🇨🇳 [中文]</p>
          <div style="font-size: 13px; line-height: 1.8; color: #cbd5e1;">
            <b>类型:</b> ${mapping.zh}<br/>
            <b>节点:</b> ${nodeIdentity}<br/>
            <b>日志:</b> <code style="color: #818cf8;">${rawDetails}</code><br/>
            <b>时间:</b> ${mytTime}
          </div>
        </div>

        <div style="font-size: 9px; color: #475569; text-align: center; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
          SOMNO LAB DIGITAL SLEEP LAB • SECURE INFRASTRUCTURE v12.0
        </div>
      </div>
    `;

    return await emailService.sendSystemEmail(ADMIN_EMAIL, `🛡️ Alert: ${mapping.en}`, html);
  },

  sendSystemEmail: async (to: string, subject: string, html: string, secret?: string) => {
    const finalSecret = secret || INTERNAL_LAB_KEY;
    try {
      const response = await fetch('/api/send-system-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, secret: finalSecret }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("[Email_Bridge] Server error:", data);
        return { success: false, error: data.error };
      }
      return { success: true };
    } catch (e: any) {
      console.warn(`[Email_Bridge] Transmission failed: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
};
