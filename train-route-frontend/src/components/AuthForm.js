import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AuthForm = ({ setToken }) => {
  const query = useQuery();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  // --- forgot/reset flow state ---
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [showSetNew, setShowSetNew] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [setMsg, setSetMsg] = useState("");

  // Detect token param in URL and open Set New Password form automatically
  useEffect(() => {
    const tokenFromUrl = query.get("token");
    if (tokenFromUrl) {
      setShowSetNew(true);
      setResetToken(tokenFromUrl);
    }
  }, [query]); // added query here to fix eslint warning

  // login/register handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const url = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLogin
            ? { username, password }
            : { username, email, password }
        )
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
      } else {
        setError(data.msg || "Authentication failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  // Forgot password UI
  if (showReset) {
    return (
      <section className="auth-section">
        <div className="auth-card">
          <div className="auth-title">Password Reset</div>
          <form className="auth-form-grid" onSubmit={async e => {
            e.preventDefault();
            setResetMsg("");
            const res = await fetch('/api/auth/request-reset', {
              method: 'POST', headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: resetEmail })
            });
            const data = await res.json();
            setResetMsg(data.msg || "Check your email!");
          }}>
            <div>
              <label className="auth-label">Enter your email</label>
              <input name="resetEmail" value={resetEmail}
                onChange={e => setResetEmail(e.target.value)} required />
            </div>
            <button className="auth-submit-btn" type="submit">Send Reset Link</button>
            {resetMsg && <div className="auth-error">{resetMsg}</div>}
            <button className="auth-switch-link" type="button" onClick={() => setShowReset(false)}>
              Back to Login
            </button>
            <button className="auth-switch-link" type="button" onClick={() => setShowSetNew(true)}>
              Have a token? Set new password
            </button>
          </form>
        </div>
      </section>
    );
  }

  // Set new password UI
  if (showSetNew) {
    return (
      <section className="auth-section">
        <div className="auth-card">
          <div className="auth-title">Set New Password</div>
          <form className="auth-form-grid" onSubmit={async e => {
            e.preventDefault();
            setSetMsg("");
            const res = await fetch('/api/auth/reset-password', {
              method: 'POST', headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: resetToken, password: newPassword })
            });
            const data = await res.json();
            setSetMsg(data.msg || "");
          }}>
            <div>
              <label className="auth-label">Reset Token</label>
              <input name="resetToken" value={resetToken}
                onChange={e => setResetToken(e.target.value)} required />
            </div>
            <div>
              <label className="auth-label">New Password</label>
              <input name="newPassword" type="password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <button className="auth-submit-btn" type="submit">Set New Password</button>
            {setMsg && <div className="auth-error">{setMsg}</div>}
            <button className="auth-switch-link" type="button" onClick={() => setShowSetNew(false)}>
              Cancel
            </button>
          </form>
        </div>
      </section>
    );
  }

  // Regular login/register UI with "Forgot password?" link
  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-title">{isLogin ? "Login" : "Register"}</div>
        <form className="auth-form-grid" onSubmit={handleSubmit}>
          <div>
            <label className="auth-label">Username *</label>
            <input
              name="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          {!isLogin && (
            <div>
              <label className="auth-label">Email *</label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          )}
          <div>
            <label className="auth-label">Password *</label>
            <input
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit-btn" type="submit">
            {isLogin ? "LOGIN" : "REGISTER"}
          </button>
        </form>
        <button
          className="auth-switch-link"
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
            setUsername("");
            setPassword("");
            setEmail("");
          }}>
          {isLogin ? "Create an account" : "Have an account? Login"}
        </button>
        <button
          className="auth-switch-link"
          onClick={() => {
            setShowReset(true);
            setError(""); setUsername(""); setPassword(""); setEmail("");
          }}>
          Forgot password?
        </button>
      </div>
    </section>
  );
};

export default AuthForm;
