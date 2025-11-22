import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const explainPiIrrationality = async (): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Please configure your API Key to fetch the explanation.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a long, immersive, and poetic manifesto (approx 100-150 words) about the number Pi (π). 
      Describe its irrational, infinite decimal expansion as a digital heartbeat that never repeats and never resolves.
      Connect this mathematical chaos deeply to the concept of "Techno"—a relentless, purifying rhythm that destroys negative energy through repetition and variation.
      The tone should be abstract, brutalist, mystical, and scientific. 
      Do not use standard formatting like headers. Just raw, powerful text.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, 
        temperature: 0.9,
      }
    });
    return response.text || "No explanation available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to contact the cosmic AI at this moment.";
  }
};