import { useState, useEffect } from "react";
import { AlertTriangle, Phone, MapPin, Zap, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { LocationData } from "@shared/schema";
import logoImage from "@assets/image_1767781744439.png";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { translate } from "@/lib/i18n/translations";
import { languageDetector } from "@/lib/voice/language-detector";

interface HomePageProps {
  onStartEmergency: () => void;
  location: LocationData | null;
  locationError: string | null;
}

export default function HomePage({ onStartEmergency, location, locationError }: HomePageProps) {
  const { language, setLanguage, isAutoDetected, setIsAutoDetected, feedbackMessage, showFeedback } = useLanguage();

  useEffect(() => {
    if (isAutoDetected) return;

    languageDetector.setOnDetected((detectedLang: string) => {
      if (isAutoDetected) return;

      const langCode = detectedLang.split('-')[0];
      console.log(`[LanguageDetector] Session adaptation triggered: "${langCode}"`);
      
      setLanguage(langCode);
      setIsAutoDetected(true);
      languageDetector.stop();
      showFeedback(`Language set to ${langCode.toUpperCase()}`);
    });

    const timer = setTimeout(() => {
      console.log("[LanguageDetector] Background adaptation listening active...");
      languageDetector.start();
    }, 2000);

    return () => {
      clearTimeout(timer);
      languageDetector.stop();
    };
  }, [isAutoDetected, setIsAutoDetected, setLanguage, language, showFeedback]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Feedback Overlay */}
      {feedbackMessage && (
        <div className="fixed top-4 left-0 w-full z-50 pointer-events-none p-2 flex justify-center">
           <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-full px-4 py-2 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
              <p className="text-slate-200 text-xs font-medium flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                 {feedbackMessage}
              </p>
           </div>
        </div>
      )}
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-600/50 flex items-center justify-center p-1.5 shadow-sm">
            <img 
              src={logoImage} 
              alt="hack2care" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">{translate("app.title", language)}</h1>
            <p className="text-slate-400 text-xs">AI First-Responder</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${location ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
          <span className="text-xs text-slate-400">
            {location ? 'GPS Ready' : 'Locating...'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Hero Section */}
        <div className="text-center mb-2">
          <h2 className="text-white text-2xl font-bold mb-2">{translate("home.welcome", language)}</h2>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Get instant AI-powered first aid guidance. No login needed.
          </p>
        </div>

        {/* Main Emergency Button */}
        <motion.button
          onClick={onStartEmergency}
          data-testid="button-report-accident"
          className="w-full max-w-sm h-36 rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white font-bold shadow-2xl shadow-red-900/50 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative group"
          animate={{
            scale: [1, 1.05, 1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: "easeInOut",
            times: [0, 0.2, 0.4, 0.6, 1]
          }}
        >
          {/* Glow effect */}
          <motion.div 
            className="absolute -inset-1 bg-red-500/30 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"
            animate={{
              opacity: [0.4, 0.8, 0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: "easeInOut",
              times: [0, 0.2, 0.4, 0.6, 1]
            }}
          />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/20 p-4 rounded-full mb-2 backdrop-blur-sm">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <span className="text-xl font-bold tracking-wide uppercase">{translate("home.report_accident", language)}</span>
            <span className="text-xs font-normal text-red-100 mt-1">Tap for immediate assistance</span>
          </div>
        </motion.button>

        {/* Features Row */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-2">
          <div className="flex flex-col items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <Zap className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-white text-xs font-semibold">Instant</span>
            <span className="text-slate-500 text-[10px]">AI Response</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <Clock className="w-5 h-5 text-blue-400 mb-1" />
            <span className="text-white text-xs font-semibold">24/7</span>
            <span className="text-slate-500 text-[10px]">Available</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <Heart className="w-5 h-5 text-red-400 mb-1" />
            <span className="text-white text-xs font-semibold">Life</span>
            <span className="text-slate-500 text-[10px]">Saving</span>
          </div>
        </div>

        {/* Emergency Numbers */}
        <div className="w-full max-w-sm mt-4">
          <p className="text-center text-xs text-slate-500 mb-3 uppercase tracking-wider">Emergency Helplines</p>
          <div className="grid grid-cols-2 gap-3">
            <a 
              href="tel:108" 
              data-testid="button-call-ambulance-home"
              className="flex items-center justify-center gap-2 py-4 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-sm shadow-lg shadow-red-900/30"
            >
              <Phone className="w-4 h-4" />
              <span>Ambulance 108</span>
            </a>
            <a 
              href="tel:112" 
              data-testid="button-call-police-home"
              className="flex items-center justify-center gap-2 py-4 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-900/30"
            >
              <Phone className="w-4 h-4" />
              <span>Police 112</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-3 text-center border-t border-slate-800">
        <p className="text-slate-500 text-xs">
          This app provides guidance only. Always call professional emergency services.
        </p>
      </footer>
    </div>
  );
}
