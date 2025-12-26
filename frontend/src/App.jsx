import React, { useState } from 'react';
import Header from './components/Header';
import MapView from './components/MapView'; // Module 2
import HeatmapView from './components/HeatmapView'; // Module 1
import Scheduler from './components/Scheduler'; // Module 3
import CitizenResponsibility from './components/CitizenResponsibility'; // Module 4
import { Map, Wind, Calendar, Users } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState('routing');
  const [routeData, setRouteData] = useState(null);

  const menu = [
    { id: 'routing', name: 'Green Route', icon: <Map size={18}/> },
    { id: 'heatmap', name: 'ML Heatmap', icon: <Wind size={18}/> },
    { id: 'scheduler', name: 'Plan Scheduler', icon: <Calendar size={18}/> },
    { id: 'impact', name: 'Citizen Impact', icon: <Users size={18}/> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-4 shadow-sm z-10">
          <div className="mb-8 px-4">
            <h1 className="text-2xl font-black text-green-600 tracking-tighter">BreeZe</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">IIT-SNUC Hackathon</p>
          </div>
          
          <nav className="flex-1 space-y-2">
            {menu.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeModule === item.id 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Live Status</p>
            <p className="text-xs text-blue-800 font-medium leading-tight">Hybrid Engine Online: ML + IoT active.</p>
          </div>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            {activeModule === 'routing' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <MapView onRouteDataReceived={setRouteData} />
              </div>
            )}

            {activeModule === 'heatmap' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <HeatmapView />
              </div>
            )}

            {activeModule === 'scheduler' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <Scheduler />
              </div>
            )}

            {activeModule === 'impact' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <CitizenResponsibility />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}