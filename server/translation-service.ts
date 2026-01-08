import OpenAI from "openai";

/**
 * Translation service using Gemini AI.
 * Falls back to original text if API is unavailable or fails.
 */

// Use dummy key if real one isn't provided via Replit Integrations
const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "dummy_key";
const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: baseUrl,
});

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  // Always return original if English or empty
  if (!text || targetLanguage === 'en' || targetLanguage === 'en-US') return text;

  // Check if API integration is properly configured
  const isApiConfigured = apiKey !== "dummy_key" && !!baseUrl;

  if (!isApiConfigured) {
    console.log(`[TranslationService] API not configured, using fallback for: ${targetLanguage}`);
    return text; // Fallback to English (the original source)
  }

  try {
    // PLACEHOLDER: This is where the actual API call to the translation service would be made.
    // The Gemini model is used here as an example of a LLM-based translation.
    const response = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text into the language code: ${targetLanguage}. 
          Return ONLY the translated text without any explanations, notes, or markdown formatting.
          Maintain the tone and meaning of the original emergency first aid context.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.1,
    });

    const translated = response.choices[0]?.message?.content?.trim();
    return translated || text;
  } catch (error) {
    console.error(`[TranslationService] Error during API translation to ${targetLanguage}:`, error);
    return text; // Safe fallback to English
  }
}
