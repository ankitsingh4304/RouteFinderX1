import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import TrainSearch from "./components/TrainSearch";
import AuthForm from "./components/AuthForm";
import './App.css';

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
              <button className="logout-btn-header" onClick={logout}>LOGOUT</button>
            )}
          </div>
          <div className="card-content">
            {token ? (
              <TrainSearch token={token} />
            ) : (
              <AuthForm setToken={setToken} />
            )}
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
