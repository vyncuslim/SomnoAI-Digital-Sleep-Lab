
import { GoogleGenAI } from "@google/genai";
import { SleepRecord } from "../types.ts";

/**
 * 助手函数：按需创建 AI 实例
 * 遵循指南：不应在顶层定义模型，而是直接在调用时初始化并传递 API_KEY
 */
const getAi = () => {
  if (!process.env.API_KEY) {
    throw new Error("Missing API_KEY in environment variables.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getSleepInsight = async (data: SleepRecord): Promise<string> => {
  try {
    const ai = getAi();
    const prompt = `
      As a professional sleep lab scientist, analyze this data:
      Score: ${data.score}/100, Total Time: ${data.totalDuration}min, 
      Deep Sleep: ${data.deepRatio}%, REM: ${data.remRatio}%, Efficiency: ${data.efficiency}%, 
      Resting HR: ${data.heartRate.resting}bpm.
      
      Provide one concise, impactful, and scientific advice in Chinese.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.75,
        maxOutputTokens: 200,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    // 遵循指南：直接访问 .text 属性
    return response.text || "优化您的睡前习惯以提高深睡比例。";
  } catch (error: any) {
    console.warn("AI Insight generation failed:", error.message);
    return "已捕获最新的生理指标数据，请保持规律的作息。";
  }
};

export const chatWithCoach = async (history: { role: 'user' | 'assistant', content: string }[]): Promise<string> => {
  try {
    const ai = getAi();
    const systemInstruction = `
      You are Somno, the Lead Sleep Scientist at SomnoAI Labs.
      Your tone: Professional, concise, data-driven, and empathetic.
      Goal: Help users understand their sleep architecture and bio-hack their recovery.
      Always respond in Chinese.
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const lastUserMessage = history[history.length - 1].content;
    const response = await chat.sendMessage({ message: lastUserMessage });
    
    // 遵循指南：直接访问 .text 属性
    return response.text || "正在处理您的咨询，请稍候。";
  } catch (error: any) {
    console.error("Gemini Chat Failure:", error);
    return "由于实验云端连接波动，我暂时无法回应。请稍后再试。";
  }
};
