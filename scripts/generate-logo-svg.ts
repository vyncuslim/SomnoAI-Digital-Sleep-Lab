import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

async function generateLogoSvg() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("No API key found");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = "Generate a clean, modern, and professional SVG code for a logo for 'SomnoAI Digital Sleep Lab'. The logo should be minimalist, featuring a stylized brain or a crescent moon combined with a digital circuit or AI motif. Use a color palette of deep navy blue (#0f172a) and vibrant orange (#f97316). The SVG should be 512x512 pixels. Return ONLY the SVG code, no markdown, no explanations.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview',
      contents: prompt,
    });

    const svgCode = response.text.trim().replace(/^```svg\n?/, '').replace(/\n?```$/, '');
    const outputPath = path.join(process.cwd(), 'public', 'logo.svg');
    fs.writeFileSync(outputPath, svgCode);
    console.log(`Logo SVG generated and saved to ${outputPath}`);
  } catch (error) {
    console.error("Error generating logo SVG:", error);
    process.exit(1);
  }
}

generateLogoSvg();
