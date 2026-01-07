import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";
import { insertEmergencySchema } from "@shared/schema";

// Initialize Gemini AI client using Replit AI Integrations
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "",
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

  // Get nearby places (hospitals and pharmacies)
  // In production, this would use Google Maps API
  app.get("/api/nearby-places", async (req, res) => {
    try {
      const { lat, lng } = req.query;
      const latitude = parseFloat(lat as string) || 28.6139;
      const longitude = parseFloat(lng as string) || 77.2090;

      // In a real implementation, this would call Google Maps Places API
      // For now, we generate realistic-looking sample data based on location
      const hospitals = [
        {
          name: "City General Hospital",
          address: "Main Road, Near Central Station",
          distance: "1.2 km",
          latitude: latitude + 0.008,
          longitude: longitude + 0.006,
          type: "hospital"
        },
        {
          name: "Apollo Emergency Care",
          address: "Medical District, Highway Junction",
          distance: "2.5 km",
          latitude: latitude + 0.015,
          longitude: longitude + 0.012,
          type: "hospital"
        },
        {
          name: "Government Medical Center",
          address: "Hospital Road, Sector 5",
          distance: "3.1 km",
          latitude: latitude + 0.022,
          longitude: longitude + 0.018,
          type: "hospital"
        }
      ];

      const pharmacies = [
        {
          name: "24/7 MedPlus Pharmacy",
          address: "Near City Hospital, Main Street",
          distance: "0.8 km",
          latitude: latitude + 0.005,
          longitude: longitude + 0.004,
          type: "pharmacy"
        },
        {
          name: "Apollo Pharmacy",
          address: "Medical District Plaza",
          distance: "1.5 km",
          latitude: latitude + 0.010,
          longitude: longitude + 0.008,
          type: "pharmacy"
        }
      ];

      res.json({ hospitals, pharmacies });
    } catch (error) {
      console.error("Error fetching nearby places:", error);
      res.status(500).json({ error: "Failed to fetch nearby places" });
    }
  });

  return httpServer;
}
