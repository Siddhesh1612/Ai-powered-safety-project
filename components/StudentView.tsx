import React, { useState } from 'react';
import { useSafety } from '../context/SafetyContext';
import { IncidentType, Coordinates } from '../types';
import CampusMap from './CampusMap';
import { Send, AlertTriangle, ShieldAlert, MapPin, Mic, Camera } from 'lucide-react';

const StudentView: React.FC = () => {
  const { addIncident, triggerSOS } = useSafety();
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<IncidentType>(IncidentType.SUSPICIOUS);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSOS = () => {
    setSosActive(true);
    triggerSOS();
    setTimeout(() => setSosActive(false), 3000); // Reset animation after 3s
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
        alert("Please tap the map to select a location.");
        return;
    }
    
    setIsSubmitting(true);
    // Simulate network delay
    setTimeout(async () => {
        await addIncident(description, selectedType, location);
        setIsSubmitting(false);
        setSuccessMsg("Report sent securely. AI is analyzing...");
        setDescription('');
        setLocation(null);
        setTimeout(() => setSuccessMsg(''), 5000);
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-20">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Campus<span className="text-blue-500">Shield</span></h1>
          <p className="text-slate-400 text-sm">Anonymous & Secure Reporting</p>
        </div>
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" title="System Online"></div>
      </header>

      {/* SOS Section */}
      <section className="text-center">
        <button
          onClick={handleSOS}
          className={`group relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-[0_0_40px_rgba(239,68,68,0.3)]
            ${sosActive ? 'bg-red-600 scale-95 shadow-[0_0_60px_rgba(239,68,68,0.6)]' : 'bg-gradient-to-br from-red-500 to-red-700 hover:scale-105 active:scale-95'}
          `}
        >
          <ShieldAlert className="w-16 h-16 text-white mb-1" />
          <span className="text-white font-black text-xl tracking-widest">SOS</span>
          <span className="text-red-200 text-xs font-medium">PRESS & HOLD</span>
          
          {/* Ripple Effect */}
          <span className="absolute -inset-4 rounded-full border border-red-500 opacity-20 animate-[ping_2s_ease-in-out_infinite]"></span>
        </button>
        <p className="mt-4 text-slate-400 text-sm">
          Triggers high-priority alert + Live Location
        </p>
      </section>

      {/* Report Form */}
      <section className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-400 mr-2" /> 
            Report Incident
        </h2>

        {successMsg ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-center mb-4">
                {successMsg}
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Incident Type Scroller */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {Object.values(IncidentType).map((type) => (
                <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border
                    ${selectedType === type 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    {type}
                </button>
                ))}
            </div>

            {/* Description */}
            <div className="relative">
                <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened... (AI will analyze this for severity)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px] text-sm resize-none"
                required
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                    <button type="button" className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Camera className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Mic className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Location Picker */}
            <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium flex items-center justify-between">
                    <span>Location {location ? '(Set)' : '(Required)'}</span>
                    {location && <span className="text-blue-400 flex items-center"><MapPin className="w-3 h-3 mr-1"/> Zone: {location.zoneId}</span>}
                </label>
                <div className="h-48 rounded-xl overflow-hidden border border-slate-700">
                    <CampusMap selectable onLocationSelect={setLocation} showHeatmap={false} />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <span className="animate-pulse">Analyzing...</span>
                ) : (
                    <>
                    <Send className="w-4 h-4" /> Submit Anonymous Report
                    </>
                )}
            </button>
            </form>
        )}
      </section>
    </div>
  );
};

export default StudentView;
