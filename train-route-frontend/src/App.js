import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { SearchExperience } from "./pages/SearchExperience";
import { UserDashboard } from "./pages/UserDashboard";
import { SettingsExperience } from "./pages/SettingsExperience";
import { AuthPage } from "./pages/AuthPage";
import "./index.css";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (!token) localStorage.removeItem("token");
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage setToken={setToken} />} />
        
        {/* App Layout encompasses the authenticated and public pages that have a sidebar */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={
            <PrivateRoute>
              <SearchExperience token={token} />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <SettingsExperience />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
