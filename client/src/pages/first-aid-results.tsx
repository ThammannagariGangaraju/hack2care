import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Phone, 
  MapPin, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  MessageSquare,
  Navigation,
  Hospital,
  Pill,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  WifiOff,
  Info
} from "lucide-react";
import type { DecisionAnswers, FirstAidResponse, LocationData } from "@shared/schema";
import CPRAnimation from "@/components/cpr-animation";

interface FirstAidResultsProps {
  answers: DecisionAnswers;
  location: LocationData | null;
  firstAidData: FirstAidResponse | null;
  isLoading: boolean;
  isOffline: boolean;
  onBack: () => void;
  onRestart: () => void;
}

export default function FirstAidResults({
  answers,
  location,
  firstAidData,
  isLoading,
  isOffline,
  onBack,
  onRestart,
}: FirstAidResultsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const instructions = firstAidData?.instructions || [];
  const totalSteps = instructions.length;

  // Auto-voice: Read instructions aloud when they appear
  useEffect(() => {
    const instructions = firstAidData?.instructions;
    if (instructions && instructions.length > 0 && !hasSpoken && 'speechSynthesis' in window) {
      const text = instructions.join('. ');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setHasSpoken(true);
      };
      utterance.onerror = () => setIsSpeaking(false);
      
      speechRef.current = utterance;
      
      // Small delay to ensure UI is ready
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 500);
    }
    
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [firstAidData, hasSpoken]);

  const toggleSpeech = () => {
    const instructions = firstAidData?.instructions;
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else if (instructions && instructions.length > 0) {
        const text = instructions.join('. ');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const showCPR = firstAidData?.showCPR || (answers.isConscious === false && answers.isBreathing === false);

  // Generate WhatsApp message
  const getWhatsAppLink = () => {
    const locationLink = location 
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : 'Location unavailable';
    const message = encodeURIComponent(
      `EMERGENCY! I am at an accident site. My location: ${locationLink}. Need help!`
    );
    return `https://wa.me/?text=${message}`;
  };

  // Generate SMS link
  const getSMSLink = () => {
    const locationLink = location 
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : 'Location unavailable';
    const message = encodeURIComponent(
      `EMERGENCY! Accident site. Location: ${locationLink}. Need help!`
    );
    return `sms:?body=${message}`;
  };

  // Open Maps showing current location
  const openCurrentLocationInMaps = () => {
    if (location) {
      window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm p-4 border-b border-border flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          data-testid="button-back-results"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-bold text-lg">Emergency First Aid</h1>
          <p className="text-sm text-muted-foreground">Follow these steps carefully</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRestart}
          data-testid="button-restart"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </header>

      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-accent/20 border-b border-accent/30 p-3 flex items-center justify-center gap-2">
          <WifiOff className="w-5 h-5 text-accent-foreground" />
          <span className="font-medium text-accent-foreground">Offline Mode - Showing Standard First Aid Guide</span>
        </div>
      )}

      <main className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Emergency Call Buttons */}
        <div className="space-y-3">
          <a 
            href="tel:108"
            data-testid="button-call-ambulance"
            className="flex items-center justify-between w-full h-20 px-6 rounded-2xl bg-primary text-primary-foreground font-bold text-xl"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-7 h-7" />
              <span>Call Ambulance</span>
            </div>
            <span className="text-2xl">108</span>
          </a>
          <a 
            href="tel:112"
            data-testid="button-call-police"
            className="flex items-center justify-between w-full h-16 px-6 rounded-xl bg-secondary text-secondary-foreground font-semibold text-lg"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6" />
              <span>Call Police</span>
            </div>
            <span className="text-xl">112</span>
          </a>
        </div>

        {/* First Aid Instructions - Simple List */}
        <Card className="shadow-xl border-2 border-red-800/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3 gap-2">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-red-700" />
                First Aid Steps
              </h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSpeech}
                data-testid="button-toggle-speech"
              >
                {isSpeaking ? (
                  <Volume2 className="w-5 h-5 text-red-600 animate-pulse" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            </div>

            {totalSteps > 0 ? (
              <div className="space-y-3">
                {instructions.map((instruction, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-red-700/20"
                    data-testid={`text-instruction-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-700 dark:bg-red-800 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-base leading-relaxed pt-1 flex-1">
                        {instruction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Loading steps...</p>
            )}
          </CardContent>
        </Card>

        {/* CPR Section - Only show if needed */}
        {showCPR && (
          <Card className="shadow-xl border-2 border-destructive/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 p-3 bg-destructive/10 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <span className="font-bold text-destructive">Begin CPR only if you are trained</span>
              </div>
              
              <CPRAnimation />
            </CardContent>
          </Card>
        )}

        {/* Location Sharing Section */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Share Your Location
            </h2>
            <p className="text-muted-foreground mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Tap below to send your location to contacts for help
            </p>

            {/* Current Location Button */}
            {location && (
              <Button
                variant="outline"
                className="w-full h-14 mb-4 text-base"
                onClick={openCurrentLocationInMaps}
                data-testid="button-view-my-location"
              >
                <Navigation className="w-5 h-5 mr-2" />
                View My Current Location in Maps
              </Button>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <a 
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-share-whatsapp"
                className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl bg-green-600 text-white font-semibold text-lg"
              >
                <MessageCircle className="w-8 h-8" />
                <span>WhatsApp</span>
              </a>
              <a 
                href={getSMSLink()}
                data-testid="button-share-sms"
                className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl bg-blue-600 text-white font-semibold text-lg"
              >
                <MessageSquare className="w-8 h-8" />
                <span>SMS</span>
              </a>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">
              Both options will include your GPS location link
            </p>
          </CardContent>
        </Card>

        {/* Find Nearby Help */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Find Nearby Help
            </h2>
            
            <div className="space-y-3">
              <a 
                href={location 
                  ? `https://www.google.com/maps/search/hospital+emergency/@${location.latitude},${location.longitude},14z`
                  : "https://www.google.com/maps/search/hospital+emergency+near+me"
                }
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-find-hospitals"
                className="flex items-center justify-center gap-3 w-full h-16 rounded-xl bg-primary text-primary-foreground font-bold text-lg"
              >
                <Hospital className="w-6 h-6" />
                Find Hospitals
              </a>
              
              <a 
                href={location 
                  ? `https://www.google.com/maps/search/pharmacy+medical+shop/@${location.latitude},${location.longitude},14z`
                  : "https://www.google.com/maps/search/pharmacy+medical+shop+near+me"
                }
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-find-pharmacies"
                className="flex items-center justify-center gap-3 w-full h-16 rounded-xl bg-secondary text-secondary-foreground font-bold text-lg"
              >
                <Pill className="w-6 h-6" />
                Find Pharmacies
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl">
          <p className="font-semibold mb-1">Important Notice</p>
          <p>This app provides general first aid guidance only and does not replace professional medical care. Always call emergency services for serious injuries.</p>
        </div>
      </main>
    </div>
  );
}
