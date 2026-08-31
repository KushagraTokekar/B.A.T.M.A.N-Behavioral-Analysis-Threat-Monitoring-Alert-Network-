import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay"></div>

      <div className="login-card">
        <div className="login-badge">TACTICAL ACCESS</div>

        <h1>
           <span>BATMAN</span>
        </h1>

        <p>
          Behavioral Analysis, Threat Monitoring & Alert Network
        </p>

        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="operator@batman.net"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Access Password</label>
          <input
            type="password"
            placeholder="Enter secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button onClick={handleLogin}>
          ENTER COMMAND CENTER
        </button>

        <small>New to BATMAN? <Link to="/signup">Create an account</Link></small>
      </div>
    </div>
  );
}