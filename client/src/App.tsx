import { useState, useEffect, useCallback } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home";
import DecisionTree from "@/pages/decision-tree";
import FirstAidResults from "@/pages/first-aid-results";
import type { DecisionAnswers, FirstAidResponse, LocationData, NearbyPlace } from "@shared/schema";
import { apiRequest } from "./lib/queryClient";

type AppState = "home" | "questions" | "results";

// Standard first aid guide for offline mode
const OFFLINE_FIRST_AID: FirstAidResponse = {
  instructions: [
    "Ensure the scene is safe before approaching the victim",
    "Call emergency services (108 for ambulance, 112 for police) immediately",
    "If conscious, keep the victim calm and still - do not move them unless necessary",
    "Apply direct pressure to any visible bleeding using a clean cloth",
    "Keep the victim warm with a blanket or jacket",
    "Stay with the victim until help arrives and monitor their breathing"
  ],
  showCPR: false,
  priority: 'urgent'
};

// Sample nearby places (these would come from real Google Maps API)
const SAMPLE_HOSPITALS: NearbyPlace[] = [
  {
    name: "City General Hospital",
    address: "123 Main Street, City Center",
    distance: "1.2 km",
    latitude: 0,
    longitude: 0,
    type: "hospital"
  },
  {
    name: "Apollo Emergency Care",
    address: "456 Health Avenue, Medical District",
    distance: "2.5 km",
    latitude: 0,
    longitude: 0,
    type: "hospital"
  },
  {
    name: "Government Medical Center",
    address: "789 Hospital Road",
    distance: "3.1 km",
    latitude: 0,
    longitude: 0,
    type: "hospital"
  }
];

const SAMPLE_PHARMACIES: NearbyPlace[] = [
  {
    name: "24/7 MedPlus Pharmacy",
    address: "Near City Hospital",
    distance: "0.8 km",
    latitude: 0,
    longitude: 0,
    type: "pharmacy"
  },
  {
    name: "Apollo Pharmacy",
    address: "Medical District",
    distance: "1.5 km",
    latitude: 0,
    longitude: 0,
    type: "pharmacy"
  }
];

function App() {
  const [appState, setAppState] = useState<AppState>("home");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<DecisionAnswers>({
    isConscious: null,
    isBreathing: null,
    hasHeavyBleeding: null
  });
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [firstAidData, setFirstAidData] = useState<FirstAidResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [nearbyHospitals, setNearbyHospitals] = useState<NearbyPlace[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<NearbyPlace[]>([]);

  // Immediately load places on mount, then update with real location if available
  useEffect(() => {
    // Immediately load places with default coordinates - don't wait for geolocation
    fetchNearbyPlacesDefault();
    
    // Then try to get real location and update places
    if ('geolocation' in navigator) {
      const timeoutId = setTimeout(() => {
        // Fallback if geolocation takes too long
        setLocationError('Location timeout');
      }, 5000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocation(locationData);
          setLocationError(null);
          
          // Update nearby places with real coordinates
          fetchNearbyPlaces(locationData);
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error('Location error:', error);
          setLocationError(error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      setLocationError('Geolocation not supported');
    }
  }, []);

  // Fetch places with default coordinates (Delhi)
  const fetchNearbyPlacesDefault = async () => {
    try {
      const response = await fetch(`/api/nearby-places?lat=28.6139&lng=77.2090`);
      if (response.ok) {
        const data = await response.json();
        setNearbyHospitals(data.hospitals || []);
        setNearbyPharmacies(data.pharmacies || []);
      } else {
        loadSamplePlaces(null);
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      loadSamplePlaces(null);
    }
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchNearbyPlaces = async (loc: LocationData) => {
    try {
      const response = await fetch(`/api/nearby-places?lat=${loc.latitude}&lng=${loc.longitude}`);
      if (response.ok) {
        const data = await response.json();
        setNearbyHospitals(data.hospitals || []);
        setNearbyPharmacies(data.pharmacies || []);
      } else {
        loadSamplePlaces(loc);
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      loadSamplePlaces(loc);
    }
  };

  const loadSamplePlaces = (loc: LocationData | null) => {
    // Update sample places with real coordinates if available
    const hospitals = SAMPLE_HOSPITALS.map((h, i) => ({
      ...h,
      latitude: loc ? loc.latitude + (i * 0.01) : 28.6139 + (i * 0.01),
      longitude: loc ? loc.longitude + (i * 0.01) : 77.2090 + (i * 0.01)
    }));
    const pharmacies = SAMPLE_PHARMACIES.map((p, i) => ({
      ...p,
      latitude: loc ? loc.latitude + (i * 0.008) : 28.6139 + (i * 0.008),
      longitude: loc ? loc.longitude + (i * 0.008) : 77.2090 + (i * 0.008)
    }));
    setNearbyHospitals(hospitals);
    setNearbyPharmacies(pharmacies);
  };

  const handleStartEmergency = () => {
    setAppState("questions");
    setCurrentQuestion(0);
    setAnswers({ isConscious: null, isBreathing: null, hasHeavyBleeding: null });
    setFirstAidData(null);
  };

  const handleAnswer = useCallback(async (question: keyof DecisionAnswers, answer: boolean) => {
    const newAnswers = { ...answers, [question]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < 2) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // All questions answered, get first aid instructions
      setAppState("results");
      setIsLoading(true);

      // Log emergency to backend
      try {
        await apiRequest("POST", "/api/emergencies", {
          latitude: location?.latitude,
          longitude: location?.longitude,
          emergencyType: "road_accident",
          isConscious: String(newAnswers.isConscious),
          isBreathing: String(newAnswers.isBreathing),
          hasHeavyBleeding: String(newAnswers.hasHeavyBleeding)
        });
      } catch (error) {
        console.error('Error logging emergency:', error);
      }

      // Get AI first aid instructions
      if (isOffline) {
        // Use offline guide with CPR if needed
        const offlineGuide = { ...OFFLINE_FIRST_AID };
        if (newAnswers.isConscious === false && newAnswers.isBreathing === false) {
          offlineGuide.showCPR = true;
          offlineGuide.priority = 'critical';
          offlineGuide.instructions = [
            "This is a CRITICAL emergency - the patient needs CPR",
            "Call 108 immediately if you haven't already",
            "Begin CPR if you are trained (see animation below)",
            "Continue CPR until help arrives or patient starts breathing",
            ...offlineGuide.instructions.slice(1)
          ];
        }
        setFirstAidData(offlineGuide);
        setIsLoading(false);
      } else {
        try {
          const response = await apiRequest("POST", "/api/first-aid", {
            isConscious: newAnswers.isConscious,
            isBreathing: newAnswers.isBreathing,
            hasHeavyBleeding: newAnswers.hasHeavyBleeding
          });
          setFirstAidData(response as FirstAidResponse);
        } catch (error) {
          console.error('Error getting first aid instructions:', error);
          // Fall back to offline guide
          const offlineGuide = { ...OFFLINE_FIRST_AID };
          if (newAnswers.isConscious === false && newAnswers.isBreathing === false) {
            offlineGuide.showCPR = true;
          }
          setFirstAidData(offlineGuide);
        }
        setIsLoading(false);
      }
    }
  }, [answers, currentQuestion, isOffline, location]);

  const handleBack = () => {
    if (appState === "questions") {
      if (currentQuestion > 0) {
        setCurrentQuestion(prev => prev - 1);
      } else {
        setAppState("home");
      }
    } else if (appState === "results") {
      setAppState("questions");
      setCurrentQuestion(2);
    }
  };

  const handleRestart = () => {
    setAppState("home");
    setCurrentQuestion(0);
    setAnswers({ isConscious: null, isBreathing: null, hasHeavyBleeding: null });
    setFirstAidData(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          {appState === "home" && (
            <HomePage 
              onStartEmergency={handleStartEmergency}
              location={location}
              locationError={locationError}
            />
          )}
          
          {appState === "questions" && (
            <DecisionTree
              currentQuestion={currentQuestion}
              answers={answers}
              onAnswer={handleAnswer}
              onBack={handleBack}
            />
          )}
          
          {appState === "results" && (
            <FirstAidResults
              answers={answers}
              location={location}
              firstAidData={firstAidData}
              isLoading={isLoading}
              isOffline={isOffline}
              nearbyHospitals={nearbyHospitals}
              nearbyPharmacies={nearbyPharmacies}
              onBack={handleBack}
              onRestart={handleRestart}
            />
          )}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
