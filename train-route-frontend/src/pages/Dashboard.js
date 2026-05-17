import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Activity, Users, Train, Zap, ArrowUpRight, TrendingUp } from "lucide-react";

export const Dashboard = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">Intelligence Dashboard</h1>
        <p className="text-gray-400 mt-2">Real-time insights and network analytics.</p>
      </motion.div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Active Network Trains", value: "4,291", change: "+12%", icon: Train, color: "text-cyan" },
          { title: "Network Load", value: "87%", change: "+5%", icon: Activity, color: "text-orange-400" },
          { title: "Searches Today", value: "1.2M", change: "+24%", icon: Users, color: "text-emerald-green" },
          { title: "Avg Delay", value: "14m", change: "-2m", icon: Zap, color: "text-electric-blue" },
        ].map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-dark-card/60">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">{metric.title}</p>
                    <h3 className="text-3xl font-bold text-white">{metric.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl bg-white/5 ${metric.color}`}>
                    <metric.icon size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-emerald-green flex items-center gap-1 font-medium">
                    <ArrowUpRight size={16} />
                    {metric.change}
                  </span>
                  <span className="text-gray-500 ml-2">vs last 24h</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-1 lg:col-span-2"
        >
          <Card className="h-full bg-dark-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-cyan" size={20} />
                Network Traffic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full border border-white/5 rounded-lg bg-[#0a192f]/50 flex items-center justify-center relative overflow-hidden">
                {/* Simulated Chart */}
                <svg className="absolute bottom-0 w-full h-[200px]" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,100 L0,50 Q25,30 50,60 T100,20 L100,100 Z" fill="rgba(0, 240, 255, 0.1)" stroke="#00F0FF" strokeWidth="2" />
                </svg>
                <span className="text-gray-500 z-10 text-sm">Real-time capacity visualization</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full bg-dark-card/60">
            <CardHeader>
              <CardTitle>Live Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { text: "Train 12951 redirected to platform 4 at NDLS", time: "2 min ago", type: "alert" },
                  { text: "Heavy booking activity detected on NDLS-BCT route", time: "5 min ago", type: "info" },
                  { text: "Network maintenance at Kanpur Central completed", time: "12 min ago", type: "success" },
                  { text: "New route optimization algorithm deployed", time: "1 hr ago", type: "info" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start relative">
                    <div className="absolute top-8 left-1.5 w-0.5 h-10 bg-white/10 -z-10" />
                    <div className={`mt-1 w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] flex-shrink-0 ${
                      item.type === 'alert' ? 'bg-orange-500 text-orange-500' :
                      item.type === 'success' ? 'bg-emerald-green text-emerald-green' :
                      'bg-cyan text-cyan'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-300">{item.text}</p>
                      <span className="text-xs text-gray-500">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
