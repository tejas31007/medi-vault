import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const QuantumGraph = ({ isHackerActive }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(currentData => {
        const oldData = currentData.slice(-20);
        
        const noiseLevel = isHackerActive ? 100 : 10;
        const newPoint = {
          name: Date.now(),
          value: (Math.random() - 0.5) * noiseLevel 
        };

        return [...oldData, newPoint];
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isHackerActive]);

  return (
    <div className="h-48 w-full bg-black rounded-lg border border-slate-700 p-2 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
      
      <h3 className="text-xs font-mono text-slate-400 mb-2 absolute top-2 left-3 z-10">
        LIVE PHOTON POLARIZATION
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={[-100, 100]} hide />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={isHackerActive ? "#ef4444" : "#22c55e"} // Red or Green
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false} // Disable animation for instant real-time feel
          />
        </LineChart>
      </ResponsiveContainer>

      <div className={`absolute bottom-2 right-3 text-xs font-bold font-mono ${isHackerActive ? "text-red-500 animate-pulse" : "text-green-500"}`}>
        {isHackerActive ? "NOISE DETECTED" : "SIGNAL STABLE"}
      </div>
    </div>
  );
};

export default QuantumGraph;