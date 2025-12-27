
import { GoogleGenAI } from "@google/genai";
import { SleepRecord } from "../types.ts";

/**
 * 获取 AI 实例的辅助函数
 * 遵循指南：API 密钥必须排他性地从环境变量 process.env.API_KEY 获取。
 * 严禁在 UI 中提供输入字段或手动管理密钥。
 */
const getAi = () => {
  // 直接使用环境变量，不进行本地存储回退
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

export const getSleepInsight = async (data: SleepRecord): Promise<string> => {
  try {
    // 遵循指南：每次生成内容前初始化实例
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

    // 遵循指南：使用 .text 属性（非方法）获取结果
    return response.text || "倾听身体的律动；高质量睡眠是卓越表现的基石。";
  } catch (error: any) {
    console.warn("Insight skipped:", error.message);
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
    
    // 遵循指南：使用 .text 属性（非方法）获取结果
    return response.text || "我正在分析您的情况，请稍后再试。";
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return "连接 AI 引擎时遇到一点问题，请重试。";
  }
};
