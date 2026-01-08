/**
 * Minimal language detection utility using the Web Speech API.
 * This module is designed to be non-invasive and logs detected language codes to the console.
 */

export class LanguageDetector {
  private recognition: any;
  private isListening: boolean = false;
  private onDetected?: (lang: string) => void;
  private lastTranscript: string = "";

  constructor() {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      
      this.recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.toLowerCase().trim();
        const confidence = event.results[last][0].confidence;
        
        console.log(`[LanguageDetector] RAW Transcript: "${transcript}" (Confidence: ${confidence})`);

        if (transcript === this.lastTranscript) return;
        this.lastTranscript = transcript;

        // 1. Explicitly infer from recognition.lang if available
        let detectedLang = event.results[last].language || this.recognition.lang || "en";

        // 2. Basic heuristic for script/language detection
        const languageMap: Record<string, string> = {
          "english": "en",
          "hindi": "hi",
          "telugu": "te",
          "kannada": "kn",
          "tamil": "ta",
          "malayalam": "ml"
        };

        // Check for specific language keywords (overrides)
        let overrideLang = null;
        for (const [name, code] of Object.entries(languageMap)) {
          if (transcript.includes(name)) {
            overrideLang = code;
            break;
          }
        }

        // Script detection heuristic (very basic)
        // Devanagari (Hindi): \u0900-\u097F
        // Telugu: \u0C00-\u0C7F
        if (/[\u0900-\u097F]/.test(transcript)) detectedLang = "hi";
        else if (/[\u0C00-\u0C7F]/.test(transcript)) detectedLang = "te";

        const finalLang = overrideLang || detectedLang.split('-')[0];
        
        console.log(`[LanguageDetector] Inferred Language: ${finalLang}`);
        
        if (this.onDetected) {
          console.log(`[LanguageDetector] Triggering language switch to: ${finalLang}`);
          this.onDetected(finalLang);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('[LanguageDetector] Speech recognition error:', event.error);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          this.recognition.start(); // Auto-restart if we're supposed to be listening
        }
      };
    } else {
      console.warn('[LanguageDetector] Web Speech API is not supported in this browser.');
    }
  }

  public setOnDetected(cb: (lang: string) => void) {
    this.onDetected = cb;
  }

  public start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        this.lastTranscript = ""; // Reset transcript on start
        console.log('[LanguageDetector] Started listening for language detection...');
      } catch (err) {
        console.error('[LanguageDetector] Failed to start recognition:', err);
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false; // Set to false before calling stop to prevent auto-restart in onend
      this.recognition.stop();
      console.log('[LanguageDetector] Stopped listening.');
    }
  }

  public setLanguage(langCode: string) {
    if (this.recognition) {
      this.recognition.lang = langCode;
      console.log(`[LanguageDetector] Recognition language set to: ${langCode}`);
    }
  }
}

export const languageDetector = new LanguageDetector();
