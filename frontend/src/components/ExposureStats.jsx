import React from 'react';
import { Activity, AlertTriangle } from 'lucide-react';

export default function ExposureStats({ currentAQI }) {
  // Simple health logic formula
  const cigaretteEquivalence = (currentAQI / 22).toFixed(1);
  
  let status = { label: "Good", color: "bg-green-500", text: "Air is fresh. Perfect for outdoor exercise." };
  if (currentAQI > 150) status = { label: "Hazardous", color: "bg-purple-600", text: "Avoid outdoors. Wear an N95 mask." };
  else if (currentAQI > 100) status = { label: "Unhealthy", color: "bg-red-500", text: "Sensitive groups should stay inside." };
  else if (currentAQI > 50) status = { label: "Moderate", color: "bg-yellow-500", text: "Acceptable quality for most people." };

  return (
    <div className="space-y-4">
      <div className={`${status.color} p-6 rounded-2xl text-white shadow-lg transition-colors duration-500`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold uppercase tracking-wider text-xs opacity-80">Daily Exposure Score</h3>
          <Activity size={20} className="opacity-80" />
        </div>
        <div className="text-5xl font-black mb-2">{currentAQI} <span className="text-lg font-normal">AQI</span></div>
        <p className="text-white/90 text-sm font-medium italic border-t border-white/20 pt-3">
          "Equivalent to breathing {cigaretteEquivalence} cigarettes today"
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3">
        <div className={`p-2 rounded-lg ${status.color} bg-opacity-10`}>
          <AlertTriangle className={status.color.replace('bg-', 'text-')} size={20} />
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-sm">{status.label}</h4>
          <p className="text-xs text-gray-500">{status.text}</p>
        </div>
      </div>
    </div>
  );
}