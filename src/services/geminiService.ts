import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getSleepRecommendation(userData: string): Promise<string> {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide personalized sleep recommendations based on this user data: ${userData}`,
    });
    return response.text || "No recommendation available.";
  } catch (error) {
    console.error("Error generating recommendation:", error);
    throw error;
  }
}

export async function startContextualCoach(chatHistory: any[], history: any[], lang: string): Promise<any> {
  try {
    const ai = getAiInstance();
    const systemInstruction = `You are a sleep coach. Language: ${lang}. History: ${JSON.stringify(history)}`;
    
    // Convert chat history to the format expected by gemini
    const contents = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction,
      }
    });
    
    return response;
  } catch (error) {
    console.error("Error starting contextual coach:", error);
    throw error;
  }
}
