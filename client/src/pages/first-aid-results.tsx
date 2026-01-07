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
  Info,
  Loader2,
  ExternalLink,
  AlertCircle,
  Store,
  Building2
} from "lucide-react";
import type { DecisionAnswers, FirstAidResponse, LocationData, NearbyPlace } from "@shared/schema";
import CPRAnimation from "@/components/cpr-animation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import logoImage from "@assets/image_1767781744439.png";

interface FirstAidResultsProps {
  answers: DecisionAnswers;
  location: LocationData | null;
  firstAidData: FirstAidResponse | null;
  isLoading: boolean;
  isOffline: boolean;
  onBack: () => void;
  onRestart: () => void;
}

interface NearbyPlacesState {
  hospitals: NearbyPlace[];
  pharmacies: NearbyPlace[];
  medicalStores: NearbyPlace[];
  isLoading: boolean;
  error: string | null;
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
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlacesState>({
    hospitals: [],
    pharmacies: [],
    medicalStores: [],
    isLoading: true,
    error: null
  });
  
  const instructions = firstAidData?.instructions || [];
  const totalSteps = instructions.length;

  // Fetch nearby places from Overpass API
  useEffect(() => {
    if (!location) {
      setNearbyPlaces(prev => ({
        ...prev,
        isLoading: false,
        error: "Location not available. Please enable location access."
      }));
      return;
    }

    const fetchNearbyPlaces = async () => {
      try {
        setNearbyPlaces(prev => ({ ...prev, isLoading: true, error: null }));
        
        const response = await fetch(
          `/api/nearby-places?lat=${location.latitude}&lng=${location.longitude}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch nearby places");
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.message || data.error);
        }
        
        setNearbyPlaces({
          hospitals: data.hospitals || [],
          pharmacies: data.pharmacies || [],
          medicalStores: data.medicalStores || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error("Error fetching nearby places:", error);
        setNearbyPlaces({
          hospitals: [],
          pharmacies: [],
          medicalStores: [],
          isLoading: false,
          error: error instanceof Error ? error.message : "Network error"
        });
      }
    };

    fetchNearbyPlaces();
  }, [location]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || !location || leafletMapRef.current) return;

    const map = L.map(mapRef.current).setView(
      [location.latitude, location.longitude],
      14
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const userIcon = L.divIcon({
      html: '<div style="background: #dc2626; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      className: "user-marker",
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    L.marker([location.latitude, location.longitude], { icon: userIcon })
      .addTo(map)
      .bindPopup("You are here");

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [location]);

  // Add markers for nearby places - with cleanup to avoid duplicates
  useEffect(() => {
    if (!leafletMapRef.current || !location) return;

    const map = leafletMapRef.current;

    // Clear existing markers before adding new ones
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    } else {
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    const hospitalIcon = L.divIcon({
      html: '<div style="background: #dc2626; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
      className: "hospital-marker",
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const medicalStoreIcon = L.divIcon({
      html: '<div style="background: #2563eb; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
      className: "medical-store-marker",
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    nearbyPlaces.hospitals.forEach((hospital) => {
      const ownershipLabel = (hospital as any).ownership ? ` (${(hospital as any).ownership})` : "";
      const marker = L.marker([hospital.latitude, hospital.longitude], { icon: hospitalIcon })
        .bindPopup(`<b>${hospital.name}</b>${ownershipLabel}<br>${hospital.address}<br>${hospital.distance}`);
      markersLayerRef.current?.addLayer(marker);
    });

    nearbyPlaces.medicalStores.forEach((store) => {
      const marker = L.marker([store.latitude, store.longitude], { icon: medicalStoreIcon })
        .bindPopup(`<b>${store.name}</b><br>${store.address}<br>${store.distance}`);
      markersLayerRef.current?.addLayer(marker);
    });
  }, [nearbyPlaces, location]);

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

  const getWhatsAppLink = () => {
    const locationLink = location 
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : 'Location unavailable';
    const message = encodeURIComponent(
      `EMERGENCY! I am at an accident site. My location: ${locationLink}. Need help!`
    );
    return `https://wa.me/?text=${message}`;
  };

  const getSMSLink = () => {
    const locationLink = location 
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : 'Location unavailable';
    const message = encodeURIComponent(
      `EMERGENCY! Accident site. Location: ${locationLink}. Need help!`
    );
    return `sms:?body=${message}`;
  };

  const openCurrentLocationInMaps = () => {
    if (location) {
      window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank');
    }
  };

  const openDirections = (place: NearbyPlace) => {
    if (location) {
      window.open(
        `https://www.google.com/maps/dir/${location.latitude},${location.longitude}/${place.latitude},${place.longitude}`,
        '_blank'
      );
    } else {
      window.open(
        `https://www.google.com/maps?q=${place.latitude},${place.longitude}`,
        '_blank'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm px-4 py-3 border-b border-slate-700/50 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          data-testid="button-back-results"
          className="text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-600/50 flex items-center justify-center p-1 shadow-sm">
          <img src={logoImage} alt="hack2care" className="w-full h-full object-contain" />
        </div>
        <div className="flex-1">
          <h1 className="text-white font-bold text-sm">Emergency First Aid</h1>
          <p className="text-slate-500 text-xs">Follow these steps carefully</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRestart}
          data-testid="button-restart"
          className="text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </header>

      {isOffline && (
        <div className="bg-amber-900/30 border-b border-amber-700/30 p-2 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-amber-400">Offline Mode - Standard First Aid Guide</span>
        </div>
      )}

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Emergency Call Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a 
            href="tel:108"
            data-testid="button-call-ambulance"
            className="flex flex-col items-center justify-center py-4 rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white font-bold shadow-lg shadow-red-900/30"
          >
            <Phone className="w-6 h-6 mb-1" />
            <span className="text-sm">Ambulance</span>
            <span className="text-lg">108</span>
          </a>
          <a 
            href="tel:112"
            data-testid="button-call-police"
            className="flex flex-col items-center justify-center py-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold shadow-lg shadow-blue-900/30"
          >
            <Phone className="w-6 h-6 mb-1" />
            <span className="text-sm">Police</span>
            <span className="text-lg">112</span>
          </a>
        </div>

        {/* First Aid Steps Card */}
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              First Aid Steps
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSpeech}
              data-testid="button-toggle-speech"
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              {isSpeaking ? (
                <Volume2 className="w-5 h-5 text-red-400 animate-pulse" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </Button>
          </div>

          {totalSteps > 0 ? (
            <div className="space-y-3">
              {instructions.map((instruction, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30"
                  data-testid={`text-instruction-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{index + 1}</span>
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed flex-1">
                      {instruction}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4 text-sm">Loading steps...</p>
          )}
        </div>

        {showCPR && (
          <div className="rounded-xl bg-red-900/30 border border-red-700/50 p-4">
            <div className="flex items-center gap-2 mb-4 p-3 bg-red-900/50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="font-bold text-red-300 text-sm">Begin CPR only if you are trained</span>
            </div>
            <CPRAnimation />
          </div>
        )}

        {/* Share Location Section */}
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
          <h2 className="text-white font-bold mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Share Your Location
          </h2>
          <p className="text-slate-400 text-xs mb-4">Send your location to contacts for help</p>

          {location && (
            <Button
              variant="outline"
              className="w-full h-12 mb-3 text-sm bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
              onClick={openCurrentLocationInMaps}
              data-testid="button-view-my-location"
            >
              <Navigation className="w-4 h-4 mr-2" />
              View My Location in Maps
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <a 
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-share-whatsapp"
              className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-white font-semibold shadow-lg shadow-green-900/30"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm">WhatsApp</span>
            </a>
            <a 
              href={getSMSLink()}
              data-testid="button-share-sms"
              className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-semibold shadow-lg shadow-blue-900/30"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-sm">SMS</span>
            </a>
          </div>
        </div>

        {/* Map Section */}
        {location && (
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
            <h2 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-400" />
              Your Location
            </h2>
            <div 
              ref={mapRef} 
              className="w-full h-44 rounded-lg overflow-hidden border border-slate-700/50"
              data-testid="map-container"
            />
          </div>
        )}

        {/* Find Help Section */}
        <div className="space-y-3">
          <h2 className="text-white font-bold flex items-center gap-2 text-sm">
            <Hospital className="w-4 h-4 text-blue-400" />
            Find Help Nearby
          </h2>
          {location ? (
            <a
              href={`https://www.google.com/maps/search/hospitals/@${location.latitude},${location.longitude},14z`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-find-hospitals"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
            >
              <Hospital className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm">FIND HOSPITALS</div>
                <div className="text-xs font-normal opacity-80">Opens Google Maps</div>
              </div>
            </a>
          ) : (
            <div className="w-full py-4 rounded-xl bg-slate-700/50 text-slate-400 font-bold flex items-center justify-center gap-2 opacity-50">
              <Hospital className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm">FIND HOSPITALS</div>
                <div className="text-xs font-normal opacity-80">Waiting for location...</div>
              </div>
            </div>
          )}
          {location ? (
            <a
              href={`https://www.google.com/maps/search/pharmacy+medical+store/@${location.latitude},${location.longitude},14z`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-find-pharmacies"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-700 text-white font-bold shadow-lg shadow-green-900/30 flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
            >
              <Store className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm">FIND PHARMACIES</div>
                <div className="text-xs font-normal opacity-80">Opens Google Maps</div>
              </div>
            </a>
          ) : (
            <div className="w-full py-4 rounded-xl bg-slate-700/50 text-slate-400 font-bold flex items-center justify-center gap-2 opacity-50">
              <Store className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm">FIND PHARMACIES</div>
                <div className="text-xs font-normal opacity-80">Waiting for location...</div>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-slate-500 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <p className="font-semibold text-slate-400 mb-1">Important Notice</p>
          <p>This app provides general first aid guidance only and does not replace professional medical care.</p>
        </div>
      </main>
    </div>
  );
}
