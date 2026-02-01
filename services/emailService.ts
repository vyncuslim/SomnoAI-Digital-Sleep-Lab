
import { I18N_ALERTS, getMYTTime } from './telegramService.ts';

/**
 * SOMNOAI EMAIL BRIDGE v2.2
 * Synchronized with MYT (Asia/Kuala_Lumpur)
 */

const ADMIN_EMAIL = 'ongyuze1401@gmail.com';

const I18N_EMAIL_TEMPLATES: Record<string, any> = {
  en: {
    subject: "🛡️ Somno Lab Security Protocol Alert",
    header: "Neural Link Alert",
  },
  zh: {
    subject: "🛡️ Somno Lab 安全协议告警",
    header: "神经链接告警",
  },
  es: {
    subject: "🛡️ Alerta de Protocolo de Seguridad Somno Lab",
    header: "Alerta de Enlace Neuronal",
  }
};

export const emailService = {
  /**
   * Dispatches a high-priority administrative alert to the SMTP gateway.
   */
  sendAdminAlert: async (payload: { type: string; message: string; error?: string }, lang: 'en' | 'zh' | 'es' = 'en') => {
    const et = I18N_EMAIL_TEMPLATES[lang] || I18N_EMAIL_TEMPLATES.en;
    const dict = I18N_ALERTS[lang] || I18N_ALERTS.en;
    const nodeIdentity = window.location.hostname;
    const mytTime = getMYTTime();
    
    const rawType = payload.type || 'SYSTEM_SIGNAL';
    const localizedType = dict[rawType.toLowerCase()] || rawType;

    const html = `
      <div style="font-family: 'JetBrains Mono', monospace, sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px; border-radius: 24px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="display: inline-block; padding: 12px 24px; background: #ef4444; border-radius: 12px; color: white; font-weight: 800; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">
            ${et.header}
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
          <p style="margin: 0 0 10px 0; font-size: 10px; color: #64748b; text-transform: uppercase;">${dict.type}</p>
          <p style="margin: 0 0 24px 0; font-size: 16px; color: #818cf8; font-weight: bold;">${localizedType}</p>
          
          <p style="margin: 0 0 10px 0; font-size: 10px; color: #64748b; text-transform: uppercase;">${dict.log}</p>
          <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #e2e8f0; font-style: italic;">${payload.message}</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid rgba(255,255,255,0.05); pt: 24px;">
            <div>
              <p style="margin: 20px 0 5px 0; font-size: 10px; color: #64748b; text-transform: uppercase;">${dict.node}</p>
              <p style="margin: 0; font-size: 12px; color: #f1f5f9; font-weight: bold;">${nodeIdentity}</p>
            </div>
            <div>
              <p style="margin: 20px 0 5px 0; font-size: 10px; color: #64748b; text-transform: uppercase;">${dict.time}</p>
              <p style="margin: 0; font-size: 12px; color: #f1f5f9; font-weight: bold;">${mytTime}</p>
            </div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; font-size: 9px; color: #475569; letter-spacing: 1px;">
          SOMNO NEURAL TELEMETRY GUARD • SYSTEM AUTO-DISPATCH
        </div>
      </div>
    `;

    return await emailService.sendSystemEmail(ADMIN_EMAIL, `${et.subject} [${localizedType}]`, html);
  },

  formatAnalysisHtml: (content: string, email: string) => {
    return `
      <div style="font-family: sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px; border-radius: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #818cf8; font-style: italic; margin-bottom: 5px;">SomnoAI Neural Report</h1>
          <p style="font-size: 10px; color: #475569; letter-spacing: 2px;">SECURE TELEMETRY DISPATCH</p>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; line-height: 1.6;">
          <p style="color: #94a3b8; font-size: 12px;">SUBJECT: ${email}</p>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.05); margin: 20px 0;">
          <div style="font-size: 14px; color: #e2e8f0; white-space: pre-wrap; font-style: italic;">
            ${content}
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #475569;">
          © 2026 SomnoAI Digital Sleep Lab • Neural Infrastructure
        </div>
      </div>
    `;
  },

  sendSystemEmail: async (to: string, subject: string, html: string) => {
    const secret = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2"; 
    try {
      const response = await fetch('/api/send-system-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, secret }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (e) {
      console.error("Email bridge severed.", e);
      return { success: false, error: "NETWORK_EXCEPTION" };
    }
  }
};
