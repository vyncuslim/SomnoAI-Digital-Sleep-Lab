/**
 * SOMNO LAB VERTEX SERVICE
 * Handles communication with the local secure API bridge.
 */

export const vertexService = {
  /**
   * Sends telemetry or text data to the Vertex AI secure bridge.
   * @param data The payload to analyze (string or structured object)
   * @param modelId Optional specific model deployment ID
   */
  analyze: async (data: any, modelId?: string): Promise<string> => {
    try {
      const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inputData: data,
          secret: INTERNAL_LAB_KEY,
          modelId
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "VERTEX_BRIDGE_UNREACHABLE");
      }

      const json = await response.json();
      
      // Extraction logic for multiple Vertex response formats
      const result = json.result;

      // Format A: Standard Gemini Predict structure
      if (result?.predictions?.[0]?.content) {
        return result.predictions[0].content;
      }
      
      // Format B: Direct text generation parts
      if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return result.candidates[0].content.parts[0].text;
      }

      // Format C: General Prediction output
      if (Array.isArray(result?.predictions)) {
        return typeof result.predictions[0] === 'string' 
          ? result.predictions[0] 
          : JSON.stringify(result.predictions[0], null, 2);
      }
      
      return "Synthesis complete. Node signal processed without textual residue.";
      
    } catch (error) {
      console.error("[Vertex Frontend Service Error]:", error);
      throw error;
    }
  }
};