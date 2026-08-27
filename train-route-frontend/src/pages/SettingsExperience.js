import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Settings, Sliders, Eye, Brain, RefreshCw, CheckCircle, Database } from "lucide-react";

export const SettingsExperience = () => {
  const [activeTab, setActiveTab] = useState("preferences");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Routing preferences state
  const [maxStops, setMaxStops] = useState(localStorage.getItem("settings_max_stops") || "3");
  const [defaultAlgorithm, setDefaultAlgorithm] = useState(localStorage.getItem("settings_default_algo") || "bfs");
  const [maxFare, setMaxFare] = useState(localStorage.getItem("settings_max_fare") || "2000");

  // Interface state
  const [enableGlow, setEnableGlow] = useState(localStorage.getItem("settings_enable_glow") !== "false");
  const [enableAI, setEnableAI] = useState(localStorage.getItem("settings_enable_ai") !== "false");

  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem("settings_max_stops", maxStops);
    localStorage.setItem("settings_default_algo", defaultAlgorithm);
    localStorage.setItem("settings_max_fare", maxFare);
    showSuccess("Routing preferences saved successfully!");
  };

  const handleSaveInterface = () => {
    localStorage.setItem("settings_enable_glow", enableGlow.toString());
    localStorage.setItem("settings_enable_ai", enableAI.toString());
    
    // Dynamically toggle body class for neon glow styles
    if (enableGlow) {
      document.body.classList.remove("disable-glows");
    } else {
      document.body.classList.add("disable-glows");
    }
    
    showSuccess("Interface options updated!");
  };

  const handleClearCache = () => {
    localStorage.removeItem("search_history");
    showSuccess("Search cache cleared successfully.");
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  useEffect(() => {
    // Initial side-effect sync
    if (localStorage.getItem("settings_enable_glow") === "false") {
      document.body.classList.add("disable-glows");
    } else {
      document.body.classList.remove("disable-glows");
    }
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-blue to-cyan flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <Settings className="text-white animate-spin-slow" size={26} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
          <p className="text-gray-400 text-sm">Configure RouteFinderX pathfinding engine & layout rules</p>
        </div>
      </motion.div>

      {/* Success Alert */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 p-4 bg-emerald-green/10 border border-emerald-green/20 rounded-xl text-emerald-green text-sm flex items-center gap-2"
        >
          <CheckCircle size={16} />
          {successMsg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation Tabs */}
        <div className="space-y-1">
          {[
            { id: "preferences", name: "Engine Presets", icon: Sliders },
            { id: "interface", name: "Interface UI", icon: Eye },
            { id: "system", name: "System Cache", icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-electric-blue/15 text-cyan border-l-2 border-cyan shadow-[0_0_15px_rgba(0,240,255,0.05)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon size={16} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Settings Panels */}
        <div className="md:col-span-3">
          {activeTab === "preferences" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-dark-card/50 border-white/5 backdrop-blur-xl">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Sliders className="text-cyan" size={18} /> Pathfinding Engine Presets
                  </h3>
                  <form onSubmit={handleSavePreferences} className="space-y-6">
                    <div>
                      <label className="text-xs text-cyan mb-1.5 block font-medium">Default Max Stops</label>
                      <Input
                        type="number"
                        value={maxStops}
                        onChange={(e) => setMaxStops(e.target.value)}
                        className="bg-white/5 border-white/10"
                        min="1"
                        max="10"
                      />
                      <span className="text-[11px] text-gray-500 mt-1 block">Default limit of stops mathematical BFS considers first.</span>
                    </div>

                    <div>
                      <label className="text-xs text-cyan mb-1.5 block font-medium">Max Budget / Fare Target (₹)</label>
                      <Input
                        type="number"
                        value={maxFare}
                        onChange={(e) => setMaxFare(e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                      <span className="text-[11px] text-gray-500 mt-1 block">Upper boundary for BFS cost heuristics search.</span>
                    </div>

                    <div>
                      <label className="text-xs text-cyan mb-1.5 block font-medium">Default Pathfinding Priority</label>
                      <select
                        value={defaultAlgorithm}
                        onChange={(e) => setDefaultAlgorithm(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan/50 transition-colors"
                      >
                        <option value="bfs" className="bg-[#0b1329]">BFS Stops Optimiser (Pure Math)</option>
                        <option value="priority" className="bg-[#0b1329]">Priority Queue Cost/Duration Engine</option>
                      </select>
                    </div>

                    <Button type="submit" className="w-full shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                      Save Presets
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "interface" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-dark-card/50 border-white/5 backdrop-blur-xl">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Eye className="text-cyan" size={18} /> Interface Customization
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Glow Switch */}
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                      <div>
                        <div className="text-sm font-semibold text-white">Neon Ambient Glows</div>
                        <div className="text-xs text-gray-400 mt-0.5">Toggles glows and drop-shadows across all UI cards</div>
                      </div>
                      <button 
                        onClick={() => setEnableGlow(!enableGlow)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${enableGlow ? "bg-cyan" : "bg-white/20"}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-deep-navy transition-transform duration-200 transform ${enableGlow ? "translate-x-6" : "translate-x-0"}`} />
                      </button>
                    </div>

                    {/* AI Assistant Switch */}
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <Brain size={16} className="text-cyan" /> AI Route Assistant
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">Show dynamic AI congestion & travel pro-tips on search results</div>
                      </div>
                      <button 
                        onClick={() => setEnableAI(!enableAI)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${enableAI ? "bg-cyan" : "bg-white/20"}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-deep-navy transition-transform duration-200 transform ${enableAI ? "translate-x-6" : "translate-x-0"}`} />
                      </button>
                    </div>

                    <Button onClick={handleSaveInterface} className="w-full">
                      Apply UI Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "system" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-dark-card/50 border-white/5 backdrop-blur-xl">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Database className="text-cyan" size={18} /> System Diagnostics & Cache
                  </h3>

                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Database Connection</span>
                        <Badge variant="success" className="animate-pulse-slow">MongoDB Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Active Node Seed Count</span>
                        <span className="text-sm font-bold text-white">50+ Network Trains</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">API Endpoint</span>
                        <span className="text-xs font-mono text-cyan">{process.env.REACT_APP_API_URL || "http://localhost:5000"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button variant="outline" className="flex-1 gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={handleClearCache}>
                        <RefreshCw size={14} /> Clear Cache & History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
