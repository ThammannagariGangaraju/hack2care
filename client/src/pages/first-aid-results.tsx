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
  ExternalLink,
  Loader2,
  WifiOff,
  Info
} from "lucide-react";
import type { DecisionAnswers, FirstAidResponse, LocationData, NearbyPlace } from "@shared/schema";
import CPRAnimation from "@/components/cpr-animation";

interface FirstAidResultsProps {
  answers: DecisionAnswers;
  location: LocationData | null;
  firstAidData: FirstAidResponse | null;
  isLoading: boolean;
  isOffline: boolean;
  nearbyHospitals: NearbyPlace[];
  nearbyPharmacies: NearbyPlace[];
  onBack: () => void;
  onRestart: () => void;
}

export default function FirstAidResults({
  answers,
  location,
  firstAidData,
  isLoading,
  isOffline,
  nearbyHospitals,
  nearbyPharmacies,
  onBack,
  onRestart,
}: FirstAidResultsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-voice: Read instructions aloud when they appear
  useEffect(() => {
    if (firstAidData && !hasSpoken && 'speechSynthesis' in window) {
      const text = firstAidData.instructions.join('. ');
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
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else if (firstAidData) {
        const text = firstAidData.instructions.join('. ');
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

  // Open Google Maps with current location and nearby places
  const openInMaps = (place: NearbyPlace) => {
    const origin = location 
      ? `${location.latitude},${location.longitude}`
      : '';
    const destination = `${place.latitude},${place.longitude}`;
    const url = origin 
      ? `https://www.google.com/maps/dir/${origin}/${destination}`
      : `https://www.google.com/maps/search/?api=1&query=${destination}`;
    window.open(url, '_blank');
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

        {/* First Aid Instructions */}
        <Card className="shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                First Aid Steps
              </h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSpeech}
                data-testid="button-toggle-speech"
              >
                {isSpeaking ? (
                  <Volume2 className="w-6 h-6 text-primary animate-pulse" />
                ) : (
                  <VolumeX className="w-6 h-6 text-muted-foreground" />
                )}
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Getting AI guidance...</span>
              </div>
            ) : (
              <ul className="space-y-4">
                {firstAidData?.instructions.map((instruction, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 text-lg"
                    data-testid={`text-instruction-${index}`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <span className="leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ul>
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

        {/* Nearby Hospitals */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Hospital className="w-8 h-8 text-primary" />
            Nearby Hospitals
          </h2>
          
          {nearbyHospitals.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Searching for nearby hospitals...
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {nearbyHospitals.map((hospital, index) => (
                <Card key={index} className="shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate" data-testid={`text-hospital-name-${index}`}>
                          {hospital.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{hospital.address}</p>
                        <p className="text-sm font-medium text-primary mt-1">{hospital.distance}</p>
                      </div>
                      <Button
                        onClick={() => openInMaps(hospital)}
                        className="h-16 px-6 text-base font-bold flex-shrink-0"
                        data-testid={`button-open-hospital-map-${index}`}
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Open in Maps
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Nearby Medical Shops */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Pill className="w-8 h-8 text-accent-foreground" />
            Nearby Medical Shops
          </h2>
          
          {nearbyPharmacies.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Searching for nearby pharmacies...
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {nearbyPharmacies.map((pharmacy, index) => (
                <Card key={index} className="shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate" data-testid={`text-pharmacy-name-${index}`}>
                          {pharmacy.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{pharmacy.address}</p>
                        <p className="text-sm font-medium text-accent-foreground mt-1">{pharmacy.distance}</p>
                      </div>
                      <Button
                        onClick={() => openInMaps(pharmacy)}
                        variant="secondary"
                        className="h-16 px-6 text-base font-bold flex-shrink-0"
                        data-testid={`button-open-pharmacy-map-${index}`}
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Open in Maps
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl">
          <p className="font-semibold mb-1">Important Notice</p>
          <p>This app provides general first aid guidance only and does not replace professional medical care. Always call emergency services for serious injuries.</p>
        </div>
      </main>
    </div>
  );
}
