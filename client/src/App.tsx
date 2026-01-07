import { useState, useEffect, useCallback } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home";
import DecisionTree from "@/pages/decision-tree";
import FirstAidResults from "@/pages/first-aid-results";
import type { DecisionAnswers, FirstAidResponse, LocationData } from "@shared/schema";
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

// Generate basic first aid guide based on answers - INSTANT, no API needed
function getBasicFirstAidGuide(answers: DecisionAnswers): FirstAidResponse {
  const needsCPR = answers.isConscious === false && answers.isBreathing === false;
  const hasBleeding = answers.hasHeavyBleeding === true;
  const isUnconscious = answers.isConscious === false;
  
  let instructions: string[] = [];
  let priority: 'critical' | 'urgent' | 'moderate' = 'moderate';

  if (needsCPR) {
    priority = 'critical';
    instructions = [
      "Call 108 for ambulance IMMEDIATELY",
      "Check airway - tilt head back, lift chin",
      "Begin CPR if trained - 30 chest compressions",
      "Give 2 rescue breaths after compressions",
      "Continue CPR until help arrives"
    ];
  } else if (isUnconscious) {
    priority = 'urgent';
    instructions = [
      "Call 108 for ambulance immediately",
      "Place person in recovery position (on their side)",
      "Keep airway clear and monitor breathing",
      "Do NOT move them unless in danger",
      "Stay with them until help arrives"
    ];
  } else if (hasBleeding) {
    priority = 'urgent';
    instructions = [
      "Call 108 for ambulance",
      "Apply firm pressure to the wound with clean cloth",
      "Keep pressing - do not remove the cloth",
      "If blood soaks through, add more cloth on top",
      "Keep the injured area raised if possible"
    ];
  } else {
    priority = 'moderate';
    instructions = [
      "Call 108 if medical help is needed",
      "Keep the person calm and still",
      "Do NOT move them unless in immediate danger",
      "Check for any other injuries",
      "Stay with them until help arrives"
    ];
  }

  return {
    instructions,
    showCPR: needsCPR,
    priority
  };
}

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

  // Get user location on mount
  useEffect(() => {
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
      // All questions answered - IMMEDIATELY show basic steps (no loading)
      setAppState("results");
      
      // Create basic offline guide based on answers - shown IMMEDIATELY
      const basicGuide = getBasicFirstAidGuide(newAnswers);
      setFirstAidData(basicGuide);
      setIsLoading(false); // No loading - instant display

      // Log emergency to backend (in background)
      apiRequest("POST", "/api/emergencies", {
        latitude: location?.latitude,
        longitude: location?.longitude,
        emergencyType: "road_accident",
        isConscious: String(newAnswers.isConscious),
        isBreathing: String(newAnswers.isBreathing),
        hasHeavyBleeding: String(newAnswers.hasHeavyBleeding)
      }).catch(error => console.error('Error logging emergency:', error));

      // If online, fetch enhanced AI steps in background and update
      if (!isOffline) {
        apiRequest("POST", "/api/first-aid", {
          isConscious: newAnswers.isConscious,
          isBreathing: newAnswers.isBreathing,
          hasHeavyBleeding: newAnswers.hasHeavyBleeding
        }).then(async (response) => {
          const data = await response.json();
          // Update with AI-enhanced instructions
          setFirstAidData(data as FirstAidResponse);
        }).catch(error => {
          console.error('Error getting AI first aid:', error);
          // Keep basic guide on error
        });
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
