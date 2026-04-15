import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <div className="auth-hero" aria-label="SaveSlot">
          <span>Save</span>
          <span>Slot</span>
        </div>

        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to your backlog</p>

          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleLogin}
            disabled={!email || !password || loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="auth-footer">
            No account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}