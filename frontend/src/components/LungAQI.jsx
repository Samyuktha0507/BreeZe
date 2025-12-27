import React from "react";
import "./LungAQI.css";

const lungColor = (aqi) => {
  if (aqi <= 50) return "#4CAF50"; // Fresh - Green
  if (aqi <= 100) return "#8BC34A"; // Moderate - Light Green
  if (aqi <= 200) return "#FF9800"; // Poor - Orange
  return "#9E9E9E"; // Hazardous - Grey/Smoke
};

function LungAQI({ aqi }) {
  const good = aqi <= 100;
  const bad = aqi > 200;

  return (
    <div className={`scene h-full w-full rounded-3xl bg-white p-8 shadow-xl flex flex-col items-center justify-center relative overflow-hidden ${good ? "good" : bad ? "bad" : ""}`}>
      
      {/* VISUAL ENVIRONMENT */}
      {good && <div className="breeze">
        <span>🍂</span><span>🍁</span><span>🍃</span>
      </div>}
      {bad && <div className="smoke" />}

      {/* LUNGS SVG */}
      <svg viewBox="0 0 260 320" className="lungs w-64 md:w-80">
        <rect x="126" y="10" width="8" height="55" fill="#bbb" />
        <path d="M130 65 L90 115" stroke="#aaa" strokeWidth="4" />
        <path d="M130 65 L170 115" stroke="#aaa" strokeWidth="4" />

        <path
          className="lung breathe"
          d="M125 75 C55 95, 35 175, 60 260 C80 300, 120 300, 125 265 Z"
          fill={lungColor(aqi)}
        />
        <path
          className="lung breathe"
          d="M135 75 C205 95, 225 175, 200 260 C180 300, 140 300, 135 265 Z"
          fill={lungColor(aqi)}
        />

        {/* Alveoli details */}
        {[...Array(20)].map((_, i) => (
          <circle key={i} cx={90 + Math.random() * 30} cy={150 + Math.random() * 90} r="2" fill="#ffffff30" />
        ))}
        {[...Array(20)].map((_, i) => (
          <circle key={i+20} cx={150 + Math.random() * 30} cy={150 + Math.random() * 90} r="2" fill="#ffffff30" />
        ))}
      </svg>

      <div className="mt-6 text-center z-10">
        <h3 className="text-3xl font-black text-slate-800">AQI: {aqi}</h3>
        <p className="text-slate-500 font-bold uppercase tracking-widest">
          {aqi <= 50 ? "Excellent Condition" : aqi <= 100 ? "Healthy" : aqi <= 200 ? "High Stress" : "Hazardous Exposure"}
        </p>
      </div>
    </div>
  );
}

export default LungAQI;