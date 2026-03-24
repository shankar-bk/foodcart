"use client";

import React, { useEffect, useState } from "react";
import { Store, Home, Bike, Navigation } from "lucide-react";

interface DeliveryMapProps {
    restaurantName: string;
    deliveryLocation: string;
    status: string;
}

export default function DeliveryMap({ restaurantName, deliveryLocation, status }: DeliveryMapProps) {
    const [progress, setProgress] = useState(0);

    // Animate the rider along the path
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Simulated path for the route
    const pathX1 = 50, pathY1 = 150;
    const pathX2 = 350, pathY2 = 50;
    
    // Calculate rider position based on progress
    const riderX = pathX1 + (pathX2 - pathX1) * (progress / 100);
    const riderY = pathY1 + (pathY2 - pathY1) * (progress / 100);

    return (
        <div className="relative w-full h-48 bg-gray-900 rounded-3xl overflow-hidden shadow-inner border border-gray-800 group">
            {/* Map Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, #4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {/* SVG Illustration */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                {/* Route Path */}
                <path 
                    d={`M ${pathX1} ${pathY1} L ${pathX2} ${pathY2}`}
                    fill="none"
                    stroke="#374151"
                    strokeWidth="4"
                    strokeDasharray="8,8"
                />
                <path 
                    d={`M ${pathX1} ${pathY1} L ${pathX2} ${pathY2}`}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="4"
                    strokeDasharray="400"
                    strokeDashoffset={400 - (400 * progress / 100)}
                    className="transition-all duration-300 ease-linear"
                />

                {/* Restaurant Marker */}
                <g transform={`translate(${pathX1 - 15}, ${pathY1 - 15})`}>
                    <circle cx="15" cy="15" r="18" fill="#1f2937" stroke="#374151" strokeWidth="2" />
                    <foreignObject x="5" y="5" width="20" height="20">
                        <Store className="w-5 h-5 text-orange-500" />
                    </foreignObject>
                </g>

                {/* Delivery location Marker */}
                <g transform={`translate(${pathX2 - 15}, ${pathY2 - 15})`}>
                    <circle cx="15" cy="15" r="18" fill="#1f2937" stroke="#374151" strokeWidth="2" />
                    <foreignObject x="5" y="5" width="20" height="20">
                        <Home className="w-5 h-5 text-blue-400" />
                    </foreignObject>
                </g>

                {/* Animated Rider */}
                <g transform={`translate(${riderX - 12}, ${riderY - 12})`}>
                    <circle cx="12" cy="12" r="12" fill="#f97316" className="animate-ping opacity-20" />
                    <circle cx="12" cy="12" r="12" fill="#f97316" className="shadow-lg shadow-orange-500/50" />
                    <foreignObject x="4" y="4" width="16" height="16">
                        <Bike className="w-4 h-4 text-white" />
                    </foreignObject>
                </g>
            </svg>

            {/* Labels */}
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live Route Simulation</span>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2">
               <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(deliveryLocation)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
               >
                <Navigation className="w-3 h-3" /> Start Navigation
               </a>
            </div>

            {/* Float Info */}
            <div className="absolute bottom-4 left-4 flex gap-4">
                <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/10">
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Est. Distance</p>
                    <p className="text-sm font-black text-white italic">2.4 km</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/10">
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Est. Time</p>
                    <p className="text-sm font-black text-white italic">12 mins</p>
                </div>
            </div>
        </div>
    );
}
