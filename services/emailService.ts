
import { getMYTTime } from './telegramService.ts';

/**
 * SOMNO LAB EMAIL BRIDGE v10.0
 * Protocol: Identity-Aware Multi-lingual Content Translation
 */

const ADMIN_EMAIL = 'ongyuze1401@gmail.com';
const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

const EVENT_MAP: Record<string, { en: string, es: string, zh: string }> = {
  'RUNTIME_ERROR': { en: 'System Exception', es: 'Excepción del Sistema', zh: '系统运行异常' },
  'USER_LOGIN': { en: 'Identity Access Verified', es: 'Acceso Verificado', zh: '身份访问验证通过' },
  'USER_SIGNUP': { en: 'New Subject Node', es: 'Nuevo Nodo de Sujeto', zh: '新受试者注册' },
  'USER_LOGOUT': { en: 'Session Terminated', es: 'Sesión Terminada', zh: '用户登出' },
  'SECURITY_BREACH_ATTEMPT': { en: 'Unauthorized Ingress', es: 'Ingreso no Autorizado', zh: '未经授权的入侵尝试' },
  'PULSE_STABLE': { en: 'Neural Handshake Stable', es: 'Handshake Estable', zh: '系统脉搏稳定' },
  'PULSE_ANOMALY': { en: 'Grid Anomaly Detected', es: 'Anomalía de Red Detectada', zh: '检测到网格异常' },
  'DIARY_LOG_ENTRY': { en: 'Biological Log Entry', es: 'Entrada de Registro Bio', zh: '生物日志更新' },
  'GA4_SYNC_FAILURE': { en: 'Telemetry Sync Failure', es: 'Fallo de Sincronización', zh: 'GA4 同步失败' },
  'PW_UPDATE_SUCCESS': { en: 'Access Key Rotated', es: 'Clave de Acceso Rotada', zh: '访问密钥已轮换' },
  'SYSTEM_SIGNAL': { en: 'System Signal Detected', es: 'Señal del Sistema Detectada', zh: '监测到系统信号' }
};

// 邮件端内容翻译器
const translateMailContent = (text: string, lang: 'en' | 'es' | 'zh'): string => {
  let result = text;
  if (text.includes('Access verified for:')) {
    const email = text.split('verified for:')[1]?.trim() || 'Unknown';
    if (lang === 'zh') result = `【系统确认】访问权限已对受试者开放: ${email}`;
    if (lang === 'es') result = `【CONFIRMADO】Acceso concedido al nodo: ${email}`;
    if (lang === 'en') result = `【VERIFIED】Access granted to node: ${email}`;
  }
  
  result = result.replace(/\[IDENTITY: ADMIN\]/g, lang === 'zh' ? '管理员' : lang === 'es' ? 'Administrador' : 'Admin');
  result = result.replace(/\[IDENTITY: OWNER\]/g, lang === 'zh' ? '系统主负责人' : lang === 'es' ? 'Propietario' : 'Owner');
  
  return result;
};

export const emailService = {
  sendAdminAlert: async (payload: { type: string; message: string; source?: string; error?: string; isPulse?: boolean }) => {
    const mytTime = getMYTTime();
    const nodeIdentity = typeof window !== 'undefined' ? window.location.hostname : 'Cloud_Edge';
    const isError = !!payload.error || payload.type.includes('FAIL') || payload.type.includes('ANOMALY');
    const rawDetails = payload.message || 'N/A';
    
    const isAdmin = rawDetails.includes('IDENTITY: ADMIN') || rawDetails.includes('IDENTITY: OWNER');
    const sourceLabel = isAdmin ? '🖥️ Admin Console | 管理后台' : (payload.source || '🧪 User Terminal | 用户终端');

    const mapping = EVENT_MAP[payload.type] || EVENT_MAP['SYSTEM_SIGNAL'];
    const headerColor = isError ? '#ef4444' : (isAdmin ? '#f59e0b' : '#818cf8');
    const icon = payload.isPulse ? '📡' : isError ? '🚨' : (isAdmin ? '👑' : '🛡️');

    const html = `
      <div style="font-family: 'Inter', sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px; border-radius: 20px; border: 1px solid #1e293b;">
        <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: ${headerColor}; margin: 0;">${icon} Somno Lab Dual-Channel Dispatch</h2>
          <p style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 2px;">Identity Sovereign Mirror</p>
        </div>

        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid ${headerColor};">
           <span style="font-size: 11px; font-weight: bold; color: #94a3b8;">📍 SOURCE:</span>
           <code style="color: #ffffff; margin-left: 10px;">${sourceLabel}</code>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: ${headerColor}; font-size: 14px; margin-bottom: 5px;">🇬🇧 [ENGLISH] - Event: ${mapping.en}</h3>
          <div style="font-style: italic; background: #050a1f; padding: 12px; border-radius: 8px; color: #cbd5e1; border: 1px solid #1e293b;">
            ${translateMailContent(rawDetails, 'en')}
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: ${headerColor}; font-size: 14px; margin-bottom: 5px;">🇪🇸 [ESPAÑOL] - Evento: ${mapping.es}</h3>
          <div style="font-style: italic; background: #050a1f; padding: 12px; border-radius: 8px; color: #cbd5e1; border: 1px solid #1e293b;">
            ${translateMailContent(rawDetails, 'es')}
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: ${headerColor}; font-size: 14px; margin-bottom: 5px;">🇨🇳 [中文] - 事件: ${mapping.zh}</h3>
          <div style="font-style: italic; background: #050a1f; padding: 12px; border-radius: 8px; color: #cbd5e1; border: 1px solid #1e293b;">
            ${translateMailContent(rawDetails, 'zh')}
          </div>
        </div>

        <div style="font-size: 10px; color: #475569; border-top: 1px solid #1e293b; padding-top: 20px; text-align: center;">
          <b>NODE:</b> ${nodeIdentity} | <b>TIME:</b> ${mytTime}
        </div>
      </div>
    `;

    return await emailService.sendSystemEmail(ADMIN_EMAIL, `${icon} Lab Pulse: ${payload.type}`, html);
  },

  sendSystemEmail: async (to: string, subject: string, html: string, secret?: string) => {
    const finalSecret = secret || INTERNAL_LAB_KEY;
    try {
      const response = await fetch('/api/send-system-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, secret: finalSecret }),
      });
      return { success: response.ok };
    } catch (e: any) {
      console.warn(`[Email_Bridge] Gateway unreachable.`);
      return { success: false, error: e.message };
    }
  }
};
