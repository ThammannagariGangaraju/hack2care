import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, MapPin, Shield } from "lucide-react";
import type { LocationData } from "@shared/schema";
import logoImage from "@assets/image_1767781744439.png";

interface HomePageProps {
  onStartEmergency: () => void;
  location: LocationData | null;
  locationError: string | null;
}

export default function HomePage({ onStartEmergency, location, locationError }: HomePageProps) {
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale(prev => prev === 1 ? 1.02 : 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950/20 flex flex-col">
      {/* Emergency Header Bar */}
      <div className="bg-red-600 text-white py-2 px-4 text-center animate-pulse">
        <span className="font-bold text-sm tracking-wide">EMERGENCY FIRST AID ASSISTANT</span>
      </div>

      {/* Header with Logo */}
      <header className="p-4 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <img 
            src={logoImage} 
            alt="hack2care logo" 
            className="w-24 h-24 object-contain"
          />
          <p className="text-muted-foreground text-sm">AI-Powered Emergency Response</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Emergency Instructions Card */}
        <div className="w-full max-w-lg bg-card/50 rounded-2xl p-6 border border-border/50 backdrop-blur-sm">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-6 h-6 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-lg mb-1">Stay Calm, Help is Here</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                This app will guide you through emergency first aid steps using AI. 
                No login required - just tap the button below.
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-3 bg-background/50 rounded-xl">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-xs text-muted-foreground">Quick Questions</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-xl">
              <div className="text-2xl font-bold text-accent">AI</div>
              <div className="text-xs text-muted-foreground">Powered Guide</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-xl">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">24/7</div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </div>
        </div>

        {/* Main Emergency Button */}
        <button
          onClick={onStartEmergency}
          data-testid="button-report-accident"
          className="w-full max-w-lg h-44 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-3xl uppercase tracking-wider shadow-2xl border-4 border-red-800 transition-all duration-200 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
          style={{ transform: `scale(${pulseScale})` }}
        >
          {/* Animated pulse ring */}
          <div className="absolute inset-0 rounded-2xl animate-ping bg-red-400/30 pointer-events-none" style={{ animationDuration: '1.5s' }} />
          
          <div className="bg-white/20 p-3 rounded-full mb-1">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <span className="text-2xl">REPORT ACCIDENT</span>
          <span className="text-sm font-normal opacity-90">Tap here for immediate help</span>
        </button>

        {/* Location Status */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className={`w-4 h-4 ${location ? 'text-green-500' : locationError ? 'text-destructive' : 'text-muted-foreground animate-pulse'}`} />
          <span className={location ? 'text-green-600 dark:text-green-400' : locationError ? 'text-destructive' : 'text-muted-foreground'}>
            {location ? 'Location acquired' : locationError ? 'Location unavailable' : 'Acquiring location...'}
          </span>
        </div>

        {/* Emergency Numbers */}
        <div className="w-full max-w-lg space-y-3">
          <p className="text-center text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Emergency Helplines</p>
          <div className="grid grid-cols-2 gap-3">
            <a 
              href="tel:108" 
              data-testid="button-call-ambulance-home"
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 font-bold"
            >
              <Phone className="w-5 h-5" />
              <span>Ambulance 108</span>
            </a>
            <a 
              href="tel:112" 
              data-testid="button-call-police-home"
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold"
            >
              <Phone className="w-5 h-5" />
              <span>Police 112</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground bg-gray-100 dark:bg-gray-900 border-t border-red-200 dark:border-red-900">
        <p className="font-medium">This app provides guidance only. Always call professional emergency services.</p>
      </footer>
    </div>
  );
}
