import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Mail, Lock, User, Train, ArrowLeft, CheckCircle } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const AuthPage = ({ setToken }) => {
  const navigate = useNavigate();

  // Modes: "login" | "register" | "forgot"
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Validation rules
  const validateForm = () => {
    // 1. Username constraints (for Login & Register)
    if (mode !== "forgot") {
      if (!formData.username.trim()) {
        return "Username is required.";
      }
      if (formData.username.includes("@")) {
        return "Username cannot be an email address or contain '@'.";
      }
    }

    // 2. Email constraints (for Register & Forgot Password)
    if (mode === "register" || mode === "forgot") {
      if (!formData.email.trim()) {
        return "Email address is required.";
      }
      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailRegex.test(formData.email.trim())) {
        return "Please enter a valid @gmail.com email address.";
      }
    }

    // 3. Password constraints (for Login & Register)
    if (mode !== "forgot") {
      if (!formData.password) {
        return "Password is required.";
      }
      if (formData.password.length < 6) {
        return "Password must be at least 6 characters long.";
      }
      const hasLetter = /[a-zA-Z]/.test(formData.password);
      const hasNumber = /\d/.test(formData.password);
      if (!hasLetter || !hasNumber) {
        return "Password must contain both letters and numbers.";
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Perform validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (mode === "forgot") {
        // Request Password Reset endpoint
        const res = await fetch(`${API_URL}/api/auth/request-reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email.trim() }),
        });
        const data = await res.json();

        if (res.ok && data.msg) {
          setSuccess(data.msg || "Password reset link has been sent to your @gmail.com address!");
        } else {
          setError(data.msg || (data.errors && data.errors[0]?.msg) || "Failed to send reset link.");
        }
      } else {
        // Login or Register
        const url = mode === "login" ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`;
        const body = mode === "login" 
          ? { username: formData.username.trim(), password: formData.password } 
          : { username: formData.username.trim(), email: formData.email.trim(), password: formData.password };
        
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        
        if (data.token) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", formData.username.trim());
          navigate("/search");
        } else {
          setError(data.msg || (data.errors && data.errors[0]?.msg) || "Authentication failed. Please try again.");
        }
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-deep-navy px-4">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-electric-blue/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-emerald-green/20 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Header */}
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
              {mode === "login" && "Sign in to your account"}
              {mode === "register" && "Create a new account"}
              {mode === "forgot" && "Reset Password"}
            </h3>
            
            {/* Error Banner */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium text-center">
                {error}
              </motion.div>
            )}

            {/* Success Banner */}
            {success && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-emerald-green/10 border border-emerald-green/20 rounded-lg text-emerald-green text-xs font-medium flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{success}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input (Login & Register modes) */}
              {mode !== "forgot" && (
                <div>
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username (e.g. alex_carter)"
                    icon={User}
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block px-1">Cannot be an email address or contain '@'</span>
                </div>
              )}
              
              {/* Email Input (Register & Forgot Password modes) */}
              <AnimatePresence>
                {(mode === "register" || mode === "forgot") && (
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
                      placeholder="Email address (e.g. user@gmail.com)"
                      icon={Mail}
                    />
                    <span className="text-[10px] text-cyan mt-1 block px-1">Must be a valid @gmail.com address</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password Input (Login & Register modes) */}
              {mode !== "forgot" && (
                <div>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    icon={Lock}
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block px-1">Min 6 characters, must contain letters & numbers</span>
                </div>
              )}

              {/* Forgot Password Link in Login mode */}
              {mode === "login" && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-xs text-cyan hover:underline focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? "Processing..." : (
                  mode === "login" ? "Sign In" : (mode === "register" ? "Create Account" : "Send Reset Link")
                )}
              </Button>
            </form>

            {/* Switch Mode Links */}
            <div className="mt-6 text-center text-sm text-gray-400">
              {mode === "forgot" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-cyan hover:underline inline-flex items-center gap-1 focus:outline-none"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              ) : (
                <>
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === "login" ? "register" : "login");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-cyan hover:underline focus:outline-none font-medium"
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
