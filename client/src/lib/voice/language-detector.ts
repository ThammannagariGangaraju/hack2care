/**
 * Minimal language detection utility using the Web Speech API.
 * This module is designed to be non-invasive and logs detected language codes to the console.
 */

export class LanguageDetector {
  private recognition: any;
  private isListening: boolean = false;

  constructor() {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      
      // Attempt to auto-detect language based on spoken content
      // Note: Standard Web Speech API usually requires a 'lang' property,
      // but some browsers/engines can provide results that include language metadata
      // if not strictly pinned. 
      
      this.recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        const confidence = event.results[last][0].confidence;
        
        // In most browsers, the language is pre-set or defaults to the browser locale.
        // True "language detection" from raw audio is limited in the standard Web Speech API
        // without external services, but we can capture what the API identifies.
        console.log(`[LanguageDetector] Detected speech: "${transcript}" (Confidence: ${confidence})`);
        
        // Some implementations expose the detected language if multiple were provided in a list
        // but typically we just get the result for the current 'lang'.
        if (event.results[last].language) {
          console.log(`[LanguageDetector] Detected language code: ${event.results[last].language}`);
        } else {
          // Fallback log of browser default being used
          console.log(`[LanguageDetector] Using recognition language: ${this.recognition.lang || 'default'}`);
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
