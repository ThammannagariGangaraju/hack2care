import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "dummy",
  baseURL: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
});

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!text || targetLanguage === 'en') return text;

  try {
    const response = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text into ${targetLanguage}. 
          Return ONLY the translated text without any explanations or extra characters.
          Maintain the tone and meaning of the original text.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error(`[TranslationService] Error translating to ${targetLanguage}:`, error);
    return text; // Fallback to English
  }
}
