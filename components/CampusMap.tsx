import React from 'react';
import { useSafety } from '../context/SafetyContext';
import { Coordinates, Incident, Zone } from '../types';

interface CampusMapProps {
  onLocationSelect?: (coords: Coordinates) => void;
  selectable?: boolean;
  showHeatmap?: boolean;
}

const CampusMap: React.FC<CampusMapProps> = ({ onLocationSelect, selectable = false, showHeatmap = true }) => {
  const { zones, incidents } = useSafety();

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectable || !onLocationSelect) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Determine zone based on coordinates
    const foundZone = zones.find(z => 
      x >= z.coordinates.x && x <= z.coordinates.x + z.coordinates.width &&
      y >= z.coordinates.y && y <= z.coordinates.y + z.coordinates.height
    );

    onLocationSelect({ x, y, zoneId: foundZone ? foundZone.id : 'unknown' });
  };

  const getRiskColor = (score: number) => {
    if (score > 70) return 'rgba(239, 68, 68, 0.4)'; // Red
    if (score > 30) return 'rgba(245, 158, 11, 0.3)'; // Amber
    return 'rgba(16, 185, 129, 0.1)'; // Green
  };

  return (
    <div className="relative w-full aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl group">
      {/* Background Grid */}
      <div 
        className={`absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 ${selectable ? 'cursor-crosshair' : 'cursor-default'}`} 
        onClick={handleMapClick}
      />

      {/* Zones Layer (Heatmap) */}
      {zones.map(zone => (
        <div
          key={zone.id}
          style={{
            left: `${zone.coordinates.x}%`,
            top: `${zone.coordinates.y}%`,
            width: `${zone.coordinates.width}%`,
            height: `${zone.coordinates.height}%`,
            backgroundColor: showHeatmap ? getRiskColor(zone.riskScore) : 'transparent',
          }}
          className="absolute border border-white/5 rounded-lg transition-all duration-500 flex items-center justify-center pointer-events-none"
        >
          <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{zone.name}</span>
        </div>
      ))}

      {/* Incidents Layer */}
      {incidents.map((incident) => {
         // Don't show resolved incidents on map to keep it clean, unless actively filtering
         if (incident.status === 'Resolved' || incident.status === 'False Alarm') return null;

         const isCritical = incident.severity === 'Critical' || incident.severity === 'High';

         return (
          <div
            key={incident.id}
            style={{ left: `${incident.location.x}%`, top: `${incident.location.y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className={`relative flex items-center justify-center ${isCritical ? 'w-6 h-6' : 'w-4 h-4'}`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCritical ? 'bg-red-500' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full ${isCritical ? 'h-4 w-4 bg-red-600' : 'h-3 w-3 bg-amber-500'}`}></span>
            </div>
          </div>
         );
      })}
      
      {/* Overlay for selection instruction */}
      {selectable && (
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs shadow-lg border border-slate-600">
            Tap map to pinpoint location
          </span>
        </div>
      )}
    </div>
  );
};

export default CampusMap;
