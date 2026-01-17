import { GoogleGenAI, Type, Modality } from "@google/genai";
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

/**
 * API Key is obtained from process.env.API_KEY which is injected by the platform.
 */
const getGeminiApiKey = () => process.env.API_KEY;

const handleGeminiError = (err: any) => {
  console.error("Gemini API Error Context:", err);
  if (err.message?.includes("Requested entity was not found")) {
    throw new Error("KEY_INVALID_OR_NOT_FOUND");
  }
  throw err;
};

// Stable model aliases from guidelines
const MODEL_FLASH = 'gemini-flash-lite-latest'; // High speed for summary
const MODEL_PRO = 'gemini-3-pro-preview';       // Reasoning for analysis
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export const getSleepInsight = async (data: SleepRecord, lang: Language = 'en'): Promise<string[]> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");
  
  const prompt = `你是一位世界级的数字睡眠科学家与首席生物黑客。请根据以下高精度生理遥测指标进行深度神经分析。
    必须返回一个包含 3 条专业字符串的 JSON 数组，语言为 ${lang === 'zh' ? '中文' : '英文'}。
    1. 神经架构分析：基于深度与 REM 比例分析大脑清理效率与记忆巩固状态。
    2. 生物节律诊断：评估静息心率 (RHR) 与睡眠分数的关联，预测今日认知负荷。
    3. 战术性生物黑客建议：针对性提供一项今日可立即执行的生理优化方案（如特定波长光照、温度调节或摄入建议）。
    
    指标数据: 评分 ${data.score}, 深度 ${data.deepRatio}%, REM ${data.remRatio}%, 效率 ${data.efficiency}%, 静息心率 ${data.heartRate?.resting}bpm。`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: { 
        temperature: 0.75,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (err) {
    handleGeminiError(err);
    return [];
  }
};

export const chatWithCoach = async (
  history: { role: string; content: string }[], 
  lang: Language = 'en',
  contextData?: SleepRecord | null
) => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");
  
  let biometricContext = "";
  if (contextData) {
    biometricContext = lang === 'en' 
      ? `\nCURRENT LAB TELEMETRY: Subject Score: ${contextData.score}/100, Deep Neural Recovery: ${contextData.deepRatio}%, Biological Efficiency: ${contextData.efficiency}%.`
      : `\n当前实验室遥测: 主体评分: ${contextData.score}/100, 深度神经修复: ${contextData.deepRatio}%, 生物效能: ${contextData.efficiency}%.`;
  }

  const systemInstruction = lang === 'en' 
    ? `You are the Somno Chief Research Officer (CRO). Professional, data-driven, and slightly futuristic. Use advanced reasoning to provide ultra-precise health guidance. Always reference physiological metrics when available. ${biometricContext}`
    : `你是 Somno 首席研究官 (CRO)。专业、以数据为导向且极具未来感。利用高级推理提供精确的健康指导。在可能的情况下，始终引用生理指标。 ${biometricContext}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const lastMessage = history[history.length - 1].content;
    const chatHistory = history.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: lastMessage }] }
      ],
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 32768 } 
      }
    });
    return {
      text: response.text || (lang === 'en' ? "Synthesis interrupted." : "合成中断。"),
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (err) {
    handleGeminiError(err);
  }
};

export const designExperiment = async (data: SleepRecord, lang: Language = 'en'): Promise<SleepExperiment> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");
  
  const prompt = `设计一个 24 小时数字睡眠实验方案。基于生理指标: 评分 ${data.score}, 深度 ${data.deepRatio}%, RHR ${data.heartRate?.resting}bpm。语言: ${lang === 'zh' ? '中文' : '英文'}。要求包含科学假设、严谨步骤和预期生物学影响。`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
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
  } catch (err) {
    handleGeminiError(err);
    throw err;
  }
};

export const getWeeklySummary = async (history: SleepRecord[], lang: Language = 'en'): Promise<string> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");
  
  const dataSummary = history.slice(0, 7).map(h => ({ date: h.date, score: h.score }));
  const prompt = `作为睡眠科学家分析这些历史趋势并提供简洁的 2 句话总结报告。语言: ${lang === 'zh' ? '中文' : '英文'}。数据: ${JSON.stringify(dataSummary)}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: { temperature: 0.5 }
    });
    return response.text || "Mapping failed.";
  } catch (err) {
    handleGeminiError(err);
    return "Error generating summary.";
  }
};

/**
 * Generate a personalized neural lullaby using the Gemini 2.5 Flash TTS model.
 */
export const generateNeuralLullaby = async (data: SleepRecord, lang: Language = 'en'): Promise<string | undefined> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");

  const prompt = lang === 'en' 
    ? `Speak softly, almost whispering, like a Zen master. Based on a sleep score of ${data.score}/100, provide a 40-second neural guided meditation. Start with deep breathing cues.`
    : `语气极度轻柔，像禅修大师一样低语。根据睡眠分数 ${data.score}/100，提供一段 40 秒的神经放松引导。以深呼吸指令开始。`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (err) {
    console.error("Neural Audio Synthesis Error:", err);
    return undefined;
  }
};

// Audio Decoding Helpers
export const decodeBase64Audio = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};
