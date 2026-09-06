"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { forgotPassword, login, resetPassword, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [resetMode, setResetMode] = useState(false);      // forgot/reset mode
  const [resetStep, setResetStep] = useState<"email"|"code">("email");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await login(email, password, rememberMe);
      setToken(res.access_token);
      router.push("/profile" as Route);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await forgotPassword(email);
      setInfo(res.reset_code
        ? `Reset code sent: ${res.reset_code} (demo — enter below)`
        : "If that email exists, a reset code is on its way.");
      setResetStep("code");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await resetPassword(email, resetCode, newPassword);
      setToken(res.access_token);
      router.push("/profile" as Route);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Forgot / Reset password view
  if (resetMode) {
    return (
      <section className="page">
        <div className="container" style={{ maxWidth: 460 }}>
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="section-head" style={{ marginBottom: "1.5rem" }}>
              <span className="kicker">Password Reset</span>
              <h2 className="section-title" style={{ fontSize: "1.7rem" }}>
                {resetStep === "email" ? "Reset Password" : "Enter Reset Code"}
              </h2>
            </div>

            {resetStep === "email" ? (
              <form onSubmit={handleForgot}>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required />
                </div>
                {error && <p style={{ color: "#a2171f", fontWeight: 600 }}>{error}</p>}
                {info && <p style={{ color: "#14653a", fontWeight: 600 }}>{info}</p>}
                <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
                  {busy ? "Sending…" : "Send Reset Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleReset}>
                <div className="field">
                  <label htmlFor="code">6-digit Reset Code</label>
                  <input id="code" value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)} required />
                </div>
                <div className="field">
                  <label htmlFor="np">New Password</label>
                  <input id="np" type="password" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                </div>
                {error && <p style={{ color: "#a2171f", fontWeight: 600 }}>{error}</p>}
                {info && <p style={{ color: "#14653a", fontWeight: 600 }}>{info}</p>}
                <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
                  {busy ? "Resetting…" : "Set New Password"}
                </button>
              </form>
            )}

            <p style={{ marginTop: "1rem", textAlign: "center" }}>
              <button type="button" className="link-btn"
                onClick={() => { setResetMode(false); setResetStep("email"); setError(null); setInfo(null); }}>
                ← Back to Sign In
              </button>
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  // Normal sign-in view
  return (
    <section className="page">
      <div className="container" style={{ maxWidth: 460 }}>
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="section-head" style={{ marginBottom: "1.5rem" }}>
            <span className="kicker">Welcome back</span>
            <h2 className="section-title" style={{ fontSize: "1.9rem" }}>Sign In</h2>
          </div>
          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", cursor: "pointer" }}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span style={{ fontSize: "0.92rem" }}>Remember me (30 days)</span>
            </label>
            {error && <p style={{ color: "#a2171f", fontWeight: 600 }}>{error}</p>}
            <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button type="button" className="link-btn" onClick={() => setResetMode(true)}>
              Forgot password?
            </button>
          </div>

          <div style={{ textAlign: "center", margin: "1.2rem 0 0.4rem", color: "var(--ink-soft)", fontSize: "0.85rem" }}>
            — or continue with —
          </div>
          <button type="button" className="btn btn--outline btn--block" onClick={() => alert("Google OAuth demo — add GOOGLE_CLIENT_ID + backend /auth/google to enable.")}>
            Continue with Google
          </button>

          <p style={{ marginTop: "1rem", textAlign: "center" }}>
            Don&apos;t have an account? <Link href="/signup">Sign up free</Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}