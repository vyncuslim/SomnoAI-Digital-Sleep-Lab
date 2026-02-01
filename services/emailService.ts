
import { getMYTTime } from './telegramService.ts';

/**
 * SOMNO LAB EMAIL BRIDGE v7.0
 * Protocol: Mirrored Triple-lingual Dispatch with Source Transparency
 */

const ADMIN_EMAIL = 'ongyuze1401@gmail.com';
const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

const TRANSLATIONS: Record<string, { en: string, es: string, zh: string }> = {
  'RUNTIME_ERROR': { en: 'System Exception', es: 'Excepción del Sistema', zh: '系统运行异常' },
  'USER_LOGIN': { en: 'Identity Verified', es: 'Identidad Verificada', zh: '用户身份验证成功' },
  'USER_SIGNUP': { en: 'New Subject Node', es: 'Nuevo Nodo de Sujeto', zh: '新受试者注册' },
  'USER_LOGOUT': { en: 'Session Terminated', es: 'Sesión Terminada', zh: '用户登出' },
  'SECURITY_BREACH_ATTEMPT': { en: 'Unauthorized Ingress', es: 'Ingreso no Autorizado', zh: '未经授权的入侵尝试' },
  'PULSE_STABLE': { en: 'Neural Handshake Stable', es: 'Handshake Estable', zh: '系统脉搏稳定' },
  'PULSE_ANOMALY': { en: 'Grid Anomaly Detected', es: 'Anomalía de Red Detectada', zh: '检测到网格异常' },
  'DIARY_LOG_ENTRY': { en: 'Biological Log Entry', es: 'Entrada de Registro Bio', zh: '生物日志更新' },
  'GA4_SYNC_FAILURE': { en: 'Telemetry Sync Failure', es: 'Fallo de Sincronización', zh: 'GA4 同步失败' },
  'PW_UPDATE_SUCCESS': { en: 'Access Key Rotated', es: 'Clave de Acceso Rotada', zh: '访问密钥已轮换' },
  'SYSTEM_SIGNAL': { en: 'System Signal Detected', es: 'Señal del Sistema Detectada', zh: '监测到系统信号' },
  'ADMIN_ROLE_CHANGE': { en: 'Clearance Shift', es: 'Cambio de Acceso', zh: '管理员权限变更' },
  'ADMIN_USER_BLOCK': { en: 'Access Restricted', es: 'Acceso Restringido', zh: '管理员封禁操作' },
  'USER_FEEDBACK_REPORT': { en: 'Anomaly Report', es: 'Informe de Anomalía', zh: '用户提交异常反馈' },
  'USER_FEEDBACK_SUGGESTION': { en: 'Function Suggestion', es: 'Sugerencia de Función', zh: '用户提交功能建议' },
  'USER_FEEDBACK_IMPROVEMENT': { en: 'Improvement Proposal', es: 'Propuesta de Mejora', zh: '用户提交改进方案' }
};

const SOURCE_MAPPING: Record<string, string> = {
  'ADMIN_CONSOLE': '🖥️ Admin Console | 管理后台',
  'USER_TERMINAL': '🧪 User Terminal | 用户终端',
  'SYSTEM_LOGIC': '⚙️ System Logic | 系统逻辑',
  'AI_WEBHOOK': '🤖 AI Webhook | 机器人交互'
};

export const emailService = {
  /**
   * Dispatches a mirrored alert to the admin email with Source context.
   */
  sendAdminAlert: async (payload: { type: string; message: string; source?: string; error?: string; isPulse?: boolean }) => {
    const mytTime = getMYTTime();
    const nodeIdentity = typeof window !== 'undefined' ? window.location.hostname : 'Cloud_Edge';
    const isError = !!payload.error || payload.type.includes('FAIL') || payload.type.includes('ANOMALY') || payload.type.includes('FAILURE');
    
    const headerColor = isError ? '#ef4444' : '#818cf8';
    const icon = payload.isPulse ? '📡' : isError ? '🚨' : '🛡️';
    
    const mapping = TRANSLATIONS[payload.type] || TRANSLATIONS['SYSTEM_SIGNAL'];
    const sourceLabel = SOURCE_MAPPING[payload.source || 'SYSTEM_LOGIC'] || SOURCE_MAPPING['SYSTEM_LOGIC'];

    const html = `
      <div style="font-family: 'Inter', sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px; border-radius: 20px; border: 1px solid #1e293b;">
        <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: ${headerColor}; margin: 0;">${icon} Somno Lab Dual-Channel Dispatch</h2>
          <p style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 2px;">Global Security Mirror</p>
        </div>

        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #818cf8;">
           <span style="font-size: 11px; font-weight: bold; color: #94a3b8;">📍 SOURCE:</span>
           <code style="color: #ffffff; margin-left: 10px;">${sourceLabel}</code>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: ${headerColor}; font-size: 14px;">🇬🇧 [ENGLISH] - Event: ${mapping.en}</h3>
          <div style="font-style: italic; background: #050a1f; padding: 15px; border-radius: 10px; color: #cbd5e1; border: 1px solid #1e293b;">${payload.message}</div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: ${headerColor}; font-size: 14px;">🇪🇸 [ESPAÑOL] - Evento: ${mapping.es}</h3>
          <div style="font-style: italic; background: #050a1f; padding: 15px; border-radius: 10px; color: #cbd5e1; border: 1px solid #1e293b;">${payload.message}</div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: ${headerColor}; font-size: 14px;">🇨🇳 [中文] - 事件: ${mapping.zh}</h3>
          <div style="font-style: italic; background: #050a1f; padding: 15px; border-radius: 10px; color: #cbd5e1; border: 1px solid #1e293b;">${payload.message}</div>
        </div>

        <div style="font-size: 10px; color: #475569; border-top: 1px solid #1e293b; padding-top: 20px; text-align: center;">
          <b>NODE:</b> ${nodeIdentity} | <b>TIME:</b> ${mytTime}
        </div>
      </div>
    `;

    return await emailService.sendSystemEmail(ADMIN_EMAIL, `${icon} Lab Security Pulse: ${payload.type}`, html);
  },

  /**
   * Executes the HTTP POST request to the Vercel SMTP handler.
   */
  sendSystemEmail: async (to: string, subject: string, html: string, secret?: string) => {
    const finalSecret = secret || INTERNAL_LAB_KEY;
    try {
      console.log(`[Email_Bridge] Dispatching signal to ${to}...`);
      const response = await fetch('/api/send-system-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, secret: finalSecret }),
      });
      
      if (!response.ok) {
        const err = await response.json();
        console.error(`[Email_Bridge] Gateway Rejection: ${err.error}`);
        return { success: false, error: err.error };
      }

      console.log(`[Email_Bridge] 200 OK. Dispatch archived.`);
      return { success: true };
    } catch (e: any) {
      console.error(`[Email_Bridge] Network Failure: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
};
