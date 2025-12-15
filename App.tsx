import React, { useState } from 'react';
import { SafetyProvider } from './context/SafetyContext';
import StudentView from './components/StudentView';
import AdminDashboard from './components/AdminDashboard';
import { Shield, User, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'student' | 'admin'>('student');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <SafetyProvider>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
        
        {/* Mobile Navigation Toggle */}
        <div className="lg:hidden fixed top-4 right-4 z-50">
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-slate-800 rounded-full shadow-lg text-white border border-slate-700"
            >
                {isMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
            </button>
        </div>

        {/* Floating Navigation (Desktop & Mobile Drawer) */}
        <nav className={`
            fixed top-0 bottom-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-40 transform transition-transform duration-300 ease-in-out
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:w-20 lg:flex-col lg:items-center lg:py-8 lg:border-r
        `}>
            <div className="p-6 lg:p-0 lg:mb-8 flex items-center lg:justify-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-white text-xl lg:hidden">CampusShield</span>
            </div>

            <div className="flex flex-col gap-2 p-4 lg:p-0 lg:gap-6 w-full lg:items-center">
                <button 
                    onClick={() => { setView('student'); setIsMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full lg:w-12 lg:h-12 lg:justify-center lg:p-0 transition-all
                        ${view === 'student' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                    `}
                >
                    <User className="w-5 h-5" />
                    <span className="lg:hidden font-medium">Student View</span>
                </button>

                <button 
                    onClick={() => { setView('admin'); setIsMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full lg:w-12 lg:h-12 lg:justify-center lg:p-0 transition-all
                        ${view === 'admin' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                    `}
                >
                    <Shield className="w-5 h-5" />
                    <span className="lg:hidden font-medium">Admin Dispatch</span>
                </button>
            </div>
            
            <div className="mt-auto p-4 lg:p-0 lg:pb-8 text-center">
                <p className="text-xs text-slate-600 lg:hidden">v1.0.0 Hackathon Build</p>
            </div>
        </nav>

        {/* Main Content Area */}
        <main className="lg:ml-20 min-h-screen">
            {view === 'student' ? <StudentView /> : <AdminDashboard />}
        </main>

      </div>
    </SafetyProvider>
  );
};

export default App;
