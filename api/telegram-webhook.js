
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB - MULTI-LINGUAL COMMAND WEBHOOK v3.5
 * Features: Multi-lingual AI + Mirrored Interaction Dispatch
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const ADMIN_EMAIL = 'ongyuze1401@gmail.com';
const TELEGRAM_REPLY_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const processedUpdates = new Set();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message, update_id } = req.body;
  if (!message || !message.text) return res.status(200).send('OK');

  if (processedUpdates.has(update_id)) return res.status(200).send('OK');
  processedUpdates.add(update_id);
  if (processedUpdates.size > 100) processedUpdates.delete(Array.from(processedUpdates)[0]);

  const chatId = String(message.chat.id);
  const text = message.text.trim();

  if (chatId !== ADMIN_CHAT_ID) return res.status(200).send('OK');

  try {
    // 1. Context Acquisition
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data: analytics } = await supabase.from('analytics_daily').select('*').order('date', { ascending: false }).limit(5);
    
    const telemetryContext = {
        total_subjects: usersCount,
        recent_traffic_data: analytics || [],
        node_url: "https://sleepsomno.com",
        current_time_myt: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Kuala_Lumpur' })
    };

    let responseText = "";

    // 2. Intelligence Execution
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemPrompt = `You are the SomnoAI Laboratory Artificial Intelligence.
    You are communicating with the System Administrator.
    
    CONTEXT DATA:
    ${JSON.stringify(telemetryContext)}
    
    RESPONSE PROTOCOL (MANDATORY):
    - You MUST provide your answer in THREE languages in every single message.
    - Format exactly as follows:
    
    🇬🇧 [ENGLISH]
    (Your concise professional answer here)
    
    🇪🇸 [ESPAÑOL]
    (Tu respuesta técnica y profesional aquí)
    
    🇨🇳 [中文]
    (在此输入您的专业回复)
    
    RULES:
    - Use the Context Data to provide factual numbers if asked about users or traffic.
    - Be technical and analytical.
    - If asked for /status, use the context to report on "Total Subjects" and "Active Telemetry".`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [{ parts: [{ text: `Admin Input: ${text}` }] }],
        config: { systemInstruction: systemPrompt }
    });

    responseText = response.text || "⚠️ [EN] Neural Void. [ES] Vacío Neural. [ZH] 神经连接断开。";

    // 3. Dual-Channel Dispatch
    
    // Telegram Dispatch
    await fetch(TELEGRAM_REPLY_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: responseText,
        parse_mode: 'HTML',
        reply_to_message_id: message.message_id
      })
    });

    // Email Mirror Dispatch
    const emailHtml = `
      <div style="font-family:sans-serif;background-color:#020617;color:#f1f5f9;padding:40px;border-radius:20px;border:1px solid #1e293b;">
        <h2 style="color:#818cf8;border-bottom:1px solid #1e293b;padding-bottom:15px;">🤖 AI INTERACTION MIRROR</h2>
        <div style="margin:25px 0;">
          <p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Admin Prompt:</p>
          <div style="background:#050a1f;padding:20px;border-radius:10px;border:1px solid #1e293b;font-style:italic;">${text}</div>
        </div>
        <div style="margin:25px 0;">
          <p style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">AI Response:</p>
          <div style="background:#0a0f25;padding:25px;border-radius:15px;border:1px solid #1e293b;line-height:1.6;color:#cbd5e1;">
            ${responseText.replace(/\n/g, '<br/>')}
          </div>
        </div>
        <p style="font-size:10px;color:#475569;margin-top:30px;text-align:center;">
          MIRRORED TELEMETRY LOG • NODE: ${req.headers.host || 'SleepSomno'} • ${telemetryContext.current_time_myt}
        </p>
      </div>
    `;

    await fetch(`https://${req.headers.host}/api/send-system-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          to: ADMIN_EMAIL, 
          subject: "🤖 Lab Interaction: AI Mirrored Response", 
          html: emailHtml,
          secret: process.env.CRON_SECRET
      }),
    }).catch(e => console.error("Email Mirror Critical Exception:", e));

    return res.status(200).send('OK');
  } catch (e) {
    console.error("AI Webhook Critical Failure:", e);
    return res.status(200).send('OK');
  }
}
