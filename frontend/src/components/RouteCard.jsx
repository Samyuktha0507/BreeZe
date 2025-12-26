import React from 'react';

export default function RouteCard({ type, time, aqi, selected, onClick }) {
  const isCleanest = type === 'cleanest';
  
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
        selected 
          ? (isCleanest ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50') 
          : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
          isCleanest ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {isCleanest ? 'Recommended: Cleanest' : 'Fastest Route'}
        </span>
        <span className="text-lg font-bold text-gray-800">{time} min</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          aqi === "--" ? 'bg-gray-300' : (aqi < 50 ? 'bg-green-500' : aqi < 100 ? 'bg-yellow-500' : 'bg-red-500')
        }`} />
        <p className="text-sm font-medium text-gray-600">
          Avg AQI: <span className="text-gray-900 font-bold">{aqi}</span>
        </p>
      </div>
    </div>
  );
}