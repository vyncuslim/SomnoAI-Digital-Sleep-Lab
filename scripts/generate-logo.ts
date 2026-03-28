import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

async function generateLogo() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("No API key found");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = "A modern, minimalist, and professional logo for 'SomnoAI Digital Sleep Lab'. The logo should feature a stylized brain or a crescent moon combined with a digital circuit or AI motif. Use a color palette of deep navy blue (#0f172a) and vibrant orange (#f97316). High resolution, centered on a white background.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        const buffer = Buffer.from(base64Data, 'base64');
        const outputPath = path.join(process.cwd(), 'public', 'logo_512.png');
        fs.writeFileSync(outputPath, buffer);
        console.log(`Logo generated and saved to ${outputPath}`);
        return;
      }
    }
    console.error("No image data found in response");
  } catch (error) {
    console.error("Error generating logo:", error);
    process.exit(1);
  }
}

generateLogo();
