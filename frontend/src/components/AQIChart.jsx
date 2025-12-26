import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock data: In Phase 4, Person A will fetch this from the /predict endpoint
const data = [
  { time: '9 AM', aqi: 40 },
  { time: '12 PM', aqi: 55 },
  { time: '3 PM', aqi: 85 },
  { time: '6 PM', aqi: 140 }, // Peak traffic pollution
  { time: '9 PM', aqi: 110 },
  { time: '12 AM', aqi: 60 },
  { time: '3 AM', aqi: 35 },
];

export default function AQIChart() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800">Air Quality Trend</h3>
        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-bold uppercase">Next 24 Hours</span>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              fontSize={10} 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#9ca3af'}}
              tickMargin={10}
            />
            <YAxis 
              fontSize={10} 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#9ca3af'}}
            />
            <Tooltip 
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
            />
            <Area 
              type="monotone" 
              dataKey="aqi" 
              stroke="#16a34a" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorAqi)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex gap-4">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-[10px] text-gray-500">Good</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span className="text-[10px] text-gray-500">Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-[10px] text-gray-500">Unhealthy</span>
        </div>
      </div>
    </div>
  );
}