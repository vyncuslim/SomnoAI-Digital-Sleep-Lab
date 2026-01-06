
import { GoogleGenAI, Type } from "@google/genai";
import { SleepRecord, AIProvider } from "../types.ts";
import { Language } from "./i18n.ts";

export interface SleepExperiment {
  hypothesis: string;
  protocol: string[];
  expectedImpact: string;
}

const getAIProvider = (): AIProvider => {
  return (localStorage.getItem('somno_ai_provider') as AIProvider) || 'gemini';
};

const getOpenAIKey = () => (window as any).process?.env?.OPENAI_API_KEY || (process.env as any).OPENAI_API_KEY;

/**
 * OpenAI API 通讯模块 - 使用标准 Fetch API 实现
 */
const callOpenAI = async (prompt: string, systemInstruction?: string, isJson: boolean = false) => {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error("OpenAI API Key missing");

  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        response_format: isJson ? { type: "json_object" } : { type: "text" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "OpenAI API Failure");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err: any) {
    console.error("OpenAI Call Error:", err);
    throw err;
  }
};

export const getSleepInsight = async (data: SleepRecord, lang: Language = 'en'): Promise<string[]> => {
  const provider = getAIProvider();
  const prompt = `你是一位世界级的睡眠科学家。请根据以下生理指标进行高精度分析。
    必须返回一个包含 3 条字符串的 JSON 数组，语言为 ${lang === 'zh' ? '中文' : '英文'}。
    1. 生理信号分析（深度/REM 睡眠架构分析）。
    2. 认知/心理状态预测。
    3. 针对今日的战术性生物黑客建议。
    
    指标数据: 评分 ${data.score}, 深度 ${data.deepRatio}%, REM ${data.remRatio}%, 效率 ${data.efficiency}%, 静息心率 ${data.heartRate?.resting}bpm。`;

  try {
    if (provider === 'openai') {
      const result = await callOpenAI(prompt + " 请仅返回原始 JSON 数组，不要包含 Markdown 代码块标记。", "You are a specialized Sleep Scientist. Always output valid JSON arrays.", true);
      const parsed = JSON.parse(result || "[]");
      // 处理 OpenAI 可能返回的对象格式
      return Array.isArray(parsed) ? parsed : (parsed.insights || parsed.results || Object.values(parsed));
    } else {
      // Use process.env.API_KEY directly as per @google/genai guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          temperature: 0.8,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    }
  } catch (err: any) {
    console.error("AI Insight Error:", err);
    return lang === 'en' 
      ? ["Insight synthesis temporarily offline.", "Biometric telemetry link stable.", "Awaiting next data stream for analysis."] 
      : ["洞察合成暂时离线。", "生物识别遥测链路稳定。", "等待下一流数据进行分析。"];
  }
};

export const designExperiment = async (data: SleepRecord, lang: Language = 'en'): Promise<SleepExperiment> => {
  const provider = getAIProvider();
  const prompt = `作为首席研究官，请根据受试者的最新指标设计一个 24 小时数字睡眠实验方案。
    当前数据: 评分 ${data.score}, 深度 ${data.deepRatio}%, 静息心率 ${data.heartRate?.resting}bpm。
    输出语言: ${lang === 'zh' ? '中文' : '英文'}。
    必须返回 JSON 格式，包含键: hypothesis (string), protocol (string array), expectedImpact (string)。`;

  try {
    if (provider === 'openai') {
      const result = await callOpenAI(prompt, "You are a Chief Research Officer designing scientific protocols.", true);
      return JSON.parse(result || "{}");
    } else {
      // Use process.env.API_KEY directly and gemini-3-pro-preview for complex reasoning
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hypothesis: { type: Type.STRING },
              protocol: { type: Type.ARRAY, items: { type: Type.STRING } },
              expectedImpact: { type: Type.STRING }
            },
            required: ["hypothesis", "protocol", "expectedImpact"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    }
  } catch (err) {
    throw err;
  }
};

export const chatWithCoach = async (
  history: { role: string; content: string }[], 
  lang: Language = 'en',
  contextData?: SleepRecord | null
) => {
  const provider = getAIProvider();
  let biometricContext = "";
  if (contextData) {
    biometricContext = lang === 'en' 
      ? `\nCURRENT USER BIOMETRICS: Date: ${contextData.date}, Sleep Score: ${contextData.score}/100, Deep Sleep: ${contextData.deepRatio}%, REM Sleep: ${contextData.remRatio}%, Efficiency: ${contextData.efficiency}%, Resting HR: ${contextData.heartRate.resting}bpm.`
      : `\n当前用户生物识别数据: 日期: ${contextData.date}, 睡眠分数: ${contextData.score}/100, 深睡: ${contextData.deepRatio}%, REM 睡眠: ${contextData.remRatio}%, 效率: ${contextData.efficiency}%, 静息心率: ${contextData.heartRate.resting}bpm。`;
  }

  const systemInstruction = lang === 'en' 
    ? `You are the Somno Chief Research Officer (CRO), a world-class AI Sleep Coach. You are professional, scientific, and data-driven. Your goal is to guide the user through their physiological data and provide actionable health protocols. ${biometricContext}`
    : `你是 Somno 首席研究官 (CRO)，世界级的 AI 睡眠教练。你专业、科学并以数据为导向。你的目标是指导用户了解其生理数据并提供可执行的健康方案。 ${biometricContext}`;

  try {
    if (provider === 'openai') {
      const apiKey = getOpenAIKey();
      const messages = history.map(m => ({ 
        role: m.role === 'assistant' ? 'assistant' : 'user', 
        content: m.content 
      }));
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "system", content: systemInstruction }, ...messages],
          temperature: 0.75
        })
      });
      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        sources: []
      };
    } else {
      // Correct Gemini initialization and call for chat with search grounding
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chatHistory = history.slice(0, -1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
      const lastMessage = history[history.length - 1].content;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          ...chatHistory,
          { role: 'user', parts: [{ text: lastMessage }] }
        ],
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0.75,
        }
      });
      return {
        text: response.text || (lang === 'en' ? "Synthesis failed." : "合成失败。"),
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    }
  } catch (err: any) {
    throw err;
  }
};

/**
 * Generate a summary report of the user's sleep trends over time.
 */
export const getWeeklySummary = async (history: SleepRecord[], lang: Language = 'en'): Promise<string> => {
  const provider = getAIProvider();
  const dataSummary = history.slice(0, 7).map(h => ({
    date: h.date,
    score: h.score,
    efficiency: h.efficiency,
    deepRatio: h.deepRatio,
    remRatio: h.remRatio,
    restingHR: h.heartRate.resting
  }));

  const prompt = `As a world-class Sleep Scientist, analyze the following sleep trend data from the past ${history.length} days and provide a concise, high-level summary of the findings (about 2-3 sentences).
    Focus on the correlation between sleep score trends, resting heart rate stabilization, and overall sleep architecture.
    Language: ${lang === 'zh' ? 'Chinese' : 'English'}.
    
    Data: ${JSON.stringify(dataSummary)}`;

  try {
    if (provider === 'openai') {
      return await callOpenAI(prompt, "You are a Sleep Scientist providing high-level reports.");
    } else {
      // Using gemini-3-pro-preview for high-quality reasoning and analysis
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || (lang === 'en' ? "Trend analysis unavailable." : "趋势分析不可用。");
    }
  } catch (err: any) {
    console.error("Weekly Summary Error:", err);
    return lang === 'en' ? "Failed to synthesize trend report." : "无法合成趋势报告。";
  }
};
