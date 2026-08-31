import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try { await api.post("/auth/signup", form); navigate("/", { state: { message: "Account created. Sign in to continue." } }); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to create your account. Try again."); }
    finally { setLoading(false); }
  };
  return <main className="login-page"><form className="login-card" onSubmit={submit}><div className="login-badge">COMMUNITY ACCESS</div><h1><span>BATMAN</span></h1><p>Create an account to report and monitor verified local incidents.</p>{error && <p className="form-error" role="alert">{error}</p>}<div className="input-group"><label htmlFor="name">Name</label><input id="name" required minLength="2" maxLength="100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="input-group"><label htmlFor="email">Email address</label><input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div><div className="input-group"><label htmlFor="password">Password</label><input id="password" type="password" required minLength="12" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><small>Use at least 12 characters.</small></div><button disabled={loading}>{loading ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}</button><small>Already registered? <Link to="/">Sign in</Link></small></form></main>;
}
