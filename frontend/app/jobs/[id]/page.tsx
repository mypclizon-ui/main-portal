"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { applyToJob, getJob, getToken } from "@/lib/api";
import type { Job } from "@/lib/types";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = Number(params.id);
  const [job, setJob] = useState<Job | null>(null);
  const [cover, setCover] = useState("");
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const authed = typeof window !== "undefined" && !!getToken();

  useEffect(() => {
    getJob(jobId).then(setJob).catch((e) => setMessage({ ok: false, text: e.message }));
  }, [jobId]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!authed) {
      setMessage({ ok: false, text: "Please sign in to apply for this job." });
      return;
    }
    try {
      await applyToJob(jobId, cover);
      setApplied(true);
      setMessage({ ok: true, text: "Application submitted successfully!" });
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    }
  }

  if (!job) {
    return <section className="page"><div className="container">{message ? <p style={{color:"#a2171f"}}>{message.text}</p> : <p>Loading…</p>}</div></section>;
  }

  return (
    <section className="page">
      <div className="container" style={{ maxWidth: 860 }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span className="kicker">{job.category}</span>
          <h1>{job.title}</h1>
          <p style={{ color: "var(--ink-soft)" }}>
            {job.company && <>🏢 {job.company}</>}
            {job.location && <> · 📍 {job.location}</>}
            {job.salary && <> · 💰 {job.salary}</>}
            {job.job_type && <> · <span className="badge">{job.job_type.replace("-", " ")}</span></>}
          </p>

          {job.deadline && <p style={{ color: "#a2171f", fontWeight: 600 }}>Application deadline: {job.deadline}</p>}

          <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "1.4rem 0" }} />
          <h3>Job Description</h3>
          <p>{job.description}</p>

          {job.requirements && (
            <>
              <h3>Requirements</h3>
              <p>{job.requirements}</p>
            </>
          )}

          <div style={{ marginTop: "2rem", background: "var(--bg-soft)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "1.6rem" }}>
            {applied ? (
              <p style={{ color: "#14653a", fontWeight: 700 }}>✓ You&apos;ve applied to this job. Track it from your profile.</p>
            ) : (
              <form onSubmit={handleApply}>
                <h3>{authed ? "Apply for this Job" : "Sign in to Apply"}</h3>
                <div className="field">
                  <label htmlFor="cover">Cover Note (optional)</label>
                  <textarea id="cover" rows={4} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Why are you a good fit for this role?" />
                </div>
                <button className="btn btn--primary btn--block" type="submit">
                  {authed ? "Submit Application" : "Sign In to Apply"}
                </button>
                {!authed && (
                  <p style={{ fontSize: "0.85rem", marginTop: "0.6rem" }}>
                    <Link href="/login">Sign in</Link> or <Link href="/signup">create a free account</Link>.
                  </p>
                )}
              </form>
            )}
            {message && <p style={{ color: message.ok ? "#14653a" : "#a2171f", fontWeight: 600, marginTop: "0.8rem" }}>{message.text}</p>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}