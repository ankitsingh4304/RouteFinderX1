import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import TrainSearch from "./components/TrainSearch";
import AuthForm from "./components/AuthForm";
import "./App.css";

const PrivateRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (!token) localStorage.removeItem("token");
  }, [token]);

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <BrowserRouter>
      <div className="main-gradient-bg">
        <div className="center-wrapper">
          <div className="header-flex">
            <span className="header-centered">Train Route Finder</span>
            {token && (
              <button className="logout-btn-header" onClick={logout}>
                LOGOUT
              </button>
            )}
          </div>
          <div className="card-content">
            <Routes>
              <Route path="/login" element={<AuthForm setToken={setToken} />} />
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<TrainSearch token={token} />} />
              </Route>
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
