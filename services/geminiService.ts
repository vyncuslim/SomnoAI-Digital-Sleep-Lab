
import { GoogleGenAI, Type } from "@google/genai";
import { SleepRecord } from "../types.ts";

// 辅助函数：安全地获取 AI 实例，防止顶层访问 process 导致的崩溃
const getAiInstance = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const getSleepInsight = async (data: SleepRecord): Promise<string> => {
  try {
    const ai = getAiInstance();
    const prompt = `
      As a world-class sleep scientist, provide a single, punchy, and highly actionable sentence of insight based on these metrics:
      Sleep Score: ${data.score}/100
      Total Duration: ${Math.floor(data.totalDuration / 60)}h ${data.totalDuration % 60}m
      Stages: ${data.stages.map(s => `${s.name}: ${s.duration}m`).join(', ')}
      Resting Heart Rate: ${data.heartRate.resting} BPM.
      
      Keep it encouraging and scientific.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 60,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "倾听身体的律动；高质量睡眠是卓越表现的基石。";
  } catch (error: any) {
    if (error.message === "API_KEY_MISSING") {
      return "请在设置中配置 Gemini API Key 以激活 AI 深度洞察。";
    }
    console.error("Gemini Insight Error:", error);
    return "正在分析您的模式... 请继续保持规律的作息。";
  }
};

export const chatWithCoach = async (history: { role: 'user' | 'assistant', content: string }[]): Promise<string> => {
  try {
    const ai = getAiInstance();
    const model = 'gemini-3-flash-preview';
    const systemInstruction = `
      You are Somno, a high-performance Sleep Coach and Biohacking Expert. 
      Your goal is to help users optimize their sleep architecture (Deep, REM, Light stages).
      Use scientific terms like 'circadian rhythm', 'adenosine', 'melatonin', and 'HRV' when appropriate.
      Be empathetic, concise, and professional. Respond in Chinese.
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
    
    return response.text || "我正在处理您的信息。能告诉我更多关于您的晚间常规吗？";
  } catch (error: any) {
    if (error.message === "API_KEY_MISSING") {
      return "抱歉，我需要配置 API Key 才能开始对话。请前往“我的 - 设置”进行配置。";
    }
    console.error("Gemini Chat Error:", error);
    return "连接知识库时遇到问题，请稍后再试。";
  }
};
