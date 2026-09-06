"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { listJobs } from "@/lib/api";
import type { Job } from "@/lib/types";
import JobCard from "./components/JobCard";

/**
 * Home page: hero + latest jobs with a smooth entrance animation.
 */
export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listJobs()
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <motion.div
          className="container"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="hero__title">Build Your Career with Confidence</h1>
          <p className="hero__sub">
            Connecting skilled workers with leading RMG factories, textile mills and
            export houses across Bangladesh. Find your next job in minutes — apply
            online, track your applications and upload your CV.
          </p>
          <div style={{ marginTop: "1.8rem", display: "flex", gap: "0.9rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="btn btn--primary" href="/jobs">Explore Jobs</Link>
            <Link className="btn btn--outline" style={{ borderColor: "#fff", color: "#fff" }} href="/signup">Create Free Account</Link>
          </div>
        </motion.div>
      </section>

      <section className="page">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Featured Openings</span>
            <h2 className="section-title">Latest Job Openings</h2>
          </div>

          {loading && <p>Loading jobs…</p>}
          {error && <p style={{ color: "#a2171f" }}>{error}</p>}
          {!loading && !error && jobs.length === 0 && <p>No jobs posted yet.</p>}

          <div className="jobs-grid">
            {jobs.slice(0, 6).map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}