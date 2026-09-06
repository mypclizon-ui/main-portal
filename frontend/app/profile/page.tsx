"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { clearToken, getToken, me, myApplications, updateProfile, uploadCv } from "@/lib/api";
import type { Application, User } from "@/lib/types";

function StatusPill({ status }: { status: string }) {
  const label = status.replace("_", " ");
  return <span className={`status-pill status-${status}`}>{label}</span>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [form, setForm] = useState({ full_name: "", phone: "", skills: "", bio: "" });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login" as Route);
      return;
    }
    (async () => {
      try {
        const u = await me();
        setUser(u);
        setForm({ full_name: u.full_name, phone: u.phone || "", skills: u.skills || "", bio: u.bio || "" });
        const a = await myApplications();
        setApps(a);
      } catch (e) {
        clearToken();
        router.push("/login" as Route);
      } finally {
        setLoaded(true);
      }
    })();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    try {
      const u = await updateProfile({ ...form, phone: form.phone || null, skills: form.skills || null, bio: form.bio || null });
      setUser(u);
      setSaved(true);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const u = await uploadCv(file);
      setUser(u);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.push("/");
  }

  if (!loaded) return <section className="page"><div className="container"><p>Loading your profile…</p></div></section>;

  return (
    <section className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="kicker">Your Account</span>
            <h1 style={{ margin: 0 }}>{user?.full_name}</h1>
            <p style={{ color: "var(--ink-soft)", margin: 0 }}>{user?.email}</p>
          </div>
          <button className="btn btn--outline" onClick={handleLogout}>Sign Out</button>
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="card" style={{ marginBottom: "2rem" }}>
            <h3>Personal Profile</h3>
            <form onSubmit={handleSave}>
              <div className="field">
                <label htmlFor="name">Full Name</label>
                <input id="name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="skills">Skills (comma separated)</label>
                <input id="skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Sewing, Quality Control, Merchandising" />
              </div>
              <div className="field">
                <label htmlFor="bio">About you</label>
                <textarea id="bio" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              <button className="btn btn--primary" type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save Profile"}
              </button>
              {saved && <span style={{ color: "#14653a", marginLeft: "1rem", fontWeight: 600 }}>✓ Saved</span>}
            </form>
          </div>

          <div className="card" style={{ marginBottom: "2rem" }}>
            <h3>Upload Your CV</h3>
            <p style={{ color: "var(--ink-soft)" }}>
              {user?.cv_url
                ? <>Current CV: <a href={`/api${user.cv_url}`} target="_blank" rel="noopener">view your CV</a></>
                : "You haven't uploaded a CV yet."}
            </p>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleCv} disabled={busy} />
          </div>

          <div className="card">
            <h3>My Applications</h3>
            {apps.length === 0 ? (
              <p style={{ color: "var(--ink-soft)" }}>
                You haven&apos;t applied to any jobs yet. <Link href="/jobs">Browse jobs</Link>.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.8rem" }}>
                {apps.map((a) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", background: "var(--bg-soft)", flexWrap: "wrap" }}>
                    <div>
                      <strong>{a.snapshot?.title || a.job?.title}</strong>
                      <div style={{ color: "var(--ink-soft)", fontSize: "0.88rem" }}>
                        {a.snapshot?.company} · {a.snapshot?.location} · Applied {new Date(a.applied_at).toLocaleDateString()}
                      </div>
                    </div>
                    <StatusPill status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}