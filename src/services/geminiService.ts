import { GoogleGenAI } from "@google/genai";

declare var process: any;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function getSleepRecommendation(userData: string): Promise<string> {
  try {
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
