import { GoogleGenAI, Type } from "@google/genai";
import { IncidentType, SeverityLevel } from "../types";

// Initialize Gemini Client
// Note: We use process.env.API_KEY as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AIAnalysisResult {
  severity: SeverityLevel;
  type: IncidentType;
  routedTo: string;
  riskAnalysis: string;
}

/**
 * Analyzes a raw text description of an incident to determine severity, classification, and routing.
 */
export const analyzeIncidentAI = async (description: string): Promise<AIAnalysisResult> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are an AI dispatcher for a university campus safety system. 
      Analyze the following incident report description and categorize it.
      
      Rules:
      1. Determine the Incident Type (Harassment, Medical, Violence, Fire, Suspicious Activity, Infrastructure, Other).
      2. Determine Severity (Low, Medium, High, Critical). "Critical" is for immediate life threats.
      3. Determine Routing (Security Patrol, Medical EMS, Maintenance, Student Services).
      4. Provide a brief 1-sentence risk analysis explaining why.

      Description: "${description}"
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING, enum: Object.values(SeverityLevel) },
            type: { type: Type.STRING, enum: Object.values(IncidentType) },
            routedTo: { type: Type.STRING },
            riskAnalysis: { type: Type.STRING },
          },
          required: ["severity", "type", "routedTo", "riskAnalysis"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      severity: result.severity || SeverityLevel.MEDIUM,
      type: result.type || IncidentType.OTHER,
      routedTo: result.routedTo || "Campus Security",
      riskAnalysis: result.riskAnalysis || "Automated analysis completed.",
    };

  } catch (error) {
    console.error("Gemini AI Analysis Failed:", error);
    // Fallback logic if AI fails
    return {
      severity: SeverityLevel.MEDIUM,
      type: IncidentType.OTHER,
      routedTo: "Campus Security",
      riskAnalysis: "AI analysis unavailable. Defaulting to manual review.",
    };
  }
};

/**
 * Generates a safety briefing summary for the admin dashboard
 */
export const generateSafetyBriefing = async (incidentsCount: number, highRiskZones: string[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a short, professional 2-sentence executive safety summary for a dashboard. 
      Context: There are ${incidentsCount} active incidents. High risk zones are: ${highRiskZones.join(', ')}.`,
    });
    return response.text || "System operational. Monitoring active zones.";
  } catch (e) {
    return "System operational. Monitoring active zones.";
  }
}
