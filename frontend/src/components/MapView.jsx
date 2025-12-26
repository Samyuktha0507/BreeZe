import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix for default Leaflet marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapView({ onRouteDataReceived }) {
  const [startPos] = useState([13.0827, 80.2707]); // Initialized to Chennai
  const [endPos, setEndPos] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sub-component to capture map clicks
  function MapEvents() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setEndPos([lat, lng]);
        fetchRoutes(startPos, [lat, lng]);
      },
    });
    return null;
  }

  const fetchRoutes = async (origin, destination) => {
    setLoading(true);
    try {
      // Connects to Person B's backend endpoint
      const response = await axios.post('http://localhost:8000/compare-routes', {
        origin: origin,
        destination: destination
      });
      
      // Expected backend response: { fastest: { path: [[lat,lng]...], aqi: 120 }, cleanest: { path: [...], aqi: 40 } }
      const data = response.data;
      
      setRoutes([
        { color: '#3b82f6', positions: data.fastest.path, type: 'fastest', info: data.fastest },
        { color: '#10b981', positions: data.cleanest.path, type: 'cleanest', info: data.cleanest }
      ]);

      // Send data back up to App.jsx to update the comparison cards
      if (onRouteDataReceived) onRouteDataReceived(data);
      
    } catch (error) {
      console.error("Backend connection failed. Using mock data for preview:", error);
      // Fallback Mock Data so the UI doesn't break during testing
      setRoutes([
        { color: '#3b82f6', positions: [origin, destination], type: 'fastest' },
        { color: '#10b981', positions: [origin, [origin[0] + 0.005, origin[1] + 0.01], destination], type: 'cleanest' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-[2000] flex items-center justify-center rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      )}
      
      <div className="h-[450px] w-full shadow-inner border border-gray-200 rounded-xl overflow-hidden">
        <MapContainer center={startPos} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents />
          
          <Marker position={startPos}>
            <Popup>Starting Point (Current Location)</Popup>
          </Marker>

          {endPos && (
            <Marker position={endPos}>
              <Popup>Destination</Popup>
            </Marker>
          )}

          {routes.map((route, idx) => (
            <Polyline 
              key={idx} 
              positions={route.positions} 
              color={route.color} 
              weight={route.type === 'cleanest' ? 6 : 4} 
              opacity={0.8}
            />
          ))}
        </MapContainer>
      </div>
      <p className="text-[10px] text-gray-400 mt-2 text-center uppercase tracking-widest font-bold">
        {endPos ? "Route Calculated" : "Click map to set destination"}
      </p>
    </div>
  );
}