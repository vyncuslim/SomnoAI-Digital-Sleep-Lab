
import { GoogleGenAI } from "@google/genai";
import { SleepRecord } from "../types.ts";

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
      As a professional sleep lab scientist, analyze this comprehensive data:
      - Sleep Score: ${data.score}/100
      - Total Time: ${data.totalDuration}min
      - Deep Sleep: ${data.deepRatio}%, REM: ${data.remRatio}%
      - Efficiency: ${data.efficiency}%
      - Resting HR: ${data.heartRate.resting}bpm
      - Calories Burned (24h): ${data.calories || 'N/A'} kcal
      
      Explain how their activity level (calories) might be affecting their sleep quality and provide one scientific advice in Chinese.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.75,
        maxOutputTokens: 250,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "优化您的日常代谢水平以平衡睡眠架构。";
  } catch (error: any) {
    console.warn("AI Insight generation failed:", error.message);
    return "已捕获最新的生理指标与代谢流，请保持规律运动与作息。";
  }
};

export const chatWithCoach = async (history: { role: 'user' | 'assistant', content: string }[]): Promise<string> => {
  try {
    const ai = getAi();
    const systemInstruction = `
      You are Somno, the Lead Sleep Scientist at SomnoAI Labs.
      Your tone: Professional, concise, data-driven, and empathetic.
      Goal: Help users understand their sleep architecture and metabolic recovery.
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
    
    return response.text || "正在处理您的代谢与睡眠模型。";
  } catch (error: any) {
    console.error("Gemini Chat Failure:", error);
    return "由于实验云端连接波动，我暂时无法回应。请稍后再试。";
  }
};
