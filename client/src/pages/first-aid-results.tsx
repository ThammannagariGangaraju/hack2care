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

    const pharmacyIcon = L.divIcon({
      html: '<div style="background: #16a34a; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
      className: "pharmacy-marker",
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

    nearbyPlaces.pharmacies.forEach((pharmacy) => {
      const marker = L.marker([pharmacy.latitude, pharmacy.longitude], { icon: pharmacyIcon })
        .bindPopup(`<b>${pharmacy.name}</b><br>${pharmacy.address}<br>${pharmacy.distance}`);
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
    <div className="min-h-screen bg-background pb-6">
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

      {isOffline && (
        <div className="bg-accent/20 border-b border-accent/30 p-3 flex items-center justify-center gap-2">
          <WifiOff className="w-5 h-5 text-accent-foreground" />
          <span className="font-medium text-accent-foreground">Offline Mode - Showing Standard First Aid Guide</span>
        </div>
      )}

      <main className="p-4 space-y-6 max-w-lg mx-auto">
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

        {location && (
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Your Location
              </h2>
              <div 
                ref={mapRef} 
                className="w-full h-48 rounded-xl overflow-hidden border border-border"
                data-testid="map-container"
              />
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Hospital className="w-5 h-5 text-primary" />
              Nearby Hospitals
            </h2>

            {nearbyPlaces.isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Searching for hospitals...</span>
              </div>
            ) : nearbyPlaces.error ? (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-xl text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{nearbyPlaces.error}</span>
              </div>
            ) : nearbyPlaces.hospitals.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hospitals found nearby</p>
            ) : (
              <div className="space-y-3">
                {nearbyPlaces.hospitals.slice(0, 5).map((hospital, index) => {
                  const ownership = (hospital as any).ownership;
                  const facilityType = (hospital as any).facilityType;
                  return (
                    <div 
                      key={index}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-border"
                      data-testid={`card-hospital-${index}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold truncate" data-testid={`text-hospital-name-${index}`}>
                              {hospital.name}
                            </h3>
                            {ownership && ownership !== "Unknown" && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                ownership === "Government" 
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                                  : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                              }`}>
                                {ownership}
                              </span>
                            )}
                            {facilityType && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                {facilityType}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{hospital.address}</p>
                          <p className="text-sm font-medium text-primary mt-1">{hospital.distance}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => openDirections(hospital)}
                          data-testid={`button-hospital-directions-${index}`}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Open in Maps
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-600" />
              Nearby Pharmacies
            </h2>

            {nearbyPlaces.isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Searching for pharmacies...</span>
              </div>
            ) : nearbyPlaces.error ? (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-xl text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{nearbyPlaces.error}</span>
              </div>
            ) : nearbyPlaces.pharmacies.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pharmacies found nearby</p>
            ) : (
              <div className="space-y-3">
                {nearbyPlaces.pharmacies.slice(0, 5).map((pharmacy, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-border"
                    data-testid={`card-pharmacy-${index}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate" data-testid={`text-pharmacy-name-${index}`}>
                          {pharmacy.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{pharmacy.address}</p>
                        <p className="text-sm font-medium text-green-600 mt-1">{pharmacy.distance}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openDirections(pharmacy)}
                        data-testid={`button-pharmacy-directions-${index}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open in Maps
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              Nearby Medical Stores
            </h2>

            {nearbyPlaces.isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Searching for medical stores...</span>
              </div>
            ) : nearbyPlaces.error ? (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-xl text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{nearbyPlaces.error}</span>
              </div>
            ) : nearbyPlaces.medicalStores.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No medical stores found nearby</p>
            ) : (
              <div className="space-y-3">
                {nearbyPlaces.medicalStores.slice(0, 5).map((store, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-border"
                    data-testid={`card-medical-store-${index}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate" data-testid={`text-medical-store-name-${index}`}>
                          {store.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{store.address}</p>
                        <p className="text-sm font-medium text-blue-600 mt-1">{store.distance}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openDirections(store)}
                        data-testid={`button-medical-store-directions-${index}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open in Maps
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl">
          <p className="font-semibold mb-1">Important Notice</p>
          <p>This app provides general first aid guidance only and does not replace professional medical care. Always call emergency services for serious injuries.</p>
        </div>
      </main>
    </div>
  );
}
