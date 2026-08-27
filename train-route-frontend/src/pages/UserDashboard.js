import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { User, Ticket, Clock, MapPin, CheckCircle2, Award, Download, Trash2, RefreshCw, LogOut } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const UPCOMING_TRIP = {
  id: "RT-849201934",
  trainName: "Rajdhani Express (12951)",
  from: "NDLS",
  to: "BCT",
  date: "24 Oct 2026",
  departure: "16:25",
  arrival: "08:15 (+1)",
  platform: "4",
  coach: "A1",
  seat: "24 (Lower)",
  status: "Active Sync",
};

export const UserDashboard = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("username") || "Alex Carter");
  const [editName, setEditName] = useState(username);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await axios.get(`${API_URL}/api/user/history`, {
        headers: { "x-auth-token": token }
      });
      if (res.data.success) {
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.error("Failed to load search history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSaveProfile = () => {
    setUsername(editName);
    localStorage.setItem("username", editName);
    setIsEditing(false);
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/user/history/${id}`, {
        headers: { "x-auth-token": token }
      });
      setHistory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${API_URL}/api/user/history/clear/all`, {
        headers: { "x-auth-token": token }
      });
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      {/* Header Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10"
      >
        <div className="w-24 h-24 rounded-full bg-dark-card border-2 border-cyan/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <User size={40} className="text-cyan" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            {isEditing ? (
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-3xl font-bold bg-white/10 text-white border border-cyan/50 rounded px-2 py-1 outline-none"
                autoFocus
              />
            ) : (
              <h1 className="text-3xl font-bold text-white tracking-tight">{username}</h1>
            )}
            <Badge variant="success" className="w-fit mx-auto md:mx-0 gap-1"><Award size={12} /> Platinum Traveler</Badge>
          </div>
          <p className="text-gray-400">Member since 2024 • 14,203 km traveled</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          {isEditing ? (
            <Button onClick={handleSaveProfile} className="bg-emerald-green hover:bg-emerald-green/80 text-black">Save Profile</Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
          <Button variant="ghost" onClick={handleLogout} className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut size={16} /> Sign Out
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Content (Left Column) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Upcoming Trip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Ticket className="text-electric-blue" /> Currently Tracking
            </h2>
            <Card className="bg-gradient-to-br from-dark-card to-[#0a192f]/80 border-cyan/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/10 rounded-bl-full pointer-events-none" />
              <CardContent className="p-0">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Route ID: {UPCOMING_TRIP.id}</div>
                    <div className="font-bold text-lg text-white">{UPCOMING_TRIP.trainName}</div>
                  </div>
                  <Badge variant="success" className="animate-pulse-slow">Active Sync</Badge>
                </div>
                
                <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-8 relative">
                  <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-white/5 -translate-y-1/2 hidden sm:block" />
                  
                  <div className="text-center sm:text-left relative z-10 bg-dark-card/50 sm:bg-transparent px-2">
                    <div className="text-3xl font-bold text-cyan mb-1">{UPCOMING_TRIP.departure}</div>
                    <div className="text-sm text-gray-400 mb-2">{UPCOMING_TRIP.date}</div>
                    <div className="font-bold text-white text-xl">{UPCOMING_TRIP.from}</div>
                    <div className="text-xs text-gray-500 mt-1">Platform {UPCOMING_TRIP.platform}</div>
                  </div>

                  <div className="hidden sm:flex flex-col items-center relative z-10 bg-dark-card/50 px-4 rounded-full border border-white/10 py-2">
                    <Clock size={16} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">15h 50m</span>
                  </div>

                  <div className="text-center sm:text-right relative z-10 bg-dark-card/50 sm:bg-transparent px-2">
                    <div className="text-3xl font-bold text-white mb-1">{UPCOMING_TRIP.arrival}</div>
                    <div className="text-sm text-gray-400 mb-2">{UPCOMING_TRIP.date}</div>
                    <div className="font-bold text-white text-xl">{UPCOMING_TRIP.to}</div>
                    <div className="text-xs text-gray-500 mt-1">Destination</div>
                  </div>
                </div>

                <div className="p-6 bg-black/20 flex justify-between items-center flex-wrap gap-4">
                  <div className="flex gap-6">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Coach</div>
                      <div className="font-bold text-white text-lg">{UPCOMING_TRIP.coach}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Seat</div>
                      <div className="font-bold text-white text-lg">{UPCOMING_TRIP.seat}</div>
                    </div>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Download size={16} /> Export Itinerary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Saved Search History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Clock className="text-cyan" size={20} /> Search History & Saved Routes
              </h2>
              {history.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
                >
                  <Trash2 size={13} /> Clear History
                </button>
              )}
            </div>

            <div className="space-y-3">
              {loadingHistory ? (
                <div className="text-center py-8 text-gray-400 text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="animate-spin text-cyan" size={16} /> Loading search history...
                </div>
              ) : history.length === 0 ? (
                <Card className="bg-dark-card/40 border-dashed border-white/10 text-center py-8">
                  <p className="text-gray-400 text-sm">No search history recorded yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Search for routes to auto-save your travel history.</p>
                </Card>
              ) : (
                history.map((item) => (
                  <Card key={item._id} className="bg-dark-card/60 hover:bg-dark-card/80 transition-colors cursor-pointer group">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 size={20} className="text-emerald-green" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-base">
                            {item.from} <span className="text-cyan font-normal mx-1">→</span> {item.to}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {item.routeSummary && item.routeSummary.length > 0
                              ? item.routeSummary.join(" • ")
                              : "Multi-stop BFS search"}{" "}
                            • {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t border-white/5 pt-3 sm:border-0 sm:pt-0">
                        <div className="text-right">
                          <div className="text-base font-bold text-emerald-green">
                            {item.totalFare ? `₹${item.totalFare}` : "N/A"}
                          </div>
                          <div className="text-[10px] text-cyan uppercase tracking-wider font-semibold">
                            {item.stopsCount ? `${item.stopsCount} Leg(s)` : "Direct Path"}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item._id);
                          }}
                          className="text-gray-500 hover:text-red-400 transition-colors p-1"
                          title="Delete entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </motion.div>

        </div>

        {/* Sidebar (Right Column) */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-dark-card/90">
              <CardHeader>
                <CardTitle>Travel Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-electric-blue" size={18} />
                    <span className="text-sm text-gray-300">Most Visited</span>
                  </div>
                  <span className="font-bold text-white">NDLS (12 trips)</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Clock className="text-cyan" size={18} />
                    <span className="text-sm text-gray-300">Time Saved by AI</span>
                  </div>
                  <span className="font-bold text-emerald-green">14.5 Hours</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Ticket className="text-neon-purple" size={18} />
                    <span className="text-sm text-gray-300">Total Routes</span>
                  </div>
                  <span className="font-bold text-white">{history.length}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-[#1a2942] to-[#0a192f] border-electric-blue/30 text-center overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <CardContent className="p-8 relative z-10">
                <div className="w-16 h-16 mx-auto bg-electric-blue/20 rounded-full flex items-center justify-center mb-4 border border-cyan/50">
                  <Award className="text-cyan" size={32} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Pro Route Optimizer</h3>
                <p className="text-sm text-gray-400 mb-6">Unlock exclusive dynamic pricing alerts and priority AI pathfinding.</p>
                <Button className="w-full">Upgrade to Pro</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
