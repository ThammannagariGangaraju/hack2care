import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, MapPin, Heart, Shield } from "lucide-react";
import type { LocationData } from "@shared/schema";

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="p-4 text-center border-b border-border/50">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Heart className="w-8 h-8 text-primary fill-primary" />
          <h1 className="text-3xl font-bold tracking-tight">HACK2CARE</h1>
        </div>
        <p className="text-muted-foreground text-lg">AI First-Responder Assistant</p>
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
          className="w-full max-w-lg h-40 rounded-3xl bg-primary text-primary-foreground font-bold text-3xl uppercase tracking-wider shadow-2xl border-4 border-primary-border transition-all duration-200 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
          style={{ transform: `scale(${pulseScale})` }}
        >
          {/* Animated pulse ring */}
          <div className="absolute inset-0 rounded-3xl animate-ping bg-primary/20 pointer-events-none" style={{ animationDuration: '2s' }} />
          
          <AlertTriangle className="w-12 h-12" />
          <span>Report Accident</span>
          <span className="text-sm font-normal opacity-80">Tap to get immediate help</span>
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
          <p className="text-center text-sm text-muted-foreground mb-2">Quick Emergency Calls</p>
          <div className="grid grid-cols-2 gap-3">
            <a 
              href="tel:108" 
              data-testid="button-call-ambulance-home"
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-primary/10 border border-primary/20 text-foreground font-semibold"
            >
              <Phone className="w-5 h-5 text-primary" />
              <span>Ambulance 108</span>
            </a>
            <a 
              href="tel:112" 
              data-testid="button-call-police-home"
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-accent/10 border border-accent/20 text-foreground font-semibold"
            >
              <Phone className="w-5 h-5 text-accent-foreground" />
              <span>Police 112</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground border-t border-border/50">
        <p>This app does not replace professional medical care. Always call emergency services.</p>
      </footer>
    </div>
  );
}
