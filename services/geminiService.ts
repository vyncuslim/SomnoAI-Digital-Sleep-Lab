import { GoogleGenAI, Type } from "@google/genai";
import { SleepRecord } from "../types.ts";
import { Language } from "./i18n.ts";

export interface BiologicalReport {
  summary: string;
  patterns: string[];
  protocolChanges: string[];
}

const getAIClient = () => {
  /**
   * FIXED: Guidelines enforce exclusive use of process.env.API_KEY.
   * Assume pre-configured and valid.
   */
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Use stable production models instead of previews for system logic paths
const MODEL_PRO = 'gemini-2.5-pro';
const MODEL_FLASH = 'gemini-2.5-flash';

/**
 * 核心功能：对多日睡眠数据进行深度趋势分析
 * 启用 thinkingBudget 以获得更高质量的神经科学洞察
 */
export const analyzeBiologicalTrends = async (
  history: SleepRecord[], 
  lang: Language = 'zh'
): Promise<BiologicalReport> => {
  const ai = getAIClient();
  const dataSummary = history.map(h => 
    `Date:${h.date}, Score:${h.score}, Deep:${h.deepRatio}%, RHR:${h.heartRate.resting}bpm`
  ).join('\n');

  const systemInstruction = `你是 SomnoAI 首席研究官 (CRO)。分析受试者的多日生物遥测数据。
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
        // Enable advanced reasoning for CRO analysis
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
    // Access .text property directly (not a method)
    return JSON.parse(response.text || "{}") as BiologicalReport;
  } catch (err) {
    console.error("Neural Analysis Failed:", err);
    throw err;
  }
};

/**
 * 增强型流式教练：注入历史数据作为长期上下文
 */
export const startContextualCoach = async (
  history: { role: string; content: string }[], 
  records: SleepRecord[],
  lang: Language = 'zh'
) => {
  const ai = getAIClient();
  
  const bioBrief = records.slice(0, 5).map(r => 
    `${r.date}: Score ${r.score}, Deep ${r.deepRatio}%`
  ).join(' | ');

  const systemInstruction = `你是 SomnoAI 首席研究官 (CRO)。
  已知受试者近期数据: ${bioBrief}
  你拥有访问最新睡眠研究的权限（使用 Google 搜索）和地点查找权限（使用 Google 地图）。
  语气：高度专业、冷静、具有预见性。
  回复语言：${lang}。`;

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
        // Using high-performance reasoning for chat
        thinkingConfig: { thinkingBudget: 2000 },
        tools: [{ googleSearch: {} }, { googleMaps: {} }] 
      }
    });
  } catch (err: any) {
    console.error("Neural Handshake Failure:", err);
    throw err;
  }
};

/**
 * 快速生成实验协议 (基于单日数据)
 */
export const getQuickInsight = async (data: SleepRecord, lang: Language = 'zh'): Promise<string[]> => {
  const ai = getAIClient();
  const prompt = `分析数据：分数 ${data.score}, RHR ${data.heartRate.resting}bpm。给出3条极其精简的优化方案（JSON 数组）。`;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    // Access .text property directly
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

/**
 * 实验协议生成：基于受试者生理基准设计干预实验
 */
export const designExperiment = async (
  data: SleepRecord,
  lang: Language = 'zh'
): Promise<SleepExperiment> => {
  const ai = getAIClient();
  const prompt = `基于以下受试者数据设计一个为期 3 天的睡眠优化实验：
  分数: ${data.score}, 
  总时长: ${data.totalDuration} 分钟, 
  深睡比例: ${data.deepRatio}%, 
  静息心率: ${data.heartRate.resting}bpm。
  
  请提供：
  1. 神经科学假设 (hypothesis)
  2. 3 步实验协议 (protocol)
  3. 预期的恢复影响 (expectedImpact)
  语言：${lang === 'zh' ? '中文' : 'English'}`;

  const systemInstruction = "你是 SomnoAI 首席研究官 (CRO)。你擅长基于生理数据设计精密的神经科学实验。输出必须为 JSON 格式。";

  try {
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
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
    // Access .text property directly
    return JSON.parse(response.text || "{}") as SleepExperiment;
  } catch (err) {
    console.error("Experiment Synthesis Failure:", err);
    throw err;
  }
};