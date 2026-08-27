import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { MapPin, Calendar, Clock, ChevronRight, Train as TrainIcon, ArrowRightLeft } from "lucide-react";
import { analyzeSearchExperience } from "../lib/aiEngine";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const SearchExperience = ({ token }) => {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    dateOfJourney: "",
    maxTransfers: localStorage.getItem("settings_max_stops") || 2,
    maxFare: localStorage.getItem("settings_max_fare") || "",
    maxDuration: "",
    minAvailability: 1,
    minTransferTime: "0:30",
    page: 1,
    limit: 10,
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const authToken = token || localStorage.getItem("token");

    if (!authToken) {
      setError("You are not logged in. Please sign in to search routes.");
      setLoading(false);
      return;
    }

    try {
      const headers = { "x-auth-token": authToken };
      const body = {
        from: formData.from.toUpperCase(),
        to: formData.to.toUpperCase(),
        dateOfJourney: formData.dateOfJourney || undefined,
        maxTransfers: Number(formData.maxTransfers),
        maxFare: formData.maxFare ? Number(formData.maxFare) : undefined,
        maxDuration: formData.maxDuration || undefined,
        minAvailability: Number(formData.minAvailability),
        minTransferTime: formData.minTransferTime || "0:30",
        page: Number(formData.page),
        limit: Number(formData.limit),
      };

      const res = await axios.post(`${API_URL}/api/trains/search-priority-bfs`, body, { headers });
      const returnedResults = res.data.results || [];
      setResults(returnedResults);

      // Auto-log to Search History API
      try {
        const topResult = returnedResults[0];
        const routeSummary = topResult?.route ? topResult.route.map(r => r.train) : [];
        await axios.post(`${API_URL}/api/user/history`, {
          from: formData.from.toUpperCase(),
          to: formData.to.toUpperCase(),
          dateOfJourney: formData.dateOfJourney,
          totalFare: topResult?.totalFare || 0,
          stopsCount: topResult?.route?.length || 0,
          routeSummary
        }, { headers });
      } catch (historyErr) {
        console.warn("Could not auto-save search history:", historyErr);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log out and sign in again.");
      } else {
        setError(err.response?.data.message || "Search failed. Try again.");
      }
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Where to next?</h1>
        <p className="text-gray-400">Discover optimal routes across the network.</p>
      </motion.div>

      {/* Search Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-dark-card/80 p-2 mb-10 neon-border-blue relative z-20">
          <form onSubmit={handleSearch} className="flex flex-col gap-4 p-2">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Input
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  placeholder="From Station (e.g. NDLS)"
                  icon={MapPin}
                  className="h-14 bg-white/5 border-none text-lg"
                  required
                />
              </div>
              
              <div className="hidden md:flex items-center justify-center px-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-cyan">
                  <ArrowRightLeft size={16} />
                </div>
              </div>

              <div className="flex-1">
                <Input
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  placeholder="To Station (e.g. BCT)"
                  icon={MapPin}
                  className="h-14 bg-white/5 border-none text-lg"
                  required
                />
              </div>

              <div className="flex-1">
                <Input
                  name="dateOfJourney"
                  type="date"
                  value={formData.dateOfJourney}
                  onChange={handleChange}
                  icon={Calendar}
                  className="h-14 bg-white/5 border-none text-lg"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="h-14 px-8 text-lg w-full md:w-auto"
              >
                {loading ? "Optimizing..." : "Search"}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-7 gap-3 pt-2">
              <div>
                <label className="text-xs text-cyan mb-1 block px-1 font-medium">Max Transfers</label>
                <Input
                  name="maxTransfers"
                  type="number"
                  placeholder="e.g. 2"
                  value={formData.maxTransfers}
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 h-10"
                />
              </div>
              <div>
                <label className="text-xs text-cyan mb-1 block px-1 font-medium">Max Fare (₹)</label>
                <Input
                  name="maxFare"
                  type="number"
                  placeholder="e.g. 1500"
                  value={formData.maxFare}
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 h-10"
                />
              </div>
              <div>
                <label className="text-xs text-cyan mb-1 block px-1 font-medium">Max Time (hh:mm)</label>
                <Input
                  name="maxDuration"
                  type="text"
                  placeholder="e.g. 12:00"
                  value={formData.maxDuration}
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 h-10"
                />
              </div>
              <div>
                <label className="text-xs text-cyan mb-1 block px-1 font-medium">Transfer Gap</label>
                <Input
                  name="minTransferTime"
                  type="text"
                  placeholder="e.g. 0:30"
                  value={formData.minTransferTime}
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 h-10"
                />
              </div>
              <div>
                <label className="text-xs text-cyan mb-1 block px-1 font-medium">Min Seats</label>
                <Input
                  name="minAvailability"
                  type="number"
                  placeholder="e.g. 1"
                  value={formData.minAvailability}
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 h-10"
                />
              </div>
              <div>
                <label className="text-xs text-cyan mb-1 block px-1 font-medium">Page</label>
                <Input
                  name="page"
                  type="number"
                  placeholder="e.g. 1"
                  value={formData.page}
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 h-10"
                />
              </div>
              <div>
                <label className="text-xs text-cyan mb-1 block px-1 font-medium">Limit</label>
                <Input
                  name="limit"
                  type="number"
                  placeholder="e.g. 10"
                  value={formData.limit}
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 h-10"
                />
              </div>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-center mb-6 bg-red-500/10 py-3 rounded-lg border border-red-500/20">
          {error}
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Results List */}
        <div className="flex-1 space-y-4">
          <AnimatePresence>
            {results.map((routeObj, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover:border-cyan/50 hover:bg-dark-card/90 transition-all cursor-pointer group overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                  <CardContent className="p-0">
                    <div className="p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
                      
                      {/* Route Info */}
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-4">
                          <Badge variant="outline" className="gap-1 bg-white/5">
                            <Clock size={12} /> {routeObj.totalDuration ?? "N/A"}
                          </Badge>
                          <Badge variant="success">Efficiency Score: 98</Badge>
                        </div>

                        <div className="flex items-center justify-between relative">
                          {/* Connecting Line */}
                          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 hidden md:block" />
                          
                          {/* Segments */}
                          {routeObj.route && routeObj.route.length > 0 ? (
                            <div className="flex w-full justify-between relative z-10">
                              {routeObj.route.map((leg, legIdx) => (
                                <React.Fragment key={legIdx}>
                                  <div className="bg-dark-card px-2">
                                    <div className="w-12 h-12 rounded-full bg-electric-blue/20 border border-cyan flex items-center justify-center mb-2 mx-auto shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                                      <TrainIcon size={20} className="text-cyan" />
                                    </div>
                                    <div className="text-center">
                                      <div className="font-bold text-white text-lg">{leg.from}</div>
                                      <div className="text-xs text-gray-400">{leg.train}</div>
                                    </div>
                                  </div>
                                  {legIdx === routeObj.route.length - 1 && (
                                    <div className="bg-dark-card px-2">
                                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center mb-2 mx-auto">
                                        <MapPin size={20} className="text-gray-400" />
                                      </div>
                                      <div className="text-center">
                                        <div className="font-bold text-white text-lg">{leg.to}</div>
                                        <div className="text-xs text-gray-400">Destination</div>
                                      </div>
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-500 italic">Route data unavailable</div>
                          )}
                        </div>
                      </div>

                      {/* Action & Price */}
                      <div className="flex flex-row md:flex-col justify-between items-end gap-4 w-full md:w-auto md:min-w-[150px] border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Total Fare</div>
                          <div className="text-2xl font-bold text-emerald-green">₹{routeObj.totalFare ?? "---"}</div>
                        </div>
                        <Button className="w-full md:w-auto rounded-full group-hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                          Select <ChevronRight size={16} className="ml-1" />
                        </Button>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {!loading && results.length === 0 && !error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500 py-12">
                <MapPin size={48} className="mx-auto mb-4 opacity-20" />
                <p>Enter origin and destination to find optimal routes.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* AI Route Assistant Sidebar */}
        {localStorage.getItem("settings_enable_ai") !== "false" && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-80 flex-shrink-0"
          >
            <Card className="bg-dark-card/90 border-cyan/30 sticky top-6 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-electric-blue flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-green rounded-full border-2 border-dark-card animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-tight">AI Assistant</h3>
                    <p className="text-xs text-cyan">Analyzing real-time network</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {analyzeSearchExperience(results, formData.from, formData.to).map((insight, itemIdx) => (
                    <div key={itemIdx} className="bg-white/5 p-4 rounded-lg border border-white/5 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1 h-full ${insight.border}`} />
                      <p className="text-sm text-gray-300">
                        <strong className={insight.color}>{insight.title}:</strong> {insight.text}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
