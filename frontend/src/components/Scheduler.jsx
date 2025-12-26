import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function Scheduler() {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get('http://localhost:8000/scheduler-advice?lat=13.0827&lon=80.2707');
        setSchedule(res.data.schedule);
      } catch (err) { console.error(err); }
    };
    fetchSchedule();
  }, []);

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Activity <span className="text-green-600">Scheduler</span></h2>
        <p className="text-gray-500 mt-2 font-medium">BreeZe uses temporal ML to find the safest window for your outdoor activities.</p>
      </div>

      <div className="grid gap-4">
        {schedule.map((item, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.01] ${
            item.is_safe ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
          }`}>
            <div className="flex items-center gap-6">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <Clock className="text-gray-400" size={20} />
              </div>
              <div>
                <p className="text-lg font-black text-gray-800">{item.hour}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Predicted AQI: {item.aqi}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                item.is_safe ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
              }`}>
                {item.status}
              </span>
              {item.is_safe ? <CheckCircle2 className="text-green-600" /> : <ShieldAlert className="text-red-600" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}