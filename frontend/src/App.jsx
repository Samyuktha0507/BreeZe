import React, { useState } from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import ExposureStats from './components/ExposureStats';
import AQIChart from './components/AQIChart';
import RouteCard from './components/RouteCard';

function App() {
  const [routeData, setRouteData] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map & Routes Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <MapView onRouteDataReceived={setRouteData} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RouteCard 
              type="fastest"
              time={routeData?.fastest?.time || "--"}
              aqi={routeData?.fastest?.aqi || "--"}
              selected={true}
            />
            <RouteCard 
              type="cleanest"
              time={routeData?.cleanest?.time || "--"}
              aqi={routeData?.cleanest?.aqi || "--"}
              selected={false}
            />
          </div>
        </div>

        {/* Health & Trends Section */}
        <div className="space-y-6">
          <ExposureStats currentAQI={routeData?.fastest?.aqi || 50} />
          <AQIChart />
        </div>
      </main>
    </div>
  );
}

export default App;