
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

export const getSleepInsight = async (data: SleepRecord, lang: Language = 'en'): Promise<string[]> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");
  
  const prompt = `你是一位世界级的睡眠科学家。请根据以下生理指标进行高精度分析。
    必须返回一个包含 3 条字符串的 JSON 数组，语言为 ${lang === 'zh' ? '中文' : '英文'}。
    1. 生理信号分析（深度/REM 睡眠架构分析）。
    2. 认知/心理状态预测。
    3. 针对今日的战术性生物黑客建议。
    
    指标数据: 评分 ${data.score}, 深度 ${data.deepRatio}%, REM ${data.remRatio}%, 效率 ${data.efficiency}%, 静息心率 ${data.heartRate?.resting}bpm。`;

  try {
    const ai = new GoogleGenAI({ apiKey });
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
      ? `\nCURRENT USER BIOMETRICS: Sleep Score: ${contextData.score}/100, Deep Sleep: ${contextData.deepRatio}%, Efficiency: ${contextData.efficiency}%.`
      : `\n当前用户生物数据: 睡眠分数: ${contextData.score}/100, 深睡: ${contextData.deepRatio}%, 效率: ${contextData.efficiency}%.`;
  }

  const systemInstruction = lang === 'en' 
    ? `You are the Somno Chief Research Officer (CRO), a world-class AI Sleep Coach. Professional and data-driven. Use your reasoning capabilities to provide precise answers. ${biometricContext}`
    : `你是 Somno 首席研究官 (CRO)，世界级的 AI 睡眠教练。专业并以数据为导向。利用你的推理能力提供精确的回答。 ${biometricContext}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const lastMessage = history[history.length - 1].content;
    const chatHistory = history.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

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
        thinkingConfig: { thinkingBudget: 32768 } // Enable reasoning for complex coaching
      }
    });
    return {
      text: response.text || (lang === 'en' ? "Synthesis failed." : "合成失败。"),
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (err) {
    handleGeminiError(err);
  }
};

export const designExperiment = async (data: SleepRecord, lang: Language = 'en'): Promise<SleepExperiment> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");
  
  const prompt = `设计一个 24 小时数字睡眠实验。数据: 评分 ${data.score}, 深度 ${data.deepRatio}%, RHR ${data.heartRate?.resting}bpm。语言: ${lang === 'zh' ? '中文' : '英文'}。`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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
  const prompt = `作为睡眠科学家分析这些趋势并提供 2 句话总结。语言: ${lang === 'zh' ? '中文' : '英文'}。数据: ${JSON.stringify(dataSummary)}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.7 }
    });
    return response.text || "Analysis failed.";
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
    ? `Speak softly and soothingly. Based on a sleep score of ${data.score}/100 and ${data.deepRatio}% deep sleep, provide a 30-second relaxation guidance to help the user drift off. Begin with a calming hum.`
    : `语气温柔祥和。根据睡眠分数 ${data.score}/100 和 ${data.deepRatio}% 的深睡比例，提供一段 30 秒的放松引导。以平稳的呼吸声开始。`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
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
    console.error("TTS Generation Error:", err);
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
