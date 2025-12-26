import React from 'react';
import { Car, Bus, Bike, Home, Users, TrendingDown } from 'lucide-react';

export default function CitizenResponsibility() {
  const actions = [
    { title: "Carpooling", impact: "-15% NO2", icon: <Users size={24}/>, color: "bg-blue-100 text-blue-600" },
    { title: "Public Transit", impact: "-22% PM2.5", icon: <Bus size={24}/>, color: "bg-green-100 text-green-600" },
    { title: "Cycling", impact: "-30% Carbon", icon: <Bike size={24}/>, color: "bg-orange-100 text-orange-600" },
    { title: "Work From Home", impact: "-2.5kg CO2", icon: <Home size={24}/>, color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Citizen <span className="text-blue-600">Impact</span></h2>
          <p className="text-gray-500 mt-2 font-medium">Every choice counts. See how your actions improve BreeZe's air quality.</p>
        </div>
        <div className="bg-green-600 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-green-100">
          <TrendingDown size={28} />
          <div>
            <p className="text-[10px] font-bold uppercase opacity-80">Community Goal</p>
            <p className="text-xl font-black">-12.4% AQI</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action, i) => (
          <div key={i} className="group p-6 rounded-3xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all cursor-pointer">
            <div className="flex justify-between items-center">
              <div className={`p-4 rounded-2xl ${action.color}`}>
                {action.icon}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Impact</p>
                <p className="text-lg font-black text-gray-800">{action.impact}</p>
              </div>
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{action.title}</h3>
            <p className="text-sm text-gray-500 mt-1">Estimated daily reduction based on BreeZe urban flow ML.</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 text-center">
         <p className="text-blue-800 font-bold">💡 Tip: Using a bus instead of a car for 5km saves enough oxygen for 3 people today!</p>
      </div>
    </div>
  );
}