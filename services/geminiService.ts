
import { GoogleGenAI } from "@google/genai";
import { SleepRecord } from "../types.ts";

const getAiClient = () => {
  // 在 Vercel 部署时，API_KEY 将从 System Environment Variables 注入
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please set it in Vercel environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getSleepInsight = async (data: SleepRecord): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `
      As a senior sleep scientist, provide a critical, data-driven insight for today:
      Total Sleep: ${Math.floor(data.totalDuration / 60)}h ${data.totalDuration % 60}m
      Deep Sleep: ${data.deepRatio}% (Ideal: 20-25%)
      REM: ${data.remRatio}% (Ideal: 20-25%)
      Resting HR: ${data.heartRate.resting} BPM.
      Efficiency: ${data.efficiency}%.

      Instructions: One sentence only. Be highly specific. Use professional yet encouraging tone. Respond in Chinese.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    });

    return response.text || "数据已更新，建议关注今晚的深睡连续性。";
  } catch (error: any) {
    console.error("Insight Generation Error:", error);
    return "AI 洞察暂时不可用，请检查网络连接或 API 配置。";
  }
};

export const chatWithCoach = async (history: { role: 'user' | 'assistant', content: string }[]): Promise<string> => {
  try {
    const ai = getAiClient();
    const systemInstruction = `
      你叫 Somno，SomnoAI 实验室的首席睡眠研究员。
      你擅长分析生理指标（HRV, 心率, 睡眠分期）并提供生物黑客式的优化方案。
      你的回答风格：严谨、极简、高效。
      始终使用中文交流，并在需要时引用最新的睡眠科学研究。
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    // 发送最后一条消息
    const lastMsg = history[history.length - 1].content;
    const response = await chat.sendMessage({ message: lastMsg });
    
    return response.text || "我还在整理您的睡眠模型，请稍后再问。";
  } catch (error: any) {
    console.error("Somno Coach Chat Error:", error);
    return "Somno 目前离线，请稍后再试。";
  }
};
