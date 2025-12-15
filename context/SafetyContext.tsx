import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Incident, Zone, IncidentType, SeverityLevel, IncidentStatus, Coordinates, Stats } from '../types';
import { analyzeIncidentAI } from '../services/geminiService';

interface SafetyContextType {
  incidents: Incident[];
  zones: Zone[];
  stats: Stats;
  addIncident: (description: string, type: IncidentType, location: Coordinates, isSOS?: boolean) => Promise<void>;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  triggerSOS: () => void;
  refreshRiskAnalysis: () => void;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

// Mock Campus Zones
const INITIAL_ZONES: Zone[] = [
  { id: 'z1', name: 'North Dorms', riskScore: 10, incidentCount: 0, coordinates: { x: 10, y: 10, width: 30, height: 30 } },
  { id: 'z2', name: 'Science Labs', riskScore: 5, incidentCount: 0, coordinates: { x: 50, y: 10, width: 40, height: 40 } },
  { id: 'z3', name: 'Library Plaza', riskScore: 20, incidentCount: 0, coordinates: { x: 10, y: 50, width: 40, height: 40 } },
  { id: 'z4', name: 'Sports Complex', riskScore: 15, incidentCount: 0, coordinates: { x: 60, y: 60, width: 30, height: 30 } },
];

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [stats, setStats] = useState<Stats>({
    totalIncidents: 0,
    activeAlerts: 0,
    avgResponseTime: 4.2,
    campusRiskLevel: 'Low'
  });

  // Calculate stats and risk scores whenever incidents change
  const refreshRiskAnalysis = useCallback(() => {
    const newZones = zones.map(zone => {
      // Simple heuristic: Count active incidents in this zone
      // Refined logic: Weighted by severity
      const zoneIncidents = incidents.filter(inc => inc.location.zoneId === zone.id && inc.status !== IncidentStatus.RESOLVED);
      
      let score = 0;
      zoneIncidents.forEach(inc => {
        if (inc.severity === SeverityLevel.CRITICAL) score += 40;
        else if (inc.severity === SeverityLevel.HIGH) score += 20;
        else if (inc.severity === SeverityLevel.MEDIUM) score += 10;
        else score += 5;
      });

      // Decay score slightly (mocking historical decay) or clamp at 100
      return { ...zone, incidentCount: zoneIncidents.length, riskScore: Math.min(score, 100) };
    });

    setZones(newZones);

    // Global Stats
    const active = incidents.filter(i => i.status !== IncidentStatus.RESOLVED && i.status !== IncidentStatus.FALSE_ALARM).length;
    const maxZoneScore = Math.max(...newZones.map(z => z.riskScore));
    
    let riskLevel: Stats['campusRiskLevel'] = 'Low';
    if (maxZoneScore > 75) riskLevel = 'Severe';
    else if (maxZoneScore > 50) riskLevel = 'High';
    else if (maxZoneScore > 25) riskLevel = 'Moderate';

    setStats(prev => ({
      ...prev,
      totalIncidents: incidents.length,
      activeAlerts: active,
      campusRiskLevel: riskLevel
    }));
  }, [incidents, zones]);

  useEffect(() => {
    refreshRiskAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents]);

  const addIncident = async (description: string, type: IncidentType, location: Coordinates, isSOS = false) => {
    // 1. Immediate UI update (Optimistic)
    const newId = Math.random().toString(36).substring(7);
    const timestamp = Date.now();

    const baseIncident: Incident = {
      id: newId,
      type: isSOS ? IncidentType.VIOLENCE : type, // Default SOS to Violence until analyzed
      description: isSOS ? "EMERGENCY SOS BEACON ACTIVATED" : description,
      location,
      timestamp,
      status: IncidentStatus.NEW,
      severity: isSOS ? SeverityLevel.CRITICAL : SeverityLevel.LOW, // Placeholder
      isAnonymous: true,
      routedTo: "Pending Analysis...",
      aiAnalysis: "Analyzing..."
    };

    setIncidents(prev => [baseIncident, ...prev]);

    // 2. AI Analysis (Async)
    if (!isSOS && description) {
        // Use Gemini
        const analysis = await analyzeIncidentAI(description);
        
        setIncidents(prev => prev.map(inc => 
          inc.id === newId ? { 
            ...inc, 
            severity: analysis.severity, 
            type: analysis.type, // Allow AI to correct the type
            routedTo: analysis.routedTo,
            aiAnalysis: analysis.riskAnalysis
          } : inc
        ));
    } else if (isSOS) {
       // SOS hardcoded logic
       setIncidents(prev => prev.map(inc => 
          inc.id === newId ? { 
            ...inc, 
            severity: SeverityLevel.CRITICAL,
            routedTo: "ALL UNITS + EMS",
            aiAnalysis: "SOS Pattern Detected. Immediate dispatch required."
          } : inc
        ));
    }
  };

  const updateIncidentStatus = (id: string, status: IncidentStatus) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status } : inc));
  };

  const triggerSOS = () => {
    // Random location generator for SOS demo
    const randomZone = INITIAL_ZONES[Math.floor(Math.random() * INITIAL_ZONES.length)];
    const x = randomZone.coordinates.x + Math.random() * 10;
    const y = randomZone.coordinates.y + Math.random() * 10;
    
    addIncident("SOS Beacon", IncidentType.VIOLENCE, { x, y, zoneId: randomZone.id }, true);
  };

  return (
    <SafetyContext.Provider value={{ incidents, zones, stats, addIncident, updateIncidentStatus, triggerSOS, refreshRiskAnalysis }}>
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (!context) throw new Error("useSafety must be used within SafetyProvider");
  return context;
};
