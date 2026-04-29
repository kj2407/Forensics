import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../../components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "Email is required";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      {/* Grid lines background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#00d4ff 1px,transparent 1px),linear-gradient(90deg,#00d4ff 1px,transparent 1px)", backgroundSize: "50px 50px" }} />

      <motion.div
        className="w-full max-w-md relative"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-100 tracking-tight">ForensIQ</h1>
              <p className="text-[10px] text-gray-500 font-mono">CASE MANAGEMENT SYSTEM</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Sign in to access the investigation platform</p>
        </div>

        <div className="card p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email" className={`input ${errors.email ? "border-danger/60" : ""}`}
                placeholder="investigator@forensics.gov"
                value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
              />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password" className={`input ${errors.password ? "border-danger/60" : ""}`}
                placeholder="••••••••"
                value={form.password} onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }}
              />
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? <><Spinner size="sm" /> Authenticating...</> : "Sign In"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500">
              No account?{" "}
              <Link to="/register" className="text-primary hover:text-primary-300 font-medium transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 p-3 rounded-xl border border-white/5 bg-surface-50/50 text-center">
          <p className="text-xs text-gray-500 font-mono">Demo: admin@forensics.gov / any password after registering</p>
        </div>
      </motion.div>
    </div>
  );
}