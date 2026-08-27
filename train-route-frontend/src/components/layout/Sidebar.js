import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, LayoutDashboard, Settings, Train, User, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { name: "Home", path: "/", icon: Home },
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Search Routes", path: "/search", icon: Search },
  { name: "My Profile", path: "/profile", icon: User },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex flex-col w-64 h-screen bg-deep-navy border-r border-white/5 sticky top-0"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-blue to-cyan flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
          <Train className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">RouteFinder<span className="text-cyan">X</span></span>
      </div>

      <div className="flex-1 px-4 py-6 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link key={item.name} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-electric-blue/10 text-cyan neon-border-blue"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={18} className={cn(isActive && "drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]")} />
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-cyan rounded-r-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
      
      <div className="p-6 border-t border-white/5 space-y-1">
        <Link to="/settings">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
            location.pathname === "/settings"
              ? "bg-electric-blue/10 text-cyan neon-border-blue"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}>
            <Settings size={18} className={cn(location.pathname === "/settings" && "drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]")} />
            Settings
          </div>
        </Link>

        {localStorage.getItem("token") && (
          <div 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </div>
        )}
      </div>
    </motion.aside>
  );
};
