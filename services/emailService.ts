
import { getMYTTime } from './telegramService.ts';

/**
 * SOMNO LAB EMAIL BRIDGE v3.0
 * Mirrored Multi-lingual Dispatch
 */

const ADMIN_EMAIL = 'ongyuze1401@gmail.com';

export const emailService = {
  // Fix: Added formatAnalysisHtml to support AIAssistant.tsx requirements
  formatAnalysisHtml: (content: string, email: string) => {
    return `
      <div style="font-family: sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px; border-radius: 20px; border: 1px solid #1e293b;">
        <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: #818cf8; margin: 0;">Neural Lab Analysis Dispatch</h2>
          <p style="font-size: 10px; color: #64748b; text-transform: uppercase;">SomnoAI Secure Telemetry Hub</p>
        </div>
        <div style="margin-bottom: 20px;">
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 5px;">Subject Identity:</p>
          <p style="font-weight: bold; color: #ffffff;">${email}</p>
        </div>
        <div style="background-color: #050a1f; padding: 25px; border-radius: 15px; border: 1px solid #1e293b; line-height: 1.6;">
          <p style="font-style: italic; color: #cbd5e1; margin: 0;">${content.replace(/\n/g, '<br/>')}</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1e293b; text-align: center; font-size: 10px; color: #475569;">
          @2026 SOMNO LAB • NEURAL INFRASTRUCTURE • ALL BIOMETRICS ENCRYPTED
        </div>
      </div>
    `;
  },

  sendAdminAlert: async (payload: { type: string; message: string; error?: string }) => {
    const mytTime = getMYTTime();
    const nodeIdentity = typeof window !== 'undefined' ? window.location.hostname : 'Cloud_Edge';
    
    const html = `
      <div style="font-family: sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px; border-radius: 20px;">
        <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: #818cf8; margin: 0;">Somno Lab Multi-lingual Dispatch</h2>
          <p style="font-size: 10px; color: #64748b; text-transform: uppercase;">Global Security Mirror</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #ef4444; font-size: 14px; text-transform: uppercase;">[EN] System Signal: ${payload.type}</h3>
          <p style="font-style: italic;">${payload.message}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #ef4444; font-size: 14px; text-transform: uppercase;">[ES] Señal del Sistema: ${payload.type}</h3>
          <p style="font-style: italic;">${payload.message}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #ef4444; font-size: 14px; text-transform: uppercase;">[ZH] 系统信号: ${payload.type}</h3>
          <p style="font-style: italic;">${payload.message}</p>
        </div>

        <div style="font-size: 10px; color: #475569; border-top: 1px solid #1e293b; padding-top: 20px;">
          NODE: ${nodeIdentity} | TIME: ${mytTime}
        </div>
      </div>
    `;

    return await emailService.sendSystemEmail(ADMIN_EMAIL, `🛡️ Lab Security Pulse: ${payload.type}`, html);
  },

  sendSystemEmail: async (to: string, subject: string, html: string) => {
    const secret = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2"; 
    try {
      const response = await fetch('/api/send-system-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, secret }),
      });
      return { success: response.ok };
    } catch (e) {
      return { success: false };
    }
  }
};
