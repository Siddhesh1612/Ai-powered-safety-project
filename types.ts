export enum IncidentType {
  HARASSMENT = 'Harassment',
  MEDICAL = 'Medical',
  VIOLENCE = 'Violence',
  FIRE = 'Fire',
  SUSPICIOUS = 'Suspicious Activity',
  INFRASTRUCTURE = 'Infrastructure',
  OTHER = 'Other'
}

export enum SeverityLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum IncidentStatus {
  NEW = 'New',
  INVESTIGATING = 'Investigating',
  RESOLVED = 'Resolved',
  FALSE_ALARM = 'False Alarm'
}

export interface Coordinates {
  x: number; // Percentage 0-100 relative to map width
  y: number; // Percentage 0-100 relative to map height
  zoneId: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  description: string;
  location: Coordinates;
  timestamp: number;
  status: IncidentStatus;
  severity: SeverityLevel;
  isAnonymous: boolean;
  aiAnalysis?: string; // AI summary or reasoning
  routedTo?: string; // e.g., "Medical Team", "Campus Security"
}

export interface Zone {
  id: string;
  name: string;
  riskScore: number; // 0-100
  incidentCount: number;
  coordinates: { x: number; y: number; width: number; height: number }; // For heatmap rendering
}

export interface Stats {
  totalIncidents: number;
  activeAlerts: number;
  avgResponseTime: number; // minutes
  campusRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
}
