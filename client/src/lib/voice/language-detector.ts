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
        const detectedLang = event.results[last].language || this.recognition.lang;

        if (transcript === this.lastTranscript) return;
        this.lastTranscript = transcript;

        console.log(`[LanguageDetector] Detection result: "${transcript}" in ${detectedLang} (Confidence: ${confidence})`);
        
        // Voice override check
        const languageMap: Record<string, string> = {
          "english": "en",
          "hindi": "hi",
          "telugu": "te",
          "kannada": "kn",
          "tamil": "ta",
          "malayalam": "ml"
        };

        for (const [name, code] of Object.entries(languageMap)) {
          if (transcript.includes(name)) {
            console.log(`[LanguageDetector] Voice override triggered: "${name}" -> ${code}`);
            if (this.onDetected) this.onDetected(code);
            return;
          }
        }
        
        if (this.onDetected) {
          this.onDetected(detectedLang);
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
        console.log('[LanguageDetector] Started listening for language detection...');
      } catch (err) {
        console.error('[LanguageDetector] Failed to start recognition:', err);
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
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
