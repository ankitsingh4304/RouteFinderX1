import React from "react";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-deep-navy overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative bg-[#060d18]">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-electric-blue/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-green/10 rounded-full blur-[100px] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full relative z-10"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Mobile Bottom Nav Placeholder */}
      <div className="md:hidden fixed bottom-0 w-full h-16 bg-dark-card border-t border-white/10 z-50 flex items-center justify-around px-4 backdrop-blur-lg">
        {/* We can map over NAV_ITEMS here similarly to the sidebar for mobile */}
      </div>
    </div>
  );
};
