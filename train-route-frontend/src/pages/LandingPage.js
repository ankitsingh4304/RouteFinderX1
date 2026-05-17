import React from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Activity, Navigation2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col relative overflow-hidden bg-[#060d18]">
      {/* CSS Injection for custom train animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes trackGlow {
          0%, 100% { opacity: 0.2; filter: drop-shadow(0 0 3px rgba(0, 240, 255, 0.3)); }
          50% { opacity: 0.5; filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.7)); }
        }
        @keyframes smoothTrain {
          0% {
            transform: translateX(-150%) translateZ(0);
          }
          40% {
            /* Decelerates as it approaches the center node */
            transform: translateX(35vw) translateZ(0);
          }
          60% {
            /* Glides slowly through the station area */
            transform: translateX(50vw) translateZ(0);
          }
          100% {
            /* Accelerates away off-screen */
            transform: translateX(120vw) translateZ(0);
          }
        }
        @keyframes stationPulse {
          0%, 100% { transform: scale(1) translate(-50%, -50%); opacity: 0.7; box-shadow: 0 0 8px rgba(0, 240, 255, 0.4); }
          50% { transform: scale(1.15) translate(-45%, -45%); opacity: 1; box-shadow: 0 0 20px rgba(0, 240, 255, 0.8); }
        }
        .animate-track {
          animation: trackGlow 4s infinite ease-in-out;
        }
        .animate-train {
          /* Smooth easing mimics physical mass and momentum */
          animation: smoothTrain 9s infinite cubic-bezier(0.3, 0.1, 0.25, 1);
          will-change: transform;
        }
        .animate-station {
          animation: stationPulse 3s infinite ease-in-out;
          transform-origin: center;
        }
      `}} />

      {/* Top High-Tech Train Animation Panel */}
      <div className="absolute top-0 left-0 w-full h-[140px] pointer-events-none overflow-hidden z-0">
        {/* Neon track */}
        <div className="absolute top-[80px] left-0 w-full h-[2px] bg-cyan/30 animate-track" />

        {/* Station hub nodes */}
        <div className="absolute top-[80px] left-[40%] w-5 h-5 rounded-full bg-cyan border border-[#060d18] flex items-center justify-center animate-station z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
          <div className="absolute top-6 text-cyan text-[10px] font-bold tracking-widest whitespace-nowrap">DELHI_HUB</div>
        </div>

        <div className="absolute top-[80px] left-[70%] w-3 h-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white/30 border border-[#060d18] flex items-center justify-center z-10">
        </div>

        {/* Futuristic Train */}
        <div className="absolute top-[80px] -translate-y-[90%] left-0 animate-train z-20">
          <svg width="380" height="40" viewBox="0 0 380 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sleek Train Body */}
            <path d="M0 25 H 310 C 340 25, 365 20, 375 10 L 370 30 H 0 Z" fill="url(#trainGrad)" />
            
            {/* Windows - More realistic and evenly spaced */}
            <path d="M30 14 H 60 L 55 9 H 25 Z M75 14 H 105 L 100 9 H 70 Z M120 14 H 150 L 145 9 H 115 Z M165 14 H 195 L 190 9 H 160 Z M210 14 H 240 L 235 9 H 205 Z M255 14 H 285 L 280 9 H 250 Z M300 14 H 330 L 325 9 H 295 Z" fill="#00F0FF" opacity="0.85" />
            
            {/* Headlight */}
            <path d="M368 12 L 378 9 L 372 17 Z" fill="#FFF" />
            
            {/* Glow beam extending forward */}
            <polygon points="372 13, 500 -10, 500 35" fill="url(#beamGrad)" opacity="0.3" />

            <defs>
              <linearGradient id="trainGrad" x1="0" y1="25" x2="380" y2="25" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#060d18" stopOpacity="0" />
                <stop offset="15%" stopColor="#217ADB" stopOpacity="0.9" />
                <stop offset="75%" stopColor="#00F0FF" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
              <linearGradient id="beamGrad" x1="372" y1="13" x2="500" y2="13" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="1" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="max-w-3xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-blue/10 border border-cyan/30 text-cyan text-sm font-medium mb-6 mt-4">
              <span className="w-2 h-2 rounded-full bg-emerald-green animate-pulse-slow" />
              Live Indian Railways Network
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight"
          >
            Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-electric-blue">Smartest</span> <br />
            Train Routes Across India
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl"
          >
            AI-powered railway route optimization. Get the fastest, most efficient travel plans instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Button size="lg" className="gap-2 rounded-full px-8 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]" onClick={() => navigate('/search')}>
              <SearchIcon size={20} />
              Search Routes
            </Button>
          </motion.div>
        </div>

        {/* Floating Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 relative z-10">
          {[
            { label: "Active Trains", value: "8,432", icon: Activity, color: "text-emerald-green" },
            { label: "Stations Covered", value: "7,349", icon: Navigation2, color: "text-cyan" },
            { label: "Route Optimizations", value: "1.2M+", icon: Zap, color: "text-electric-blue" },
            { label: "Avg. Time Saved", value: "2.4 hrs", icon: Activity, color: "text-neon-purple" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
            >
              <Card className="bg-dark-card/50 border-white/5 hover:border-white/10 transition-colors">
                <CardContent className="p-6">
                  <stat.icon className={`mb-4 ${stat.color}`} size={24} />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const SearchIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);