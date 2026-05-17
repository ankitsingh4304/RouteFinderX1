import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Mail, Lock, User, Train } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL;

export const AuthPage = ({ setToken }) => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // We are keeping this simple for the UI demo. Reset/New Password omitted for brevity,
  // but in a full implementation they would be separate modes of this component.

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = isLogin ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`;
      const body = isLogin ? { username: formData.username, password: formData.password } : formData;
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", formData.username);
        navigate("/search");
      } else {
        setError(data.msg || "Authentication failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-deep-navy px-4">
      {/* Background elements */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-electric-blue/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-emerald-green/20 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-blue to-cyan flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] mx-auto mb-4">
            <Train className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">RouteFinder<span className="text-cyan">X</span></h2>
          <p className="text-gray-400 mt-2">Welcome to the future of rail intelligence</p>
        </div>

        <Card className="bg-dark-card/80 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-white mb-6">
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                icon={User}
                required
              />
              
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      icon={Mail}
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                icon={Lock}
                required
              />

              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-cyan hover:underline focus:outline-none"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
