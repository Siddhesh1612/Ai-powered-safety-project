import React, { useState, useEffect } from 'react';
import { useSafety } from '../context/SafetyContext';
import CampusMap from './CampusMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shield, Activity, Users, Radio, CheckCircle, Clock, AlertOctagon } from 'lucide-react';
import { IncidentStatus, SeverityLevel } from '../types';
import { generateSafetyBriefing } from '../services/geminiService';

const AdminDashboard: React.FC = () => {
  const { incidents, zones, stats, updateIncidentStatus } = useSafety();
  const [briefing, setBriefing] = useState("Loading AI Briefing...");

  // AI Summary Effect
  useEffect(() => {
    const fetchBriefing = async () => {
        const highRiskZones = zones.filter(z => z.riskScore > 50).map(z => z.name);
        const text = await generateSafetyBriefing(stats.activeAlerts, highRiskZones);
        setBriefing(text);
    };
    fetchBriefing();
  }, [stats.activeAlerts, zones]);

  const activeIncidents = incidents.filter(i => i.status !== IncidentStatus.RESOLVED);

  const riskData = zones.map(z => ({
    name: z.name,
    score: z.riskScore,
  }));

  const getSeverityColor = (sev: SeverityLevel) => {
    switch (sev) {
      case SeverityLevel.CRITICAL: return 'text-red-500 bg-red-500/10 border-red-500/20';
      case SeverityLevel.HIGH: return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case SeverityLevel.MEDIUM: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-6 overflow-hidden max-h-screen">
      
      {/* LEFT COLUMN: Map & Analytics */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar">
        {/* Header Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
            <div className="flex items-center gap-3 text-slate-400 mb-1 text-sm font-medium">
                <Activity className="w-4 h-4" /> Active Alerts
            </div>
            <div className="text-2xl font-bold text-white">{stats.activeAlerts}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
            <div className="flex items-center gap-3 text-slate-400 mb-1 text-sm font-medium">
                <Shield className="w-4 h-4" /> Campus Risk
            </div>
            <div className={`text-2xl font-bold ${stats.campusRiskLevel === 'Severe' ? 'text-red-500' : stats.campusRiskLevel === 'High' ? 'text-orange-500' : 'text-green-500'}`}>
                {stats.campusRiskLevel}
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
            <div className="flex items-center gap-3 text-slate-400 mb-1 text-sm font-medium">
                <Clock className="w-4 h-4" /> Avg Response
            </div>
            <div className="text-2xl font-bold text-white">{stats.avgResponseTime}m</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
             <div className="flex items-center gap-3 text-slate-400 mb-1 text-sm font-medium">
                <Users className="w-4 h-4" /> Total Reports
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalIncidents}</div>
          </div>
        </div>

        {/* AI Briefing */}
        <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
             <div className="p-2 bg-blue-500/20 rounded-lg">
                <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
             </div>
             <div>
                 <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-1">AI Safety Briefing</h3>
                 <p className="text-slate-300 text-sm leading-relaxed">{briefing}</p>
             </div>
        </div>

        {/* Map & Chart Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[300px]">
             {/* Map Card */}
             <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-red-400" /> Live Threat Map
                </h3>
                <div className="flex-1 min-h-[300px]">
                    <CampusMap showHeatmap={true} />
                </div>
             </div>

             {/* Chart Card */}
             <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col">
                <h3 className="text-white font-semibold mb-4">Zone Risk Assessment</h3>
                <div className="flex-1 w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={riskData}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} 
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.score > 50 ? '#ef4444' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Incident Feed */}
      <div className="w-full lg:w-96 bg-slate-800 border-l border-slate-700 flex flex-col h-full absolute right-0 top-0 bottom-0 z-20 shadow-2xl lg:relative lg:shadow-none lg:border-l-0 lg:border lg:rounded-xl">
        <div className="p-4 border-b border-slate-700 bg-slate-800 sticky top-0 z-10">
            <h2 className="text-lg font-bold text-white flex items-center justify-between">
                <span>Incoming Feed</span>
                <span className="text-xs bg-red-500 px-2 py-0.5 rounded text-white animate-pulse">{activeIncidents.length} LIVE</span>
            </h2>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
            {activeIncidents.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>All clear. No active incidents.</p>
                </div>
            )}

            {activeIncidents.map(incident => (
                <div key={incident.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 transition-all hover:border-slate-500">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getSeverityColor(incident.severity)}`}>
                            {incident.severity}
                        </span>
                        <span className="text-slate-500 text-xs">
                            {new Date(incident.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    
                    <h4 className="text-white font-medium text-sm mb-1">{incident.type}</h4>
                    <p className="text-slate-400 text-xs mb-3 line-clamp-2">{incident.description}</p>
                    
                    {/* AI Insights Section */}
                    {incident.aiAnalysis && (
                        <div className="mb-3 p-2 bg-slate-800/50 rounded border-l-2 border-blue-500">
                            <p className="text-[10px] text-blue-300">
                                <span className="font-bold">AI ROUTING:</span> {incident.routedTo}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 italic">
                                "{incident.aiAnalysis}"
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2 mt-2">
                        <button 
                            onClick={() => updateIncidentStatus(incident.id, IncidentStatus.INVESTIGATING)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-1.5 rounded transition-colors"
                        >
                            Investigate
                        </button>
                        <button 
                            onClick={() => updateIncidentStatus(incident.id, IncidentStatus.RESOLVED)}
                            className="flex-1 bg-slate-800 hover:bg-green-900/30 hover:text-green-400 text-slate-300 text-xs py-1.5 rounded transition-colors"
                        >
                            Resolve
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
