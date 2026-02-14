
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB - INTELLIGENT COMMAND WEBHOOK v7.0
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
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
  if (processedUpdates.size > 200) processedUpdates.delete(Array.from(processedUpdates)[0]);

  const chatId = String(message.chat.id);
  const text = message.text.trim();

  if (chatId !== ADMIN_CHAT_ID) return res.status(200).send('OK');

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `You are the SomnoAI Chief Research Officer (CRO).
    
    RESPONSE PROTOCOL (STRICT):
    - Provide response in THREE languages: 🇬🇧 [ENGLISH], 🇪🇸 [ESPAÑOL], 🇨🇳 [中文].
    - ALWAYS prefix the response with source tag: 📍 <b>SOURCE:</b> <code>🤖 AI Webhook | 机器人交互</code>`;

    const response = await ai.models.generateContent({
        // FIX: Updated model name to gemini-2.5-pro for production stability as per project requirements
        model: "gemini-2.5-pro",
        contents: [{ parts: [{ text: `Admin Input: ${text}` }] }],
        config: { systemInstruction }
    });

    const aiOutput = response.text || "📍 <b>SOURCE:</b> <code>🤖 AI Webhook</code>\n⚠️ Timeout.";

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

    return res.status(200).send('OK');
  } catch (err) {
    return res.status(200).send('OK');
  }
}
