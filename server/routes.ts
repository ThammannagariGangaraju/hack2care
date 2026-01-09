import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";
import { insertEmergencySchema } from "@shared/schema";

// Helper function to calculate distance between two points in meters
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to format distance as string
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const meters = calculateDistanceMeters(lat1, lon1, lat2, lon2);
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

  // Initialize Gemini AI client using Replit AI Integrations
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "",
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Translate text using Gemini
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLang } = req.body;
      if (!text || !targetLang) {
        return res.status(400).json({ error: "Missing text or targetLang" });
      }

      const prompt = `Translate the following JSON object values into ${targetLang}. Keep the keys exactly the same.
Return ONLY the translated JSON object, no other text or markdown.

JSON to translate:
${JSON.stringify(text)}`;

      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let cleanText = response.text().trim();
      
      // Clean up markdown blocks if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const translated = JSON.parse(cleanText);
      res.json(translated);
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Translation failed" });
    }
  });

  // Log emergency
  app.post("/api/emergencies", async (req, res) => {
    try {
      const validatedData = insertEmergencySchema.parse(req.body);
      const emergency = await storage.createEmergency(validatedData);
      res.status(201).json(emergency);
    } catch (error) {
      console.error("Error logging emergency:", error);
      res.status(400).json({ error: "Invalid emergency data" });
    }
  });

  // Get first aid instructions from Gemini AI
  app.post("/api/first-aid", async (req, res) => {
    try {
      const { isConscious, isBreathing, hasHeavyBleeding } = req.body;
      
      // Determine if CPR is needed
      const showCPR = isConscious === false && isBreathing === false;
      
      // Create prompt for Gemini
      const prompt = `You are an emergency first aid assistant for road accidents. Based on the following patient assessment, provide 4-5 clear, simple first aid instructions that a bystander can follow.

Patient Assessment:
- Conscious: ${isConscious ? 'Yes' : 'No'}
- Breathing normally: ${isBreathing ? 'Yes' : 'No'}
- Heavy bleeding: ${hasHeavyBleeding ? 'Yes' : 'No'}

IMPORTANT RULES:
1. Give ONLY basic first aid steps a non-medical person can do
2. Use very simple, clear language
3. NEVER suggest any medicines or dosages
4. NEVER provide medical diagnosis
5. Each instruction should be one short sentence
6. Always remind to call emergency services (108)
${showCPR ? '7. This patient needs CPR - mention this is critical but they should only perform if trained' : ''}
${hasHeavyBleeding ? '7. Focus on controlling bleeding with direct pressure' : ''}

Respond with ONLY a JSON object in this exact format (no markdown, no code blocks):
{"instructions": ["instruction 1", "instruction 2", "instruction 3", "instruction 4"], "priority": "${showCPR ? 'critical' : hasHeavyBleeding ? 'urgent' : 'moderate'}"}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      // Extract text from the response
      const text = response.text || 
        response.candidates?.[0]?.content?.parts?.[0]?.text || 
        "";
      
      // Parse the JSON response
      let instructions: string[] = [];
      let priority: 'critical' | 'urgent' | 'moderate' = 'moderate';
      
      try {
        // Clean up the response - remove markdown code blocks if present
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
        }
        
        const parsed = JSON.parse(cleanText);
        instructions = parsed.instructions || [];
        priority = parsed.priority || 'moderate';
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        // Fallback instructions
        instructions = [
          "Call emergency services (108) immediately",
          "Ensure the scene is safe before approaching",
          "Keep the patient calm and still - do not move unless necessary",
          "Apply direct pressure to any visible bleeding",
          "Stay with the patient until help arrives"
        ];
        if (showCPR) {
          instructions.unshift("CRITICAL: Patient needs CPR if you are trained");
          priority = 'critical';
        }
      }

      res.json({
        instructions,
        showCPR,
        priority
      });
    } catch (error) {
      console.error("Error getting first aid instructions:", error);
      
      // Return fallback instructions
      const showCPR = req.body.isConscious === false && req.body.isBreathing === false;
      res.json({
        instructions: [
          showCPR ? "CRITICAL: Patient may need CPR if you are trained" : "Ensure the scene is safe",
          "Call emergency services (108) immediately",
          "Keep the patient calm and still",
          "Apply pressure to any visible bleeding",
          "Stay with the patient until help arrives"
        ],
        showCPR,
        priority: showCPR ? 'critical' : 'moderate'
      });
    }
  });

  // Get nearby places (hospitals and pharmacies) using OpenStreetMap Overpass API (FREE, no API key)
  app.get("/api/nearby-places", async (req, res) => {
    try {
      const { lat, lng } = req.query;
      
      if (!lat || !lng) {
        res.status(400).json({ error: "Location required", message: "Please provide latitude and longitude" });
        return;
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        res.status(400).json({ error: "Invalid coordinates", message: "Latitude and longitude must be valid numbers" });
        return;
      }
      
      const radiusMeters = 5000; // 5km search radius
      
      // Overpass API query for hospitals, clinics, pharmacies, and medical stores
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
          way["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
          node["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});
          way["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});
          node["healthcare"="hospital"](around:${radiusMeters},${latitude},${longitude});
          way["healthcare"="hospital"](around:${radiusMeters},${latitude},${longitude});
          node["healthcare"="clinic"](around:${radiusMeters},${latitude},${longitude});
          way["healthcare"="clinic"](around:${radiusMeters},${latitude},${longitude});
          node["amenity"="pharmacy"](around:${radiusMeters},${latitude},${longitude});
          way["amenity"="pharmacy"](around:${radiusMeters},${latitude},${longitude});
          node["shop"="chemist"](around:${radiusMeters},${latitude},${longitude});
          way["shop"="chemist"](around:${radiusMeters},${latitude},${longitude});
          node["healthcare"="pharmacy"](around:${radiusMeters},${latitude},${longitude});
          way["healthcare"="pharmacy"](around:${radiusMeters},${latitude},${longitude});
          node["shop"="medical_supply"](around:${radiusMeters},${latitude},${longitude});
          way["shop"="medical_supply"](around:${radiusMeters},${latitude},${longitude});
        );
        out center;
      `;
      
      console.log("Fetching places from Overpass API...");
      
      const overpassUrl = "https://overpass-api.de/api/interpreter";
      const response = await fetch(overpassUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });
      
      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`);
      }
      
      const data = await response.json();
      const elements = data.elements || [];
      
      console.log(`Overpass API returned ${elements.length} elements`);
      
      const hospitals: any[] = [];
      const pharmacies: any[] = [];
      const medicalStores: any[] = [];
      
      // Track unique places to avoid duplicates from different tag sources
      const seenPlaces = new Set<string>();
      
      for (const element of elements) {
        // Get coordinates (for ways, use center; for nodes, use lat/lon)
        const placeLat = element.center?.lat || element.lat;
        const placeLon = element.center?.lon || element.lon;
        
        if (!placeLat || !placeLon) continue;
        
        // Create unique key to avoid duplicates
        const placeKey = `${placeLat.toFixed(5)}_${placeLon.toFixed(5)}`;
        if (seenPlaces.has(placeKey)) continue;
        seenPlaces.add(placeKey);
        
        const tags = element.tags || {};
        const amenity = tags.amenity;
        const healthcare = tags.healthcare;
        const shop = tags.shop;
        
        // Determine place type
        const isHospital = amenity === "hospital" || healthcare === "hospital";
        const isClinic = amenity === "clinic" || healthcare === "clinic";
        const isPharmacy = amenity === "pharmacy" || healthcare === "pharmacy";
        const isMedicalStore = shop === "chemist" || shop === "medical_supply";
        
        // Determine hospital ownership (government vs private)
        const operator = tags.operator?.toLowerCase() || "";
        const operatorType = tags["operator:type"]?.toLowerCase() || "";
        const name = (tags.name || "").toLowerCase();
        
        let ownership = "Unknown";
        if (operatorType.includes("government") || operatorType.includes("public") ||
            operator.includes("government") || operator.includes("govt") ||
            name.includes("government") || name.includes("govt") || 
            name.includes("district") || name.includes("area hospital") ||
            name.includes("phc") || name.includes("chc") || name.includes("taluk")) {
          ownership = "Government";
        } else if (operatorType.includes("private") || operator.includes("private") ||
                   name.includes("private")) {
          ownership = "Private";
        }
        
        // Build address from available tags
        const addressParts = [];
        if (tags["addr:street"]) addressParts.push(tags["addr:street"]);
        if (tags["addr:housenumber"]) addressParts.unshift(tags["addr:housenumber"]);
        if (tags["addr:city"]) addressParts.push(tags["addr:city"]);
        if (tags["addr:postcode"]) addressParts.push(tags["addr:postcode"]);
        
        const address = addressParts.length > 0 
          ? addressParts.join(", ")
          : tags.address || "Address not available";
        
        // Determine display name
        let displayName = tags.name;
        if (!displayName) {
          if (isPharmacy) displayName = "Pharmacy";
          else if (isMedicalStore) displayName = shop === "chemist" ? "Chemist" : "Medical Store";
          else if (isClinic) displayName = "Clinic";
          else displayName = "Hospital";
        }
        
        const place = {
          name: displayName,
          address,
          distance: calculateDistance(latitude, longitude, placeLat, placeLon),
          distanceMeters: calculateDistanceMeters(latitude, longitude, placeLat, placeLon),
          latitude: placeLat,
          longitude: placeLon,
          ownership: (isHospital || isClinic) ? ownership : undefined,
          facilityType: isClinic ? "Clinic" : isHospital ? "Hospital" : undefined,
          phone: tags.phone || tags["contact:phone"] || null,
          website: tags.website || tags["contact:website"] || null,
          openingHours: tags.opening_hours || null
        };
        
        if (isPharmacy) {
          pharmacies.push(place);
        } else if (isMedicalStore) {
          medicalStores.push(place);
        } else if (isHospital || isClinic) {
          hospitals.push(place);
        }
      }
      
      // Sort by distance
      hospitals.sort((a, b) => a.distanceMeters - b.distanceMeters);
      pharmacies.sort((a, b) => a.distanceMeters - b.distanceMeters);
      medicalStores.sort((a, b) => a.distanceMeters - b.distanceMeters);
      
      // Limit to 10 each
      const limitedHospitals = hospitals.slice(0, 10);
      const limitedPharmacies = pharmacies.slice(0, 10);
      const limitedMedicalStores = medicalStores.slice(0, 10);
      
      console.log(`Found ${limitedHospitals.length} hospitals/clinics, ${limitedPharmacies.length} pharmacies, ${limitedMedicalStores.length} medical stores`);
      
      res.json({ 
        hospitals: limitedHospitals, 
        pharmacies: limitedPharmacies,
        medicalStores: limitedMedicalStores,
        source: "openstreetmap"
      });
      
    } catch (error) {
      console.error("Error fetching nearby places:", error);
      res.status(500).json({ 
        error: "Failed to fetch nearby places", 
        message: error instanceof Error ? error.message : "Network error",
        hospitals: [],
        pharmacies: []
      });
    }
  });

  return httpServer;
}
