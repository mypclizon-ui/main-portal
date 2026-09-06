"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { setToken, signup } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await signup(email, fullName, password);
      setToken(res.access_token);
      router.push("/profile" as Route);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page">
      <div className="container" style={{ maxWidth: 500 }}>
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="section-head" style={{ marginBottom: "1.5rem" }}>
            <span className="kicker">Join the workforce</span>
            <h2 className="section-title" style={{ fontSize: "1.9rem" }}>Create Your Account</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="field">
              <label htmlFor="confirm">Confirm Password</label>
              <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
            </div>
            {error && <p style={{ color: "#a2171f", fontWeight: 600 }}>{error}</p>}
            <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
              {busy ? "Creating…" : "Sign Up Free"}
            </button>
          </form>
          <p style={{ marginTop: "1rem", textAlign: "center" }}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}