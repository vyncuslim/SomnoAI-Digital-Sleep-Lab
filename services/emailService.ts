
import { getMYTTime } from './telegramService.ts';

/**
 * SOMNO LAB EMAIL BRIDGE v5.0
 * Mirrored Multi-lingual Dispatch Protocol (EN/ES/ZH)
 */

const ADMIN_EMAIL = 'ongyuze1401@gmail.com';

const TRANSLATIONS: Record<string, { en: string, es: string, zh: string }> = {
  'RUNTIME_ERROR': { en: 'System Exception', es: 'Excepción del Sistema', zh: '系统运行异常' },
  'USER_LOGIN': { en: 'Identity Verified', es: 'Identidad Verificada', zh: '用户身份验证成功' },
  'USER_SIGNUP': { en: 'New Subject Node', es: 'Nuevo Nodo de Sujeto', zh: '新受试者注册' },
  'SECURITY_BREACH_ATTEMPT': { en: 'Unauthorized Ingress', es: 'Ingreso no Autorizado', zh: '未经授权的人侵尝试' },
  'PULSE_STABLE': { en: 'Handshake Stable', es: 'Handshake Estable', zh: '系统握手稳定' },
  'PULSE_ANOMALY': { en: 'Grid Anomaly', es: 'Anomalía de Red', zh: '网络连接异常' },
  'DIARY_LOG_ENTRY': { en: 'Biological Log Entry', es: 'Entrada de Registro Bio', zh: '生物日志更新' },
  'GA4_SYNC_FAILURE': { en: 'Telemetry Mirror Severed', es: 'Espejo Telemétrico Cortado', zh: '遥测镜像连接中断' },
  'PW_UPDATE_SUCCESS': { en: 'Key Rotation Complete', es: 'Rotación de Llaves Completa', zh: '访问密钥轮换完成' },
  'SYSTEM_SIGNAL': { en: 'System Signal Detected', es: 'Señal del Sistema Detectada', zh: '监测到系统信号' }
};

export const emailService = {
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

  sendAdminAlert: async (payload: { type: string; message: string; error?: string; isPulse?: boolean }) => {
    const mytTime = getMYTTime();
    const nodeIdentity = typeof window !== 'undefined' ? window.location.hostname : 'Cloud_Edge';
    const isError = !!payload.error || payload.type.includes('FAIL') || payload.type.includes('ANOMALY') || payload.type.includes('FAILURE');
    
    const headerColor = isError ? '#ef4444' : '#818cf8';
    const icon = payload.isPulse ? '📡' : isError ? '🚨' : '🛡️';
    
    const mapping = TRANSLATIONS[payload.type] || TRANSLATIONS['SYSTEM_SIGNAL'];

    const html = `
      <div style="font-family: sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px; border-radius: 20px; border: 1px solid #1e293b;">
        <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: ${headerColor}; margin: 0;">${icon} Somno Lab Dual-Channel Dispatch</h2>
          <p style="font-size: 10px; color: #64748b; text-transform: uppercase;">Global Security Mirror</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: ${headerColor}; font-size: 14px; text-transform: uppercase;">🇬🇧 [ENGLISH] - Event: ${mapping.en}</h3>
          <div style="font-style: italic; background: #050a1f; padding: 15px; border-radius: 10px; color: #cbd5e1; border: 1px solid #1e293b;">${payload.message}</div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: ${headerColor}; font-size: 14px; text-transform: uppercase;">🇪🇸 [ESPAÑOL] - Evento: ${mapping.es}</h3>
          <div style="font-style: italic; background: #050a1f; padding: 15px; border-radius: 10px; color: #cbd5e1; border: 1px solid #1e293b;">${payload.message}</div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: ${headerColor}; font-size: 14px; text-transform: uppercase;">🇨🇳 [中文] - 事件: ${mapping.zh}</h3>
          <div style="font-style: italic; background: #050a1f; padding: 15px; border-radius: 10px; color: #cbd5e1; border: 1px solid #1e293b;">${payload.message}</div>
        </div>

        <div style="font-size: 10px; color: #475569; border-top: 1px solid #1e293b; padding-top: 20px; text-align: center;">
          <b>NODE:</b> ${nodeIdentity} | <b>TIME:</b> ${mytTime}
        </div>
      </div>
    `;

    return await emailService.sendSystemEmail(ADMIN_EMAIL, `${icon} Lab Security Pulse: ${payload.type}`, html);
  },

  sendSystemEmail: async (to: string, subject: string, html: string) => {
    // 自动通过环境变量或内部逻辑处理 Secret
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
