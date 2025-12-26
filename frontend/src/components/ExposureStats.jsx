import React from 'react';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ExposureStats({ currentAQI }) {
  // Determine air quality status
  let status = { 
    label: "Good", 
    color: "bg-green-500", 
    textColor: "text-green-600",
    advice: "Air quality is ideal for outdoor activities." 
  };

  if (currentAQI > 150) {
    status = { label: "Hazardous", color: "bg-purple-600", textColor: "text-purple-600", advice: "Avoid all outdoor physical activity." };
  } else if (currentAQI > 100) {
    status = { label: "Unhealthy", color: "bg-red-500", textColor: "text-red-600", advice: "Sensitive groups should reduce outdoor time." };
  } else if (currentAQI > 50) {
    status = { label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-600", advice: "Acceptable quality; sensitive individuals should monitor." };
  }

  return (
    <div className="space-y-4">
      {/* Primary Exposure Card */}
      <div className={`${status.color} p-6 rounded-3xl text-white shadow-xl transition-all duration-500`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold uppercase tracking-widest text-[10px] opacity-80">Live Pollution Load</h3>
          <Activity size={18} className="opacity-80" />
        </div>
        
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-6xl font-black">{currentAQI}</span>
          <span className="text-xl font-bold opacity-80">AQI</span>
        </div>
        
        <div className="pt-4 border-t border-white/20">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <p className="text-sm font-semibold italic">Risk Level: {status.label}</p>
          </div>
        </div>
      </div>

      {/* Advice Card */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
        <div className={`p-2 rounded-xl ${status.color} bg-opacity-10 ${status.textColor}`}>
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className={`font-bold text-sm ${status.textColor}`}>Personal Recommendation</h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {status.advice}
          </p>
        </div>
      </div>
    </div>
  );
}