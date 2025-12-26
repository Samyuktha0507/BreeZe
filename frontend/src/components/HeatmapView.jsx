import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import axios from 'axios';
import CustomHeatmapLayer from './HeatmapLayer'; // Import our fix
import 'leaflet/dist/leaflet.css';

export default function HeatmapView() {
  const [points, setPoints] = useState([]);
  const center = [13.0827, 80.2707]; // Chennai

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/heatmap-data?lat=${center[0]}&lon=${center[1]}`);
        setPoints(res.data.heatmap_points);
      } catch (err) {
        console.error("Heatmap fetch failed", err);
      }
    };
    fetchHeatmap();
  }, []);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in duration-700">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-800">ML <span className="text-orange-500">Pollution Heatmap</span></h2>
        <p className="text-sm text-gray-500 font-medium">Predicting AQI density across Chennai city limits.</p>
      </div>

      <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-inner border-4 border-white">
        <MapContainer center={center} zoom={12} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Use our custom stable layer */}
          {points.length > 0 && <CustomHeatmapLayer points={points} />}
        </MapContainer>
      </div>

      <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex gap-4">
              <span className="text-[10px] font-bold text-blue-600 uppercase">● Fresh</span>
              <span className="text-[10px] font-bold text-yellow-600 uppercase">● Moderate</span>
              <span className="text-[10px] font-bold text-red-600 uppercase">● Hazardous</span>
          </div>
          <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">Engine: BreeZe ML v1.4</p>
      </div>
    </div>
  );
}