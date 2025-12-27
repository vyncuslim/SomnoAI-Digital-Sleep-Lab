
// @google/genai Gemini API configuration
import { GoogleGenAI, Type } from "@google/genai";
import { SleepRecord } from "../types.ts";

/**
 * Helper to get a fresh AI instance using process.env.API_KEY.
 * Following the guidelines: Use a new instance right before API calls.
 */
const getAi = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getSleepInsight = async (data: SleepRecord): Promise<string> => {
  try {
    const ai = getAi();
    const prompt = `
      As a world-class sleep scientist, provide a single, punchy, and highly actionable sentence of insight based on these metrics:
      Sleep Score: ${data.score}/100
      Total Duration: ${Math.floor(data.totalDuration / 60)}h ${data.totalDuration % 60}m
      Stages: ${data.stages.map(s => `${s.name}: ${s.duration}m`).join(', ')}
      Resting Heart Rate: ${data.heartRate.resting} BPM.
      
      Keep it encouraging and scientific. Respond in Chinese.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "倾听身体的律动；高质量睡眠是卓越表现的基石。";
  } catch (error: any) {
    console.warn("Insight analysis skipped:", error.message);
    // Silent fallback to avoid breaking the UI
    return "正在同步您的睡眠模式，请保持规律作息。";
  }
};

export const chatWithCoach = async (history: { role: 'user' | 'assistant', content: string }[]): Promise<string> => {
  try {
    const ai = getAi();
    const model = 'gemini-3-flash-preview';
    const systemInstruction = `
      你叫 Somno，是一位顶尖的睡眠教练和生物黑客专家。
      你的目标是帮助用户优化睡眠架构（深睡、REM、浅睡）。
      回答应简明扼要、专业且富有同理心。使用中文回答。
    `;

    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const lastUserMessage = history[history.length - 1].content;
    const response = await chat.sendMessage({ message: lastUserMessage });
    
    return response.text || "我正在分析您的情况，请稍后再试。";
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return "连接 AI 引擎时遇到一点问题，请检查网络后重试。";
  }
};
