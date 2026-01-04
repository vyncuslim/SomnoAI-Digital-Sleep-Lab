import { GoogleGenAI } from "@google/genai";
import { SleepRecord } from "../types.ts";

export const getSleepInsight = async (data: SleepRecord): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY_MISSING");

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `分析睡眠数据并给出一条极简中文建议（20字内）：
    得分: ${data.score}, 时长: ${data.totalDuration}min, 
    深睡: ${data.deepRatio}%, REM: ${data.remRatio}%, 心率: ${data.heartRate?.resting || 65}bpm。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "保持规律的睡眠节奏是改善质量的基础。";
  } catch (error: any) {
    console.error("Sleep Insight AI Error:", error);
    return "系统分析中。建议睡前一小时保持环境昏暗。";
  }
};

export const getWeeklySummary = async (history: SleepRecord[]): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY_MISSING");
    if (history.length === 0) return "暂无历史数据。";

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `分析睡眠历史趋势并提供简短中文总结：${JSON.stringify(history.map(h => ({ score: h.score, date: h.date })))}。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "趋势分析显示您的睡眠质量处于稳定区间。";
  } catch (error) {
    console.error("Weekly Summary AI Error:", error);
    return "暂无法生成趋势摘要，请确保有足够的采样数据。";
  }
};

export const chatWithCoach = async (history: { role: 'user' | 'assistant', content: string }[]): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY_MISSING");

    const ai = new GoogleGenAI({ apiKey });
    
    // 构造符合逻辑的上下文提示
    const systemInstruction = "你是 SomnoAI 实验室的首席科研官。你冷静、专业、严谨。请用简短的中文回答用户的睡眠疑问。如果用户输入模糊或过短，请引导其提供更多细节。";
    const lastUserMessage = history[history.length - 1].content;
    
    // 拼接历史对话以维持上下文连贯性
    const historyText = history.slice(0, -1).map(m => `${m.role === 'user' ? '用户' : '科研官'}: ${m.content}`).join('\n');
    const fullPrompt = `${systemInstruction}\n\n历史背景:\n${historyText}\n\n当前用户消息: ${lastUserMessage}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: fullPrompt,
      config: { 
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    return response.text || "收到指令。当前输入信号较弱，请提供更多关于您睡眠感受的详细描述。";
  } catch (error: any) {
    console.error("AI Coach Error Details:", error);
    if (error.message === "API_KEY_MISSING") {
      return "实验室密钥尚未就绪。请检查环境变量或 API 配置。";
    }
    // 针对用户输入的 "w、" 等简短内容可能引发的异常进行友好提示
    return "实验室网关响应异常。这通常是因为输入信号（如：“w、”）过于简短，导致 AI 引擎无法构建有效的解析图谱。请尝试输入更具体的问题。";
  }
};