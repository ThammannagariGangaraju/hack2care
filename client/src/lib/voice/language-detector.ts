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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      
      this.recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim().toLowerCase();
        
        if (!transcript || transcript === this.lastTranscript) return;
        
        // Start detection window on first speech
        if (!this.lastTranscript && !this.detectionTimer) {
          console.log('[LanguageDetector] First speech detected, starting 5s window...');
          this.detectionTimer = setTimeout(() => {
            this.finalizeDetection();
          }, 5000);
        }

        this.lastTranscript = transcript;
        console.log(`[LanguageDetector] Transcript: "${transcript}"`);

        // Immediate override by language names
        if (transcript.includes('english')) this.applyDetection('en');
        else if (transcript.includes('hindi') || transcript.includes('हिंदी')) this.applyDetection('hi');
        else if (transcript.includes('telugu') || transcript.includes('తెలుగు')) this.applyDetection('te');
        else if (transcript.includes('spanish') || transcript.includes('español')) this.applyDetection('es');
        
        // Script heuristics (check immediately)
        if (/[\u0C00-\u0C7F]/.test(transcript)) this.applyDetection('te');
        else if (/[\u0900-\u097F]/.test(transcript)) this.applyDetection('hi');
      };

      this.recognition.onerror = (event: any) => {
        console.error('[LanguageDetector] Speech error:', event.error);
        if (event.error === 'no-speech') this.finalizeDetection();
      };

      this.recognition.onend = () => {
        if (this.isListening) this.recognition.start();
      };
    }
  }

  private applyDetection(lang: string) {
    if (this.onDetected) {
      console.log(`[LanguageDetector] Detected: ${lang}`);
      this.onDetected(lang);
      this.stop();
    }
  }

  private finalizeDetection() {
    if (this.isListening) {
      console.log('[LanguageDetector] Window closed, defaulting to English if no switch occurred');
      this.applyDetection('en');
    }
  }

  private detectionTimer: any = null;

  public start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        this.lastTranscript = "";
        this.detectionTimer = null;
        console.log('[LanguageDetector] Listening silently...');
      } catch (err) {
        console.error('[LanguageDetector] Start failed:', err);
      }
    }
  }

  public stop() {
    this.isListening = false;
    if (this.detectionTimer) clearTimeout(this.detectionTimer);
    if (this.recognition) {
      try { this.recognition.stop(); } catch {}
    }
  }

  public setLanguage(langCode: string) {
    if (this.recognition) {
      this.recognition.lang = langCode;
      console.log(`[LanguageDetector] Recognition language set to: ${langCode}`);
    }
  }

  public setOnDetected(cb: (lang: string) => void) {
    this.onDetected = cb;
  }
}

export const languageDetector = new LanguageDetector();
