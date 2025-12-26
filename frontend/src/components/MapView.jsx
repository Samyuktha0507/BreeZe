import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { Search, Navigation, MapPin } from 'lucide-react';

// Marker Fixes
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to auto-center map when searching
function ChangeView({ center }) {
  const map = useMap();
  if (center) map.setView(center, 14);
  return null;
}

export default function MapView({ onRouteDataReceived }) {
  const [startPos, setStartPos] = useState([13.0827, 80.2707]);
  const [endPos, setEndPos] = useState(null);
  const [selectionMode, setSelectionMode] = useState('start'); // 'start' or 'end'
  const [searchText, setSearchText] = useState("");
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle map clicks
  function MapEvents() {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        if (selectionMode === 'start') setStartPos([lat, lng]);
        else setEndPos([lat, lng]);
      },
    });
    return null;
  }

  // Handle text search (Geocoding)
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchText}`);
      if (res.data.length > 0) {
        const newCoords = [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
        if (selectionMode === 'start') setStartPos(newCoords);
        else setEndPos(newCoords);
      }
    } catch (err) { alert("Location not found"); }
  };

  const findRoutes = async () => {
    if (!endPos) return alert("Please select a destination first!");
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/compare-routes', {
        origin: startPos,
        destination: endPos
      });
      setRoutes([
        { color: '#3b82f6', positions: res.data.fastest.path, type: 'fastest' },
        { color: '#10b981', positions: res.data.cleanest.path, type: 'cleanest' }
      ]);
      onRouteDataReceived(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="relative w-full space-y-4">
      {/* Search and Selection UI */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 min-w-[250px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={`Search for ${selectionMode}...`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold">Go</button>
        </form>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setSelectionMode('start')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${selectionMode === 'start' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            <Navigation size={14} /> Start
          </button>
          <button 
            onClick={() => setSelectionMode('end')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${selectionMode === 'end' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
          >
            <MapPin size={14} /> End
          </button>
        </div>

        <button 
          onClick={findRoutes}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl text-sm font-black transition disabled:opacity-50"
        >
          {loading ? "Calculating..." : "Find Best Route"}
        </button>
      </div>

      {/* Map Display */}
      <div className="h-[450px] w-full rounded-3xl overflow-hidden shadow-inner border-4 border-white">
        <MapContainer center={startPos} zoom={13} className="h-full w-full">
          <ChangeView center={selectionMode === 'start' ? startPos : endPos} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents />
          
          <Marker position={startPos}><Popup>Starting Point</Popup></Marker>
          {endPos && <Marker position={endPos}><Popup>Destination</Popup></Marker>}

          {routes.map((r, i) => (
            <Polyline key={i} positions={r.positions} color={r.color} weight={r.type === 'cleanest' ? 6 : 3} opacity={0.7} />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}