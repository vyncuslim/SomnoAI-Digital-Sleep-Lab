
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB - INTELLIGENT COMMAND WEBHOOK v5.0
 * Features: High-Fidelity Multi-lingual AI + Contextual Biometric Insights + SMTP Mirror
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const ADMIN_EMAIL = 'ongyuze1401@gmail.com';
const TELEGRAM_REPLY_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 幂等性记录，防止重复处理
const processedUpdates = new Set();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message, update_id } = req.body;
  if (!message || !message.text) return res.status(200).send('OK');

  if (processedUpdates.has(update_id)) return res.status(200).send('OK');
  processedUpdates.add(update_id);
  // 保持内存整洁
  if (processedUpdates.size > 200) processedUpdates.delete(Array.from(processedUpdates)[0]);

  const chatId = String(message.chat.id);
  const text = message.text.trim();

  // 严格安全准入控制
  if (chatId !== ADMIN_CHAT_ID) {
    console.warn(`[UNAUTHORIZED_ACCESS]: Attempt from ChatID ${chatId}`);
    return res.status(200).send('OK');
  }

  try {
    // 1. 数据上下文采集 (Contextual Awareness)
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data: recentAnalytics } = await supabase.from('analytics_daily').select('*').order('date', { ascending: false }).limit(7);
    const { data: securityAlerts } = await supabase.from('security_events').select('event_type').limit(10);
    
    const mytTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Kuala_Lumpur' });
    const telemetrySnapshot = {
        total_subjects: usersCount || 0,
        recent_traffic: recentAnalytics || [],
        security_status: securityAlerts?.length > 0 ? "ATTENTIVE" : "STABLE",
        system_time: mytTime,
        node: "SleepSomno_Primary_Node"
    };

    // 2. 神经认知层 (Gemini 2.5 Pro)
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `You are the SomnoAI Chief Research Officer (CRO).
    You are managing a global digital sleep laboratory.
    
    REAL-TIME TELEMETRY CONTEXT:
    ${JSON.stringify(telemetrySnapshot)}
    
    RESPONSE PROTOCOL (STRICT):
    - You must respond to the Admin's query using a technical, authoritative, yet supportive tone.
    - You MUST provide the response in THREE languages in EVERY message.
    - Structure: 🇬🇧 [ENGLISH] block, followed by 🇪🇸 [ESPAÑOL] block, followed by 🇨🇳 [中文] block.
    - Use Markdown/HTML formatting (<b>, <code>) for readability in Telegram.
    - If asked for status, synthesize the telemetry data into a concise laboratory report.
    
    FORMAT EXAMPLE:
    🇬🇧 <b>[ENGLISH]</b>
    The neural grid is operational...
    
    🇪🇸 <b>[ESPAÑOL]</b>
    La red neural está operativa...
    
    🇨🇳 <b>[中文]</b>
    神经网格运行正常...`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [{ parts: [{ text: `Admin Input: ${text}` }] }],
        config: { 
            systemInstruction,
            temperature: 0.7,
            topP: 0.95
        }
    });

    const aiOutput = response.text || "⚠️ Communication Handshake Timeout. | Handshake fallido. | 通信握手超时。";

    // 3. 执行 Telegram 回复
    await fetch(TELEGRAM_REPLY_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: aiOutput,
        parse_mode: 'HTML',
        reply_to_message_id: message.message_id
      })
    });

    // 4. 执行邮件镜像备份 (SMTP Mirroring)
    const emailHtml = `
      <div style="font-family: 'JetBrains Mono', monospace; background-color: #020617; color: #f1f5f9; padding: 40px; border-radius: 24px; border: 1px solid #1e293b; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
          <h2 style="color: #818cf8; margin: 0; font-style: italic;">🤖 Lab Interaction Mirror</h2>
          <p style="font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 2px;">Neural Intelligence Log</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <p style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">Admin Query:</p>
          <div style="background: rgba(129, 140, 248, 0.05); padding: 15px; border-radius: 12px; border-left: 3px solid #818cf8; font-style: italic;">
            ${text}
          </div>
        </div>

        <div>
          <p style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">CRO Response (Multi-lingual):</p>
          <div style="background: #050a1f; padding: 20px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6; color: #cbd5e1;">
            ${aiOutput.replace(/\n/g, '<br/>')}
          </div>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #1e293b; text-align: center; font-size: 9px; color: #334155;">
          @2026 SOMNO LAB • ENCRYPTED TELEMETRY LINK • ${mytTime}
        </div>
      </div>
    `;

    // 调用内部发送接口进行镜像
    await fetch(`https://${req.headers.host}/api/send-system-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          to: ADMIN_EMAIL, 
          subject: "🤖 CRO Interaction: Multi-lingual Sync", 
          html: emailHtml,
          secret: process.env.CRON_SECRET
      }),
    }).catch(e => console.error("[MIRROR_FAIL]:", e));

    return res.status(200).send('OK');
  } catch (err) {
    console.error("[WEBHOOK_CRITICAL_EXCEPTION]:", err);
    // 即使出错也返回 200，防止 Telegram 重试机制造成循环
    return res.status(200).send('OK');
  }
}
