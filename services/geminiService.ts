
import { GoogleGenAI, Type } from "@google/genai";
import { SleepRecord } from "../types.ts";
import { Language } from "./i18n.ts";

export interface BiologicalReport {
  summary: string;
  patterns: string[];
  protocolChanges: string[];
}

/**
 * FIXED: Guidelines enforce exclusive process.env.API_KEY usage.
 * The API key must not be obtained from localStorage or user input.
 */
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Use stable production models instead of previews for system logic paths
const MODEL_PRO = 'gemini-2.5-pro';
const MODEL_FLASH = 'gemini-2.5-flash';
const MODEL_IMAGE = 'gemini-2.5-flash-image';
const MODEL_IMAGE_PRO = 'gemini-3-pro-image-preview';

/**
 * 核心功能：对多日睡眠数据进行深度趋势分析
 */
export const analyzeBiologicalTrends = async (
  history: SleepRecord[], 
  lang: Language = 'en'
): Promise<BiologicalReport> => {
  const ai = getAIClient();
  const dataSummary = history.map(h => 
    `Date:${h.date}, Score:${h.score}, Deep:${h.deepRatio}%, RHR:${h.heartRate.resting}bpm`
  ).join('\n');

  const systemInstruction = `你是 SomnoAI 首席研究官 (CRO)。分析受试者的多日生物遥测数据。
  数据来源：安卓 Health Connect (通过智能手表采集)。
  分析目标：提供等同于高端智能戒指 (Smart Ring) 级别的深度生理洞察。
  识别异常模式，并提供基于神经科学的建议。
  输出必须为 JSON 格式。`;

  const prompt = `分析以下受试者数据流：
  ${dataSummary}
  
  请提供：
  1. 概括性总结 (summary)
  2. 识别出的 3 个模式 (patterns)
  3. 建议的协议调整 (protocolChanges)
  语言：${lang === 'zh' ? '中文' : 'English'}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            protocolChanges: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "patterns", "protocolChanges"]
        }
      }
    });
    return JSON.parse(response.text || "{}") as BiologicalReport;
  } catch (err) {
    console.error("Neural Analysis Failed:", err);
    throw err;
  }
};

/**
 * 图像合成：基于受试者生理状态生成“梦境可视化”或“优化环境”
 */
export const synthesizeImage = async (
  prompt: string,
  highQuality: boolean = false,
  aspectRatio: "1:1" | "9:16" | "16:9" = "1:1"
): Promise<{ imageUrl: string; text?: string }> => {
  const ai = getAIClient();
  const model = highQuality ? MODEL_IMAGE_PRO : MODEL_IMAGE;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio,
          imageSize: highQuality ? "2K" : "1K"
        }
      }
    });

    let imageUrl = '';
    let text = '';

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      } else if (part.text) {
        text += part.text;
      }
    }

    if (!imageUrl) throw new Error("IMAGE_GENERATION_FAILED");
    return { imageUrl, text };
  } catch (err) {
    console.error("Image Synthesis Failed:", err);
    throw err;
  }
};

/**
 * 图像编辑：对现有环境图进行优化建议的可视化
 */
export const editImage = async (
  base64Data: string,
  mimeType: string,
  instruction: string
): Promise<{ imageUrl: string }> => {
  const ai = getAIClient();
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: instruction }
        ]
      }
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    if (!imageUrl) throw new Error("IMAGE_EDIT_FAILED");
    return { imageUrl };
  } catch (err) {
    console.error("Image Edit Failed:", err);
    throw err;
  }
};

export const startContextualCoach = async (
  history: { role: string; content: string }[], 
  records: SleepRecord[],
  lang: Language = 'en'
) => {
  const ai = getAIClient();
  const bioBrief = records.slice(0, 5).map(r => 
    `${r.date}: Score ${r.score}, Deep ${r.deepRatio}%`
  ).join(' | ');

  const systemInstruction = `你是 SomnoAI 首席研究官 (CRO)。语气：高度专业、冷静、具有预见性。回复语言：${lang}。`;

  try {
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    return await ai.models.generateContentStream({
      model: MODEL_PRO,
      contents,
      config: { 
        systemInstruction,
        thinkingConfig: { thinkingBudget: 2000 },
        tools: [{ googleSearch: {} }, { googleMaps: {} }] 
      }
    });
  } catch (err: any) {
    console.error("Neural Handshake Failure:", err);
    throw err;
  }
};

export const getQuickInsight = async (data: SleepRecord, lang: Language = 'en'): Promise<string[]> => {
  const ai = getAIClient();
  const prompt = `分析数据：分数 ${data.score}, RHR ${data.heartRate.resting}bpm。给出3条极其精简的优化方案（JSON 数组）。语言：${lang}`;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch {
    return ["正在同步神经链路..."];
  }
};

export interface SleepExperiment {
  hypothesis: string;
  protocol: string[];
  expectedImpact: string;
}

export const designExperiment = async (
  data: SleepRecord,
  lang: Language = 'en'
): Promise<SleepExperiment> => {
  const ai = getAIClient();
  const prompt = `基于以下数据 design 睡眠优化实验：分数: ${data.score}, RHR: ${data.heartRate.resting}bpm。语言：${lang}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "你是 SomnoAI 首席研究官 (CRO)。输出 JSON。",
        thinkingConfig: { thinkingBudget: 4000 },
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
    return JSON.parse(response.text || "{}") as SleepExperiment;
  } catch (err) {
    console.error("Experiment Synthesis Failure:", err);
    throw err;
  }
};
